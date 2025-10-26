import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using mock mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Authentication helpers
export const authHelpers = {
  // Sign up new user
  signUp: async (email, password, companyName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName
        }
      }
    })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    })
    return { data, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const dbHelpers = {
  // Profile operations
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Flow operations
  getFlows: async (userId) => {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getFlow: async (flowId) => {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .single()
    return { data, error }
  },

  createFlow: async (userId, flowData) => {
    const { data, error } = await supabase
      .from('flows')
      .insert({
        user_id: userId,
        flow_name: flowData.flowName,
        nodes: flowData.nodes,
        edges: flowData.edges
      })
      .select()
      .single()
    return { data, error }
  },

  updateFlow: async (flowId, flowData) => {
    const { data, error } = await supabase
      .from('flows')
      .update({
        flow_name: flowData.flowName,
        nodes: flowData.nodes,
        edges: flowData.edges,
        updated_at: new Date().toISOString()
      })
      .eq('id', flowId)
      .select()
      .single()
    return { data, error }
  },

  deleteFlow: async (flowId) => {
    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', flowId)
    return { error }
  },

  // File operations
  getFiles: async (userId) => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createFileRecord: async (userId, fileData) => {
    const { data, error } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        file_name: fileData.fileName,
        original_name: fileData.originalName,
        file_size: fileData.fileSize,
        file_type: fileData.fileType,
        storage_path: fileData.storagePath
      })
      .select()
      .single()
    return { data, error }
  },

  deleteFile: async (fileId) => {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
    return { error }
  },

  // Chat message operations
  getChatMessages: async (userId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  createChatMessage: async (userId, message, role) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message,
        role
      })
      .select()
      .single()
    return { data, error }
  },

  // Business info operations
  getBusinessInfo: async (userId) => {
    const { data, error } = await supabase
      .from('business_info')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  upsertBusinessInfo: async (userId, businessData) => {
    const { data, error } = await supabase
      .from('business_info')
      .upsert({
        user_id: userId,
        company_name: businessData.company_name,
        services: businessData.services,
        description: businessData.description,
        faqs: businessData.faqs,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  // Document embeddings (for AI/RAG)
  createEmbedding: async (userId, fileId, content, embedding, metadata) => {
    const { data, error } = await supabase
      .from('document_embeddings')
      .insert({
        user_id: userId,
        file_id: fileId,
        content,
        embedding,
        metadata
      })
      .select()
      .single()
    return { data, error }
  },

  searchSimilarDocuments: async (userId, queryEmbedding, threshold = 0.7, limit = 5) => {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_user_id: userId
    })
    return { data, error }
  },

  // AI Settings operations
  getAISettings: async (userId) => {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  updateAISettings: async (userId, settings) => {
    const { data, error } = await supabase
      .from('ai_settings')
      .upsert({
        user_id: userId,
        system_prompt: settings.systemPrompt,
        personality: settings.personality,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        voice_id: settings.voiceId,
        language: settings.language,
        response_style: settings.responseStyle,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()
    return { data, error }
  },

  createDefaultAISettings: async (userId) => {
    const { data, error } = await supabase
      .from('ai_settings')
      .insert({
        user_id: userId
      })
      .select()
      .single()
    return { data, error }
  }
}

// Storage helpers
export const storageHelpers = {
  // Upload file to Supabase Storage
  uploadFile: async (userId, file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error } = await supabase.storage
      .from('user-files')
      .upload(filePath, file)

    if (error) return { data: null, error }

    return {
      data: {
        path: filePath,
        fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type
      },
      error: null
    }
  },

  // Delete file from Supabase Storage
  deleteFile: async (filePath) => {
    const { error } = await supabase.storage
      .from('user-files')
      .remove([filePath])
    return { error }
  },

  // Get public URL for file
  getPublicUrl: (filePath) => {
    const { data: { publicUrl } } = supabase.storage
      .from('user-files')
      .getPublicUrl(filePath)
    return publicUrl
  },

  // Get signed URL for private file (expires in 1 hour)
  getSignedUrl: async (filePath) => {
    const { data, error } = await supabase.storage
      .from('user-files')
      .createSignedUrl(filePath, 3600)
    return { data, error }
  },

  // Download file
  downloadFile: async (filePath) => {
    const { data, error } = await supabase.storage
      .from('user-files')
      .download(filePath)
    return { data, error }
  }
}

// Real-time subscription helpers
export const realtimeHelpers = {
  // Subscribe to flow changes
  subscribeToFlows: (userId, callback) => {
    return supabase
      .channel('flows-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flows',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to chat messages
  subscribeToChatMessages: (userId, callback) => {
    return supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Unsubscribe from channel
  unsubscribe: (channel) => {
    return supabase.removeChannel(channel)
  }
}

export default supabase
