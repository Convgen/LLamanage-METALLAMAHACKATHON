/**
 * AI Service - HuggingFace Inference API Integration
 * Handles chat completions, embeddings, and RAG system
 */

import { supabase } from './supabaseClient.js'

// HuggingFace API Configuration
const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY
const HF_API_URL = 'https://api-inference.huggingface.co/models'

// Model configurations
const MODELS = {
  // Chat/Text Generation Models
  CHAT: 'meta-llama/Llama-3.3-70B-Instruct:groq', // Fast, good quality
  // CHAT: 'meta-llama/Llama-2-7b-chat-hf', // Alternative
  // CHAT: 'HuggingFaceH4/zephyr-7b-beta', // Another alternative
  
  // Embedding Models
  EMBEDDINGS: 'sentence-transformers/all-MiniLM-L6-v2', // Fast, 384 dimensions
  // EMBEDDINGS: 'BAAI/bge-small-en-v1.5', // Alternative, 384 dimensions
}

// API call with retry logic
async function callHuggingFaceAPI(modelId, payload, options = {}) {
  const maxRetries = options.maxRetries || 3
  const retryDelay = options.retryDelay || 2000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${HF_API_URL}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      // Handle model loading (503)
      if (response.status === 503) {
        const result = await response.json()
        if (result.error && result.error.includes('loading')) {
          console.log(`Model loading, attempt ${attempt}/${maxRetries}...`)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
            continue
          }
        }
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`HuggingFace API call failed (attempt ${attempt}):`, error)
      if (attempt === maxRetries) throw error
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
}

// ============================================
// CHAT COMPLETION
// ============================================

/**
 * Generate chat completion with context
 * @param {string} userMessage - User's message
 * @param {string} systemPrompt - System instructions
 * @param {Array} contextDocs - Relevant documents for RAG
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<string>} AI response
 */
export async function generateChatCompletion({
  userMessage,
  systemPrompt = 'You are a helpful AI assistant.',
  contextDocs = [],
  conversationHistory = [],
  maxTokens = 512,
  temperature = 0.7,
}) {
  try {
    // Build context from relevant documents (RAG)
    let contextText = ''
    if (contextDocs.length > 0) {
      contextText = '\n\nRelevant information:\n'
      contextDocs.forEach((doc, idx) => {
        contextText += `[${idx + 1}] ${doc.content}\n`
      })
    }

    // Build conversation history
    let historyText = ''
    if (conversationHistory.length > 0) {
      historyText = '\n\nPrevious conversation:\n'
      conversationHistory.slice(-5).forEach(msg => { // Last 5 messages
        historyText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
      })
    }

    // Construct full prompt
    const fullPrompt = `${systemPrompt}${contextText}${historyText}

User: ${userMessage}
Assistant:`

    // Call HuggingFace API
    const result = await callHuggingFaceAPI(MODELS.CHAT, {
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.95,
        repetition_penalty: 1.2,
        return_full_text: false,
      },
    })

    // Extract response
    const response = Array.isArray(result) ? result[0]?.generated_text : result.generated_text
    return response?.trim() || 'I apologize, but I could not generate a response.'

  } catch (error) {
    console.error('Chat completion error:', error)
    throw new Error(`Failed to generate response: ${error.message}`)
  }
}

// ============================================
// EMBEDDINGS
// ============================================

/**
 * Generate embeddings for text
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Embedding vector
 */
export async function generateEmbedding(text) {
  try {
    const result = await callHuggingFaceAPI(MODELS.EMBEDDINGS, {
      inputs: text,
      options: {
        wait_for_model: true,
      },
    })

    // HuggingFace returns embeddings in different formats depending on the model
    const embedding = Array.isArray(result) ? result : result.embeddings || result[0]
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding format received')
    }

    return embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {Array<string>} texts - Array of texts
 * @returns {Promise<Array<Array<number>>>} Array of embeddings
 */
export async function generateEmbeddingsBatch(texts) {
  try {
    // Process in parallel with rate limiting
    const batchSize = 5
    const results = []

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(text => generateEmbedding(text))
      )
      results.push(...batchResults)
      
      // Small delay to avoid rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    return results
  } catch (error) {
    console.error('Batch embedding error:', error)
    throw error
  }
}

