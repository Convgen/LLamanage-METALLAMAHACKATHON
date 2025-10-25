/**
 * Example: Integrating AI & RAG into Dashboard Components
 * 
 * This file shows how to use the AI services in your React components
 */

import { useState, useEffect } from 'react'
import { 
  chatWithRAG, 
  generateChatCompletion,
  isHuggingFaceConfigured 
} from '../utils/aiService'
import { 
  processDocument
} from '../utils/documentProcessor'
import { storageHelpers, supabase } from '../utils/supabaseClient'

// ============================================
// EXAMPLE 1: Chat Interface with RAG
// ============================================

export function ChatInterfaceExample() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const userId = 'user-id-here' // TODO: Get from auth context

  const sendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Get conversation history (last 5 messages)
      const conversationHistory = messages.slice(-5)

      // Call AI with RAG
      const response = await chatWithRAG(userId, input, {
        systemPrompt: 'You are a helpful customer support assistant.',
        conversationHistory,
        useRAG: true,
      })

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: response.message,
        sources: response.sources, // Documents used for context
        hasContext: response.hasContext,
      }
      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[#75FDA8] text-[#2D2D2D]'
                  : 'bg-[#1F1F1F] text-white'
              }`}
            >
              <p>{msg.content}</p>
              
              {/* Show sources if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-400">
                    Sources: {msg.sources.length} document(s) used
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1F1F1F] text-white p-3 rounded-lg">
              <span className="animate-pulse">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#27705D]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 rounded-lg"
            style={{ backgroundColor: '#1F1F1F', color: 'white' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-lg transition-colors"
            style={{ backgroundColor: '#75FDA8' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// EXAMPLE 2: File Upload with Processing
// ============================================

export function FileUploadExample() {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ step: '', progress: 0 })
  const userId = 'user-id-here' // TODO: Get from auth context

  const handleFileUpload = async (file) => {
    setUploading(true)

    try {
      // Step 1: Upload to Supabase Storage
      console.log('Uploading file...')
      const uploadResult = await storageHelpers.uploadFile(userId, file)
      
      if (uploadResult.error) throw uploadResult.error

      const fileId = uploadResult.data.id

      // Step 2: Process document (extract text, embed, store)
      setProcessing(true)
      setProgress({ step: 'starting', progress: 0 })

      const result = await processDocument(
        userId,
        fileId,
        file,
        (progressUpdate) => {
          setProgress(progressUpdate)
          console.log(`Processing: ${progressUpdate.step} - ${progressUpdate.progress}%`)
        }
      )

      console.log('Processing complete!', result)
      alert(`Success! Processed ${result.chunksProcessed} chunks from your file.`)

    } catch (error) {
      console.error('File processing error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setUploading(false)
      setProcessing(false)
      setProgress({ step: '', progress: 0 })
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#75FDA8' }}>
        Upload & Process Documents
      </h2>

      {/* Drag & Drop Area */}
      <div
        className="border-2 border-dashed rounded-lg p-12 text-center"
        style={{ borderColor: '#27705D' }}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFileUpload(file)
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt,.pdf,.docx,.csv,.md,.json"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-lg mb-2">Drag & drop or click to upload</p>
          <p className="text-sm text-gray-400">
            Supports: TXT, PDF, DOCX, CSV, MD, JSON
          </p>
        </label>
      </div>

      {/* Progress */}
      {(uploading || processing) && (
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              {uploading && 'Uploading file...'}
              {processing && `Processing: ${progress.step}`}
            </span>
            <span className="text-sm text-gray-400">
              {progress.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                backgroundColor: '#75FDA8',
                width: `${progress.progress}%`,
              }}
            />
          </div>
          {progress.current && progress.total && (
            <p className="text-xs text-gray-400 mt-2">
              Processing chunk {progress.current} of {progress.total}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// EXAMPLE 3: Simple Chat (No RAG)
// ============================================

export function SimpleChatExample() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    setLoading(true)
    try {
      const aiResponse = await generateChatCompletion({
        userMessage: message,
        systemPrompt: 'You are a helpful assistant.',
        maxTokens: 256,
        temperature: 0.7,
      })

      setResponse(aiResponse)
    } catch (error) {
      console.error('Error:', error)
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#75FDA8' }}>
        Simple AI Chat (No RAG)
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything..."
          className="w-full px-4 py-3 rounded-lg"
          style={{ backgroundColor: '#1F1F1F', color: 'white' }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-6 py-3 rounded-lg transition-colors"
          style={{ backgroundColor: '#75FDA8' }}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>

        {response && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
            <p className="text-white">{response}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// EXAMPLE 4: Check Configuration
// ============================================

export function ConfigurationCheck() {
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    setConfigured(isHuggingFaceConfigured())
  }, [])

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: configured ? '#27705D' : '#8B0000' }}>
      <p className="font-medium">
        {configured 
          ? '✅ HuggingFace API is configured' 
          : '❌ HuggingFace API key not found'}
      </p>
      {!configured && (
        <p className="text-sm mt-2">
          Add VITE_HUGGINGFACE_API_KEY to your .env file
        </p>
      )}
    </div>
  )
}

// ============================================
// EXAMPLE 5: Document Preview with Embedding Status
// ============================================

export function DocumentListExample({ files }) {
  const [embeddingCounts, setEmbeddingCounts] = useState({})

  useEffect(() => {
    // Get embedding counts for each file
    const fetchEmbeddingCounts = async () => {
      const counts = {}
      for (const file of files) {
        const { data } = await supabase
          .from('document_embeddings')
          .select('id', { count: 'exact' })
          .eq('file_id', file.id)
        
        counts[file.id] = data?.length || 0
      }
      setEmbeddingCounts(counts)
    }

    if (files.length > 0) {
      fetchEmbeddingCounts()
    }
  }, [files])

  return (
    <div className="space-y-2">
      {files.map(file => (
        <div
          key={file.id}
          className="p-4 rounded-lg flex items-center justify-between"
          style={{ backgroundColor: '#1F1F1F' }}
        >
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-400">
              {embeddingCounts[file.id] > 0
                ? `✅ ${embeddingCounts[file.id]} chunks embedded`
                : '⏳ Processing...'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// USAGE IN DASHBOARD
// ============================================

/*
// In your Dashboard.jsx or ChatInterface.jsx:

import { ChatInterfaceExample } from './examples/AIIntegrationExamples'

// Inside your component:
<ChatInterfaceExample />

// Or integrate the logic into your existing components
*/
