// Supabase Edge Function: chat-completion
// Handles AI chat with RAG using OpenRouter + HuggingFace
// Updated: Using OpenRouter for chat, HuggingFace for embeddings, with AI Tools

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { availableTools, executeTool } from './tools.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API configuration
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY')
// Using Google Gemini Flash - free tier with excellent function calling and no moderation issues
const CHAT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'
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

// Call OpenRouter API for chat (with tool support)
async function callOpenRouter(messages: any[], tools?: any[], toolChoice?: string) {
  const requestBody: any = {
    model: CHAT_MODEL,
    messages: messages,
  }
  
  // Add tools if provided
  if (tools && tools.length > 0) {
    requestBody.tools = tools
    requestBody.tool_choice = toolChoice || 'auto' // Let AI decide when to use tools
  }
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://llamanage.app',
      'X-Title': 'Llamanage',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenRouter API Error:', response.status, errorText)
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return result.choices[0].message // Return full message (includes tool_calls)
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

// Generate chat completion using OpenRouter (with tools)
async function generateChat(
  userMessage: string,
  contextDocs: any[],
  conversationHistory: any[],
  context: any,
  enableTools: boolean = true
) {
  const messages = []
  
  // System message with context
  let systemContent = 'You are a helpful AI customer support assistant for Llamanage.'
  systemContent += '\n\nIMPORTANT: You have access to function calling tools. When the user asks about calendar availability, business info, or needs help, you MUST use the appropriate tool by making a function call, NOT by writing the function name as text.'
  systemContent += '\n\nAvailable tools:'
  systemContent += '\n- check_calendar_availability: Check if user has free time on their calendar'
  systemContent += '\n- create_calendar_event: Create new calendar events'
  systemContent += '\n- search_knowledge_base: Search for information in documents'
  systemContent += '\n- get_business_info: Get company information'
  systemContent += '\n- create_support_ticket: Create support tickets'
  systemContent += '\n\nWhen user asks "am I free tomorrow at 1pm?" - USE the check_calendar_availability tool, don\'t just write about it.'
  systemContent += '\nAfter using a tool, respond naturally with the results in a conversational way.'
  
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
  
  // Call OpenRouter with tools
  const tools = enableTools ? availableTools : undefined
  const response = await callOpenRouter(messages, tools)
  
  // Check if AI wants to use a tool (proper function calling format)
  if (response.tool_calls && response.tool_calls.length > 0) {
    console.log('AI wants to use tools:', response.tool_calls.map((tc: any) => tc.function.name))
    
    // Execute tool calls
    const toolResults = []
    
    for (const toolCall of response.tool_calls) {
      const toolName = toolCall.function.name
      const toolArgs = JSON.parse(toolCall.function.arguments)
      
      console.log(`Executing tool: ${toolName}`, toolArgs)
      
      const result = await executeTool(toolName, toolArgs, context)
      console.log(`Tool ${toolName} result:`, result)
      
      toolResults.push({
        toolName,
        result
      })
      
      // Add tool result to messages
      messages.push({
        role: 'assistant',
        content: null,
        tool_calls: [toolCall]
      })
      
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      })
    }
    
    // Get final response after tool execution
    console.log('Getting final AI response after tool execution...')
    const finalResponse = await callOpenRouter(messages, tools)
    console.log('Final response:', finalResponse)
    
    return {
      content: finalResponse.content || finalResponse,
      toolsUsed: toolResults
    }
  }
  
  // FALLBACK: Parse text response for function calls (for models that don't use proper tool_calls)
  const content = response.content || ''
  console.log('Response content:', content)
  
  // Check if response contains a function call pattern like "function_name(param1="value", param2="value")"
  const functionCallPattern = /(\w+)\((.*?)\)/
  const match = content.match(functionCallPattern)
  
  if (match && enableTools) {
    const functionName = match[1]
    const paramsString = match[2]
    
    // Check if this is one of our available tools
    const toolNames = availableTools.map(t => t.function.name)
    if (toolNames.includes(functionName)) {
      console.log(`Detected text-based tool call: ${functionName}`)
      
      // Parse parameters from string like 'date="tomorrow", timeMin="14:00"'
      const toolArgs: any = {}
      const paramMatches = paramsString.matchAll(/(\w+)="([^"]+)"/g)
      for (const paramMatch of paramMatches) {
        toolArgs[paramMatch[1]] = paramMatch[2]
      }
      
      console.log(`Executing tool: ${functionName}`, toolArgs)
      
      // Execute the tool
      const result = await executeTool(functionName, toolArgs, context)
      console.log(`Tool ${functionName} result:`, result)
      
      // Generate natural language response based on tool result
      messages.push({
        role: 'assistant',
        content: content
      })
      
      messages.push({
        role: 'user',
        content: `The tool ${functionName} returned: ${JSON.stringify(result)}. Please respond naturally to the user based on this result.`
      })
      
      const finalResponse = await callOpenRouter(messages, undefined) // No tools on final call
      console.log('Final response after text-based tool:', finalResponse)
      
      return {
        content: finalResponse.content || finalResponse,
        toolsUsed: [{ toolName: functionName, result }]
      }
    }
  }
  
  console.log('No tools used, returning direct response')
  // No tools used, return content directly
  return {
    content: response.content || response,
    toolsUsed: []
  }
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
    const { message, conversationHistory = [], useRAG = true, enableTools = true, googleAccessToken = null } = await req.json()

    console.log('Edge Function received googleAccessToken:', googleAccessToken ? 'Token present (length: ' + googleAccessToken.length + ')' : 'NO TOKEN')

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

    // Prepare context for tool execution
    const toolContext = {
      supabase: supabaseClient,
      userId: user.id,
      userEmail: user.email,
      googleAccessToken: googleAccessToken, // Pass Google OAuth token to tools
      semanticSearch: (userId: string, query: string, topK: number) => 
        semanticSearch(supabaseClient, userId, query, topK)
    }

    // Generate AI response (with tools)
    const aiResult = await generateChat(message, contextDocs, conversationHistory, toolContext, enableTools)
    const aiResponse = aiResult.content

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
        toolsUsed: aiResult.toolsUsed || [], // Include which tools were used
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
