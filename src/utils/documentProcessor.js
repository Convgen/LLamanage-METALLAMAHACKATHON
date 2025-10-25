/**
 * Document Processing Service
 * Extracts text from various file formats and processes for RAG
 */

import { generateEmbedding, storeEmbedding } from './aiService.js'
import { supabase } from './supabaseClient.js'

// ============================================
// TEXT EXTRACTION
// ============================================

/**
 * Extract text from file based on type
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromFile(file) {
  const fileType = file.type || getFileTypeFromName(file.name)

  switch (true) {
    case fileType.includes('text/plain'):
    case file.name.endsWith('.txt'):
      return await extractTextFromPlainText(file)

    case fileType.includes('text/csv'):
    case file.name.endsWith('.csv'):
      return await extractTextFromCSV(file)

    case fileType.includes('text/markdown'):
    case file.name.endsWith('.md'):
      return await extractTextFromMarkdown(file)

    case fileType.includes('application/json'):
    case file.name.endsWith('.json'):
      return await extractTextFromJSON(file)

    // Note: PDF and DOCX require external libraries (added below)
    case fileType.includes('application/pdf'):
    case file.name.endsWith('.pdf'):
      return await extractTextFromPDF(file)

    case fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'):
    case file.name.endsWith('.docx'):
      return await extractTextFromDOCX(file)

    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

/**
 * Get file type from filename
 */
function getFileTypeFromName(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes = {
    txt: 'text/plain',
    csv: 'text/csv',
    md: 'text/markdown',
    json: 'application/json',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return mimeTypes[ext] || 'text/plain'
}

/**
 * Extract text from plain text file
 */
async function extractTextFromPlainText(file) {
  return await file.text()
}

/**
 * Extract text from CSV
 */
async function extractTextFromCSV(file) {
  const text = await file.text()
  const lines = text.split('\n')
  
  // Convert CSV to readable text
  const headers = lines[0]?.split(',') || []
  const rows = lines.slice(1)
  
  let result = `Table with columns: ${headers.join(', ')}\n\n`
  rows.forEach((row, idx) => {
    if (row.trim()) {
      result += `Row ${idx + 1}: ${row}\n`
    }
  })
  
  return result
}

/**
 * Extract text from Markdown
 */
async function extractTextFromMarkdown(file) {
  const text = await file.text()
  // Remove markdown syntax for cleaner embedding
  return text
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
}

/**
 * Extract text from JSON
 */
async function extractTextFromJSON(file) {
  const text = await file.text()
  const json = JSON.parse(text)
  
  // Convert JSON to readable text
  function jsonToText(obj, prefix = '') {
    let result = ''
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += jsonToText(value, `${prefix}${key}.`)
      } else {
        result += `${prefix}${key}: ${value}\n`
      }
    }
    return result
  }
  
  return jsonToText(json)
}

/**
 * Extract text from PDF
 * Note: This is a placeholder. For production, use pdf-parse or pdfjs-dist
 */
async function extractTextFromPDF(file) {
  // For now, we'll use a client-side approach with PDF.js
  // You'll need to: npm install pdfjs-dist
  
  try {
    // Dynamic import to avoid bundling issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += `\n\n--- Page ${i} ---\n${pageText}`
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('PDF extraction requires pdfjs-dist library. Please install: npm install pdfjs-dist')
  }
}

/**
 * Extract text from DOCX
 * Note: This is a placeholder. For production, use mammoth.js
 */
async function extractTextFromDOCX(file) {
  try {
    // Dynamic import
    const mammoth = await import('mammoth')
    
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    return result.value
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error('DOCX extraction requires mammoth library. Please install: npm install mammoth')
  }
}

// ============================================
// TEXT CHUNKING
// ============================================

/**
 * Split text into chunks for embedding
 * @param {string} text - Full text
 * @param {number} chunkSize - Max characters per chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {Array<string>} Text chunks
 */
export function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = []

  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/)
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph

    if (testChunk.length > chunkSize && currentChunk) {
      // Save current chunk and start new one with overlap
      chunks.push(currentChunk.trim())
      
      // Start new chunk with last part of previous (overlap)
      const overlapText = currentChunk.slice(-overlap)
      currentChunk = overlapText + '\n\n' + paragraph
    } else {
      currentChunk = testChunk
    }
  }

  // Add last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter(chunk => chunk.length > 50) // Filter very small chunks
}

