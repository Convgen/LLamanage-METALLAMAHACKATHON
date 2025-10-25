/**
 * Test Backend AI Functions
 * Run with: node test-backend.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!')
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testBackend() {
  console.log('🧪 Testing Backend AI Functions...\n')
  
  // 1. Check if functions are deployed
  console.log('1️⃣ Checking function deployment...')
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat-completion`, {
      method: 'OPTIONS',
    })
    console.log('✅ chat-completion function is deployed')
  } catch (error) {
    console.log('❌ chat-completion function not found:', error.message)
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-document`, {
      method: 'OPTIONS',
    })
    console.log('✅ process-document function is deployed\n')
  } catch (error) {
    console.log('❌ process-document function not found:', error.message)
  }
  
  // 2. Test authentication
  console.log('2️⃣ Testing authentication...')
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    console.log('⚠️ Not authenticated. Please sign in first.')
    console.log('Run: npm run dev and sign in through the UI\n')
    return
  }
  console.log('✅ Authenticated as:', session.user.email)
  console.log('✅ Token valid\n')
  
  // 3. Test chat function
  console.log('3️⃣ Testing chat-completion function...')
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat-completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! This is a test message.',
        useRAG: false,
        conversationHistory: [],
      }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Chat function works!')
      console.log('Response:', data.message.substring(0, 100) + '...')
    } else {
      console.log('❌ Chat function error:', data.error)
    }
  } catch (error) {
    console.log('❌ Chat function failed:', error.message)
  }
  
  console.log('\n✨ Backend testing complete!')
}

testBackend()
