// Supabase Edge Function: chat-completion
// Handles AI chat with RAG using OpenRouter + HuggingFace
// Updated: Using OpenRouter for chat, HuggingFace for embeddings

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API configuration
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY')
const CHAT_MODEL = 'meta-llama/llama-3.3-8b-instruct:free'
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2' // Back to reliable model

// Call HuggingFace API for embeddings
async function callHF(payload: any) {
  const response = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('HF API Error:', response.status, errorText)
    throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

// Generate embedding using HuggingFace (simple and reliable)
async function generateEmbedding(text: string) {
  const result = await callHF({ 
    inputs: text,
    options: { wait_for_model: true }
  })
  
  // Returns embedding array directly
  return Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result
}

// Call OpenRouter API for chat
async function callOpenRouter(messages: any[]) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://llamanage.app',
      'X-Title': 'Llamanage',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenRouter API Error:', response.status, errorText)
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return result.choices[0].message.content
}

// Semantic search
async function semanticSearch(supabase: any, userId: string, query: string, topK = 3) {
  const queryEmbedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: topK,
    filter_user_id: userId,
  })

  if (error) throw error
  return data || []
}

// Generate chat completion using OpenRouter
async function generateChat(userMessage: string, contextDocs: any[], conversationHistory: any[]) {
  const messages = []
  
  // System message with context
  let systemContent = 'You are a helpful AI customer support assistant.'
  
  if (contextDocs.length > 0) {
    systemContent += '\n\nRelevant information from documents:\n'
    contextDocs.forEach((doc, idx) => {
      systemContent += `[${idx + 1}] ${doc.content}\n`
    })
    systemContent += '\nUse this information to answer the user\'s questions accurately.'
  }
  
  messages.push({
    role: 'system',
    content: systemContent
  })
  
  // Add conversation history
  if (conversationHistory.length > 0) {
    conversationHistory.slice(-5).forEach((msg: any) => {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    })
  }
  
  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage
  })
  
  return await callOpenRouter(messages)
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { message, conversationHistory = [], useRAG = true } = await req.json()

    if (!message) {
      throw new Error('Message is required')
    }

    let contextDocs = []
    let sources = []

    // Get relevant context if RAG enabled
    if (useRAG) {
      contextDocs = await semanticSearch(supabaseClient, user.id, message, 3)
      sources = contextDocs.map((doc: any) => ({
        fileId: doc.file_id,
        similarity: doc.similarity,
        preview: doc.content.substring(0, 100) + '...',
      }))
    }

    // Generate AI response
    const aiResponse = await generateChat(message, contextDocs, conversationHistory)

    // Save chat message to database
    await supabaseClient.from('chat_messages').insert({
      user_id: user.id,
      message: message,
      response: aiResponse,
      sources: sources,
    })

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        message: aiResponse,
        sources: sources,
        hasContext: contextDocs.length > 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