/**
 * Split text by sentences for better semantic chunking
 */
export function chunkBySentences(text, maxChunkSize = 1000) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence.trim()

    if (testChunk.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence.trim()
    } else {
      currentChunk = testChunk
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter(chunk => chunk.length > 50)
}

// ============================================
// DOCUMENT PROCESSING PIPELINE
// ============================================

/**
 * Process uploaded file - extract text, chunk, embed, and store
 * @param {string} userId - User ID
 * @param {string} fileId - File ID from Supabase
 * @param {File} file - File object
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Processing results
 */
export async function processDocument(userId, fileId, file, onProgress = null) {
  try {
    // Step 1: Extract text
    onProgress?.({ step: 'extracting', progress: 0 })
    const text = await extractTextFromFile(file)
    
    if (!text || text.length < 10) {
      throw new Error('No text could be extracted from file')
    }

    // Step 2: Chunk text
    onProgress?.({ step: 'chunking', progress: 30 })
    const chunks = chunkText(text, 1000, 200)
    
    console.log(`Extracted ${text.length} characters, split into ${chunks.length} chunks`)

    // Step 3: Generate embeddings for each chunk
    onProgress?.({ step: 'embedding', progress: 40 })
    const embeddingPromises = chunks.map(async (chunk, idx) => {
      try {
        const embedding = await generateEmbedding(chunk)
        
        // Store in Supabase
        await storeEmbedding(userId, fileId, chunk, embedding, {
          chunk_index: idx,
          total_chunks: chunks.length,
          file_name: file.name,
          file_type: file.type,
        })

        // Update progress
        const progressPercent = 40 + Math.floor((idx / chunks.length) * 50)
        onProgress?.({ step: 'embedding', progress: progressPercent, current: idx + 1, total: chunks.length })

        return { success: true, chunk_index: idx }
      } catch (error) {
        console.error(`Error processing chunk ${idx}:`, error)
        return { success: false, chunk_index: idx, error: error.message }
      }
    })

    const results = await Promise.all(embeddingPromises)
    const successful = results.filter(r => r.success).length

    // Step 4: Update file metadata
    onProgress?.({ step: 'finalizing', progress: 95 })
    await supabase
      .from('files')
      .update({
        processed: true,
        chunks_count: chunks.length,
        processed_at: new Date().toISOString(),
      })
      .eq('id', fileId)

    onProgress?.({ step: 'complete', progress: 100 })

    return {
      success: true,
      fileId,
      chunksProcessed: successful,
      totalChunks: chunks.length,
      textLength: text.length,
    }

  } catch (error) {
    console.error('Document processing error:', error)
    
    // Mark file as failed
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

/**
 * Reprocess a file (if processing failed or needs update)
 */
export async function reprocessDocument(userId, fileId) {
  try {
    // Get file metadata from Supabase
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single()

    if (fileError) throw fileError

    // Delete existing embeddings
    await supabase
      .from('document_embeddings')
      .delete()
      .eq('file_id', fileId)

    // Download file from storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('user-files')
      .download(fileData.storage_path)

    if (downloadError) throw downloadError

    // Convert blob to File object
    const file = new File([fileBlob], fileData.file_name, { type: fileData.file_type })

    // Process document
    return await processDocument(userId, fileId, file)
  } catch (error) {
    console.error('Reprocess document error:', error)
    throw error
  }
}

/**
 * Get processing status for a file
 */
export async function getProcessingStatus(fileId) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('processed, chunks_count, processing_error')
      .eq('id', fileId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get processing status error:', error)
    return null
  }
}

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * Process multiple files in batch
 */
export async function processDocumentsBatch(userId, files, onProgress = null) {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      onProgress?.({ 
        file: file.name, 
        fileIndex: i, 
        totalFiles: files.length 
      })

      // Upload file first (this should be done separately, but including for completeness)
      // Assume fileId is obtained after upload
      
      const result = await processDocument(userId, file.id, file, (progress) => {
        onProgress?.({
          ...progress,
          file: file.name,
          fileIndex: i,
          totalFiles: files.length,
        })
      })

      results.push({ file: file.name, success: true, ...result })
    } catch (error) {
      results.push({ file: file.name, success: false, error: error.message })
    }
  }

  return results
}