// ============================================
// RAG SYSTEM - Vector Search
// ============================================

/**
 * Store document embedding in Supabase
 * @param {string} userId - User ID
 * @param {string} fileId - File ID
 * @param {string} content - Text content
 * @param {Array<number>} embedding - Embedding vector
 * @param {Object} metadata - Additional metadata
 */
export async function storeEmbedding(userId, fileId, content, embedding, metadata = {}) {
  try {
    const { data, error } = await supabase
      .from('document_embeddings')
      .insert({
        user_id: userId,
        file_id: fileId,
        content: content,
        embedding: embedding,
        metadata: metadata,
      })
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Store embedding error:', error)
    throw error
  }
}

/**
 * Semantic search - find relevant documents
 * @param {string} userId - User ID
 * @param {string} query - Search query
 * @param {number} topK - Number of results
 * @returns {Promise<Array>} Relevant documents
 */
export async function semanticSearch(userId, query, topK = 5) {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Call Supabase RPC function for vector similarity search
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // Similarity threshold (0-1)
      match_count: topK,
      filter_user_id: userId,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Semantic search error:', error)
    throw error
  }
}

/**
 * Get relevant context for RAG
 * @param {string} userId - User ID
 * @param {string} query - User query
 * @param {number} topK - Number of documents
 * @returns {Promise<Array>} Context documents
 */
export async function getRelevantContext(userId, query, topK = 3) {
  try {
    const results = await semanticSearch(userId, query, topK)
    
    // Format results for RAG
    return results.map(result => ({
      content: result.content,
      similarity: result.similarity,
      metadata: result.metadata,
      fileId: result.file_id,
    }))
  } catch (error) {
    console.error('Get relevant context error:', error)
    return [] // Return empty array on error, don't break chat
  }
}

// ============================================
// CHAT WITH RAG
// ============================================

/**
 * Generate AI response with RAG
 * @param {string} userId - User ID
 * @param {string} userMessage - User's message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Response with AI message and sources
 */
export async function chatWithRAG(userId, userMessage, options = {}) {
  try {
    const {
      systemPrompt = 'You are a helpful AI assistant. Answer questions based on the provided context.',
      conversationHistory = [],
      useRAG = true,
    } = options

    let contextDocs = []
    let sources = []

    // Get relevant context if RAG enabled
    if (useRAG) {
      contextDocs = await getRelevantContext(userId, userMessage, 3)
      sources = contextDocs.map(doc => ({
        fileId: doc.fileId,
        similarity: doc.similarity,
        preview: doc.content.substring(0, 100) + '...',
      }))
    }

    // Generate response
    const aiResponse = await generateChatCompletion({
      userMessage,
      systemPrompt,
      contextDocs,
      conversationHistory,
      maxTokens: 512,
      temperature: 0.7,
    })

    return {
      message: aiResponse,
      sources: sources,
      hasContext: contextDocs.length > 0,
    }
  } catch (error) {
    console.error('Chat with RAG error:', error)
    throw error
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if HuggingFace API is configured
 * @returns {boolean}
 */
export function isHuggingFaceConfigured() {
  return !!HF_API_KEY && HF_API_KEY !== 'placeholder-key'
}

/**
 * Test HuggingFace connection
 * @returns {Promise<boolean>}
 */
export async function testHuggingFaceConnection() {
  try {
    const result = await generateChatCompletion({
      userMessage: 'Hello!',
      systemPrompt: 'You are a helpful assistant.',
      maxTokens: 50,
    })
    return !!result
  } catch (error) {
    console.error('HuggingFace connection test failed:', error)
    return false
  }
}

// Export models info
export const AI_MODELS = MODELS
