// Supabase Edge Function: process-document
// Handles document text extraction, chunking, embedding, and storage
// Updated: Fixed embedding input format for sentence-transformers

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY')
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2' // Back to reliable model

// Generate embedding using simple feature-extraction
async function generateEmbedding(text: string) {
  const response = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true }
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('HF Embedding Error:', response.status, errorText)
    throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`)
  }
  
  const result = await response.json()
  // Returns embedding array directly
  return Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result
}

// Extract text from file (simplified for Edge Functions)
async function extractText(file: Blob, fileName: string): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase()

  if (ext === 'txt' || ext === 'md') {
    return await file.text()
  } else if (ext === 'json') {
    const text = await file.text()
    const json = JSON.parse(text)
    return JSON.stringify(json, null, 2)
  } else if (ext === 'csv') {
    const text = await file.text()
    return text // Basic CSV handling
  }

  throw new Error(`Unsupported file type: ${ext}`)
}

// Chunk text
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  const paragraphs = text.split(/\n\n+/)
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph

    if (testChunk.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      const overlapText = currentChunk.slice(-overlap)
      currentChunk = overlapText + '\n\n' + paragraph
    } else {
      currentChunk = testChunk
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter(chunk => chunk.length > 50)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { fileId, fileName, storagePath } = await req.json()

    if (!fileId || !storagePath) {
      throw new Error('fileId and storagePath are required')
    }

    // Download file from storage
    const { data: fileBlob, error: downloadError } = await supabaseClient.storage
      .from('user-files')
      .download(storagePath)

    if (downloadError) throw downloadError

    // Extract text
    const text = await extractText(fileBlob, fileName)
    if (!text || text.length < 10) {
      throw new Error('No text could be extracted from file')
    }

    // Chunk text
    const chunks = chunkText(text, 1000, 200)
    console.log(`Processing ${chunks.length} chunks`)

    // Process each chunk
    let processed = 0
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      try {
        // Generate embedding
        const embedding = await generateEmbedding(chunk)

        // Store in database
        await supabaseClient.from('document_embeddings').insert({
          user_id: user.id,
          file_id: fileId,
          content: chunk,
          embedding: embedding,
          metadata: {
            chunk_index: i,
            total_chunks: chunks.length,
            file_name: fileName,
          },
        })

        processed++
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error)
      }

      // Small delay to avoid rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Update file metadata
    await supabaseClient.from('files').update({
      processed: true,
      chunks_count: processed,
      processed_at: new Date().toISOString(),
    }).eq('id', fileId)

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        chunksProcessed: processed,
        totalChunks: chunks.length,
        textLength: text.length,
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
