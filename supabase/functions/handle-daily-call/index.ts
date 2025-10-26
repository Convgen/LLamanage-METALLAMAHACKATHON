/**
 * Daily.co Voice AI Handler
 * 
 * Handles incoming voice calls from patients via Daily.co
 * Transcribes audio → sends to AI agent → responds with TTS
 * 
 * Note: Webhook route bypasses Supabase auth to allow Daily.co webhooks
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Daily.co API configuration
const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY') || ''
const DAILY_API_URL = 'https://api.daily.co/v1'

// Text-to-Speech using ElevenLabs (or OpenAI TTS)
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') || ''

interface DailyCallEvent {
  type: string // Daily.co event types: 'participant.joined', 'transcript.ready-to-download', etc.
  roomName?: string
  room?: string
  participantId?: string
  participant?: {
    id: string
    user_id?: string
  }
  transcription?: {
    text: string
    is_final?: boolean
    participant_id?: string
  }
  data?: any // Additional event data from Daily.co
}

/**
 * Start transcription for a Daily.co room
 */
async function startTranscription(roomName: string) {
  console.log('🎤 Starting transcription for room:', roomName)
  
  const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}/transcription`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instance_id: roomName, // Use room name as instance ID
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to start transcription:', error)
    throw new Error(`Failed to start transcription: ${error}`)
  }

  const data = await response.json()
  console.log('✅ Transcription started:', data)
  return data
}

/**
 * Create a Daily.co room for incoming call
 */
async function createDailyRoom(businessId: string) {
  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      privacy: 'public',
      properties: {
        enable_recording: 'cloud', // Record calls for compliance
        enable_transcription: true, // Enable real-time transcription
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        max_participants: 2, // Patient + AI bot
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create Daily.co room')
  }

  return await response.json()
}

/**
 * Text-to-Speech using ElevenLabs
 */
async function textToSpeech(text: string, voiceId: string = 'EXAVITQu4vr4xnSDxMaL') {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Supports 50+ languages
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Text-to-speech failed')
  }

  return await response.arrayBuffer()
}

/**
 * Send audio to Daily.co room
 */
async function sendAudioToRoom(roomName: string, audioData: ArrayBuffer) {
  // Convert audio to base64
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData)))

  const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}/send-audio`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio: base64Audio,
      format: 'mp3',
    }),
  })

  return response.ok
}

/**
 * Process incoming call and handle conversation
 */
