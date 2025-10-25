/**
 * Backend AI Service - Calls Supabase Edge Functions
 * 
 * This replaces direct HuggingFace API calls from frontend
 * All AI processing happens on the backend (Edge Functions)
 */

import { supabase } from './supabaseClient.js'

// Get Supabase function URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

// ============================================
// CHAT WITH RAG (Backend)
// ============================================

/**
 * Send chat message - AI processing happens on backend
 * @param {string} message - User's message
 * @param {Object} options - Chat options
 * @returns {Promise<Object>} AI response with sources and tools used
 */
export async function sendChatMessage(message, options = {}) {
  try {
    const {
      conversationHistory = [],
      useRAG = true,
      enableTools = true, // Enable AI tools by default
      googleAccessToken = null, // Google OAuth token for calendar access
    } = options

    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    // Try to get Google OAuth token from session if not provided
    const googleToken = googleAccessToken || session.provider_token
    
    console.log('backendAI.js - Sending request with Google token:', googleToken ? 'Token present (length: ' + googleToken.length + ')' : 'NO TOKEN')

    // Call backend Edge Function
    const response = await fetch(`${FUNCTIONS_URL}/chat-completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        useRAG,
        enableTools, // Pass tools flag to backend
        googleAccessToken: googleToken, // Pass Google OAuth token to backend
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Chat request failed')
    }

    return {
      message: data.message,
      sources: data.sources || [],
      hasContext: data.hasContext || false,
      toolsUsed: data.toolsUsed || [], // Tools that were used by AI
    }

  } catch (error) {
    console.error('Chat error:', error)
    throw error
  }
}

// ============================================
// DOCUMENT PROCESSING (Backend)
// ============================================

/**
 * Process uploaded document - extraction and embedding happens on backend
 * @param {string} fileId - File ID from Supabase
 * @param {string} fileName - File name
 * @param {string} storagePath - Path in Supabase Storage
 * @param {Function} onProgress - Progress callback (not supported in v1)
 * @returns {Promise<Object>} Processing results
 */
export async function processDocumentBackend(fileId, fileName, storagePath, onProgress = null) {
  try {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    onProgress?.({ step: 'starting', progress: 0 })

    // Call backend Edge Function
    const response = await fetch(`${FUNCTIONS_URL}/process-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        fileName,
        storagePath,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Processing failed')
    }

    onProgress?.({ step: 'complete', progress: 100 })

    return {
      success: true,
      fileId: data.fileId,
      chunksProcessed: data.chunksProcessed,
      totalChunks: data.totalChunks,
      textLength: data.textLength,
    }

  } catch (error) {
    console.error('Document processing error:', error)
    
    // Mark file as failed in database
    await supabase
      .from('files')
      .update({
        processed: false,
        processing_error: error.message,
      })
      .eq('id', fileId)

    throw error
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if backend AI service is available
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    // Simple health check - try to call chat with minimal data
    const response = await fetch(`${FUNCTIONS_URL}/chat-completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'ping',
        useRAG: false,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

/**
 * Get chat history from database
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<Array>} Chat messages
 */
export async function getChatHistory(limit = 10) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Format for conversation history
    return (data || []).reverse().flatMap(msg => [
      { role: 'user', content: msg.message },
      { role: 'assistant', content: msg.response },
    ])

  } catch (error) {
    console.error('Get chat history error:', error)
    return []
  }
}

/**
 * Get processing status for a file
 * @param {string} fileId - File ID
 * @returns {Promise<Object|null>} Processing status
 */
export async function getFileProcessingStatus(fileId) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('processed, chunks_count, processing_error, processed_at')
      .eq('id', fileId)
      .single()

    if (error) throw error
    return data

  } catch (error) {
    console.error('Get processing status error:', error)
    return null
  }
}

/**
 * Get embedding count for user's files
 * @returns {Promise<number>} Total embeddings
 */
export async function getEmbeddingCount() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
      .from('document_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) throw error
    return count || 0

  } catch (error) {
    console.error('Get embedding count error:', error)
    return 0
  }
}

// Export for use in components
export const backendAI = {
  sendChatMessage,
  processDocument: processDocumentBackend,
  checkHealth: checkBackendHealth,
  getChatHistory,
  getFileStatus: getFileProcessingStatus,
  getEmbeddingCount,
}