async function handleCall(supabaseClient: any, event: DailyCallEvent) {
  const roomName = event.roomName || event.room || ''
  const eventType = event.type

  console.log('📞 Daily.co event:', eventType, 'Room:', roomName, 'Full event:', JSON.stringify(event))

  // Get business info from room metadata
  const { data: room } = await supabaseClient
    .from('voice_calls')
    .select('business_id, user_id')
    .eq('room_name', roomName)
    .single()

  if (!room) {
    console.error('❌ Room not found in database:', roomName)
    return
  }

  // Handle different event types from Daily.co
  switch (eventType) {
    case 'participant.joined':
      console.log('👤 Participant joined:', event.participant?.id)
      
      // Start transcription when first participant joins
      try {
        await startTranscription(roomName)
        
        // Play welcome message after starting transcription
        const welcomeText = 'Hello! Welcome to our health tourism service. How can I help you today?'
        const welcomeAudio = await textToSpeech(welcomeText)
        await sendAudioToRoom(roomName, welcomeAudio)

        // Log call start
        await supabaseClient.from('voice_calls').update({
          status: 'active',
          started_at: new Date().toISOString(),
        }).eq('room_name', roomName)
        
        console.log('✅ Welcome message sent')
      } catch (error) {
        console.error('Error starting transcription:', error)
      }
      break

    case 'transcript.started':
      console.log('🎤 Transcription started for room:', roomName)
      break

    case 'transcript.ready-to-download':
      // This event contains the transcribed text
      console.log('📝 Transcript ready:', event.data)
      
      // Extract transcript text from event
      const transcriptText = event.data?.transcript || event.transcription?.text
      
      if (transcriptText && transcriptText.trim()) {
        console.log('Patient said:', transcriptText)

        try {
          // Call AI agent (reuse existing chat-completion function)
          const aiResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/chat-completion`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({
                message: transcriptText,
                conversationHistory: [], // Load from DB if needed
                useRAG: true,
                enableTools: true,
                businessId: room.business_id, // Pass business context
              }),
            }
          )

          const aiData = await aiResponse.json()
          console.log('🤖 AI response:', aiData.message)

          // Convert AI response to speech
          const responseAudio = await textToSpeech(aiData.message)

          // Send audio back to room
          await sendAudioToRoom(roomName, responseAudio)
          console.log('🔊 Audio sent to room')

          // Save conversation to database
          await supabaseClient.from('voice_call_messages').insert({
            room_name: roomName,
            user_id: room.user_id,
            role: 'user',
            message: transcriptText,
          })

          await supabaseClient.from('voice_call_messages').insert({
            room_name: roomName,
            user_id: room.user_id,
            role: 'assistant',
            message: aiData.message,
          })
        } catch (error) {
          console.error('Error processing transcript:', error)
        }
      }
      break

    case 'participant.left':
      console.log('👋 Participant left:', event.participant?.id)
      
      // Mark call as ended when last participant leaves
      await supabaseClient.from('voice_calls').update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      }).eq('room_name', roomName)

      console.log('Call ended:', roomName)
      break

    case 'transcript.error':
      console.error('❌ Transcription error:', event.data)
      break

    case 'recording.started':
      console.log('⏺️ Recording started for room:', roomName)
      break

    case 'recording.ready-to-download':
      console.log('📹 Recording ready for room:', roomName)
      break

    case 'recording.error':
      console.error('❌ Recording error:', event.data)
      break

    default:
      console.log('⚠️ Unhandled event type:', eventType)
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    // Route: Handle Daily.co webhook (NO AUTH REQUIRED - Daily.co doesn't send auth headers)
    if (action === 'webhook') {
      // Support both GET (for Daily.co verification) and POST (for actual webhooks)
      if (req.method === 'GET') {
        console.log('📞 Webhook verification (GET)')
        return new Response(
          JSON.stringify({ success: true, message: 'Webhook endpoint ready' }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      if (req.method === 'POST') {
        try {
          // Create Supabase client with service role for webhook (no user auth)
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          )

          const event: DailyCallEvent = await req.json()
          console.log('📞 Webhook received:', event.type, event)
          
          // Process webhook asynchronously (don't await to respond fast)
          handleCall(supabaseClient, event).catch(err => {
            console.error('Error processing webhook:', err)
          })

          // Immediately return 200 to Daily.co
          return new Response(
            JSON.stringify({ success: true }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } catch (error: any) {
          console.error('Webhook error:', error)
          // Still return 200 to Daily.co even if there's an error
          return new Response(
            JSON.stringify({ success: true }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }
    }

    // All other routes require authorization
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

    // Route: Create new call room
    if (action === 'create-room' && req.method === 'POST') {
      const { businessId, userId } = await req.json()

      console.log('📞 Creating room for:', { userId, businessId })

      // Create Daily.co room
      const room = await createDailyRoom(businessId)
      console.log('✅ Daily.co room created:', room.name, room.url)

      // Save to database
      const { data, error } = await supabaseClient.from('voice_calls').insert({
        user_id: userId,
        business_id: businessId,
        room_name: room.name,
        room_url: room.url,
        status: 'waiting',
      }).select()

      if (error) {
        console.error('❌ Database error:', error)
        // Still return the room URL even if DB insert fails
      } else {
        console.log('✅ Room saved to database:', data)
      }

      return new Response(
        JSON.stringify({
          success: true,
          roomUrl: room.url,
          roomName: room.name,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: Handle Daily.co webhook
    if (action === 'webhook' && req.method === 'POST') {
      // This should never be reached (handled above without auth)
      // But just in case, return success
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route: Get call status
    if (action === 'status' && req.method === 'GET') {
      const roomName = url.searchParams.get('room')
      
      const { data } = await supabaseClient
        .from('voice_calls')
        .select('*')
        .eq('room_name', roomName)
        .single()

      return new Response(
        JSON.stringify({ success: true, call: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
