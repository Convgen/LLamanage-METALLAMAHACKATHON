# 🚀 Supabase Setup Guide for Llamanage

This guide will walk you through setting up Supabase for your Llamanage application.

## 📋 Prerequisites

- A Supabase account (free tier works perfectly)
- Your Llamanage project ready

## Step 1: Create Supabase Project (5 minutes)

### 1.1 Sign Up/Login
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### 1.2 Create New Project
1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Project name**: `llamanage` (or any name you prefer)
   - **Database password**: Generate a strong password (save it somewhere safe!)
   - **Region**: Choose closest to your users
   - **Pricing plan**: Free (perfect for development)
4. Click "Create new project"
5. **Wait 2-3 minutes** for provisioning

### 1.3 Get API Keys
1. Once project is ready, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long JWT token)
3. Keep these safe - you'll need them in Step 4

## Step 2: Create Database Schema (10 minutes)

### 2.1 Open SQL Editor
1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**

### 2.2 Run the Schema SQL
Copy and paste this ENTIRE SQL script into the editor and click **RUN**:

```sql
-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABLES
-- ============================================

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flows table
CREATE TABLE flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  flow_name TEXT NOT NULL,
  nodes JSONB DEFAULT '[]'::JSONB,
  edges JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business info table
CREATE TABLE business_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  company_name TEXT,
  services TEXT,
  description TEXT,
  faqs JSONB DEFAULT '[]'::JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document embeddings table (for AI semantic search)
CREATE TABLE document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384), -- HuggingFace all-MiniLM-L6-v2 embedding size
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Settings table (for voice and personality configuration)
CREATE TABLE ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  system_prompt TEXT DEFAULT 'You are a helpful AI assistant for a health tourism medical facility. You help international patients with questions about medical procedures, appointments, travel arrangements, and post-treatment care. Be professional, empathetic, and informative while maintaining HIPAA compliance.',
  personality TEXT DEFAULT 'Professional Medical',
  temperature DECIMAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 500,
  voice_id TEXT DEFAULT 'EXAVITQu4vr4xnSDxMaL',
  language TEXT DEFAULT 'English',
  response_style TEXT DEFAULT 'Balanced',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice call settings table
CREATE TABLE voice_call_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  "welcomeMessage" TEXT DEFAULT 'Hello! Welcome to our medical facility. How can I help you today?',
  "voiceId" TEXT DEFAULT 'EXAVITQu4vr4xnSDxMaL',
  "businessHours" JSONB DEFAULT '{"enabled": true, "schedule": {"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}, "saturday": {"open": "10:00", "close": "14:00"}, "sunday": {"open": null, "close": null}}}'::JSONB,
  "afterHoursMessage" TEXT DEFAULT 'Thank you for calling. We are currently closed. Please call back during business hours or leave a message.',
  language TEXT DEFAULT 'en',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX flows_user_id_idx ON flows(user_id);
CREATE INDEX files_user_id_idx ON files(user_id);
CREATE INDEX chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX document_embeddings_user_id_idx ON document_embeddings(user_id);
CREATE INDEX document_embeddings_embedding_idx ON document_embeddings 
  USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_call_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Flows policies
CREATE POLICY "Users can view own flows" ON flows
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own flows" ON flows
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flows" ON flows
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flows" ON flows
  FOR DELETE USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view own files" ON files
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business info policies
CREATE POLICY "Users can view own business info" ON business_info
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own business info" ON business_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own business info" ON business_info
  FOR UPDATE USING (auth.uid() = user_id);

-- Document embeddings policies
CREATE POLICY "Users can view own embeddings" ON document_embeddings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own embeddings" ON document_embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own embeddings" ON document_embeddings
  FOR DELETE USING (auth.uid() = user_id);

-- AI Settings policies
CREATE POLICY "Users can view own AI settings" ON ai_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI settings" ON ai_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI settings" ON ai_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own AI settings" ON ai_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Voice call settings policies
CREATE POLICY "Users can view own voice settings" ON voice_call_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voice settings" ON voice_call_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voice settings" ON voice_call_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own voice settings" ON voice_call_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'company_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity,
    document_embeddings.metadata
  FROM document_embeddings
  WHERE 
    document_embeddings.user_id = filter_user_id
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
```

### 2.3 Verify Schema
After running, you should see "Success. No rows returned" (that's good!)

To verify tables were created:
1. Click **Table Editor** in left sidebar
2. You should see: `profiles`, `flows`, `files`, `chat_messages`, `business_info`, `document_embeddings`

## Step 3: Configure Storage (5 minutes)

### 3.1 Create Storage Bucket
1. Click **Storage** in the left sidebar
2. Click **New bucket**
3. Fill in:
   - **Name**: `user-files`
   - **Public bucket**: OFF (keep private)
4. Click **Create bucket**

### 3.2 Set Up Storage Policies
1. Click on the `user-files` bucket
2. Click **Policies** tab
3. Click **New policy**
4. Copy and paste this policy for **INSERT** (Upload):

```sql
(bucket_id = 'user-files' AND 
 auth.uid()::text = (storage.foldername(name))[1])
```

5. Click **Save**

6. Create another policy for **SELECT** (Download/View):
```sql
(bucket_id = 'user-files' AND 
 auth.uid()::text = (storage.foldername(name))[1])
```

7. Create another policy for **DELETE**:
```sql
(bucket_id = 'user-files' AND 
 auth.uid()::text = (storage.foldername(name))[1])
```

## Step 4: Configure Authentication (2 minutes)

### 4.1 Email Provider
1. Click **Authentication** → **Providers** in left sidebar
2. **Email** should already be enabled by default
3. (Optional) Disable "Confirm email" if you want to skip email verification during development

### 4.2 Google OAuth (Optional - for Calendar integration)
1. In **Authentication** → **Providers**
2. Enable **Google**
3. You'll need to:
   - Create a Google Cloud Project
   - Enable Google Calendar API
   - Create OAuth credentials
   - Add credentials here
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. **Skip this for now** - you can add it later!

### 4.3 Site URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/**` (wildcard for all routes)

## Step 5: Update Your Project (2 minutes)

### 5.1 Create .env File
In your project root, create a `.env` file:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace** with your actual values from Step 1.3!

### 5.2 Verify Installation
Check that Supabase client is installed:
```bash
npm list @supabase/supabase-js
```

If not installed:
```bash
npm install @supabase/supabase-js
```

## Step 6: Test Your Setup (5 minutes)

### 6.1 Start Development Server
```bash
npm run dev
```

### 6.2 Test Authentication
1. Go to `http://localhost:5173`
2. Click "Sign Up"
3. Create a test account:
   - Company: "Test Company"
   - Email: "test@example.com"
   - Password: "test123"
4. Check for success message
5. Go to Supabase **Authentication** → **Users**
6. You should see your new user!

### 6.3 Test Dashboard
1. Sign in with your test account
2. Try uploading a file in the **Files** tab
3. Send a message in **AI Chat** tab
4. Create a flow in **Flow Builder** tab
5. Check Supabase **Table Editor** to see your data!

## 🎉 Success Checklist

- ✅ Supabase project created
- ✅ Database schema applied (7 tables)
- ✅ Storage bucket created with policies
- ✅ Authentication configured
- ✅ .env file created with API keys
- ✅ Can sign up new users
- ✅ Can sign in
- ✅ Can upload files
- ✅ Can create flows
- ✅ Can send chat messages

## 🐛 Troubleshooting

### "Failed to fetch" errors
- Check `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Restart dev server after adding .env: `npm run dev`

### "Row Level Security" errors
- Make sure all RLS policies were created
- Check user is authenticated (JWT token exists)

### "Bucket not found" errors
- Verify bucket name is exactly `user-files`
- Check storage policies are applied

### Email confirmation required
- In Supabase: **Authentication** → **Providers** → **Email** → Disable "Confirm email"

### Google OAuth not working
- Skip it for now - it's optional!
- You can add it later when needed

## 📚 Next Steps

### Add AI Features
- Integrate OpenAI for chat responses
- Use `document_embeddings` table for RAG (Retrieval Augmented Generation)
- Store vector embeddings for semantic search

### Production Deployment
- Update Site URL to your production domain
- Enable email confirmation
- Set up custom SMTP for emails
- Configure Google OAuth with production redirect URLs

### Database Backup
- Supabase automatically backs up your database
- Can download backups from **Database** → **Backups**

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase Discord Community](https://discord.supabase.com/)

## 💡 Pro Tips

1. **Use Supabase Studio**: The web UI is powerful - explore all tabs!
2. **Check Logs**: **Logs** tab shows all database queries and errors
3. **Test RLS**: Use "RLS Debugger" in Table Editor to test policies
4. **Use Edge Functions**: For complex backend logic, use Supabase Edge Functions
5. **Real-time subscriptions**: Enable real-time for live chat updates!

---

**Need help?** Check the [Supabase Discord](https://discord.supabase.com/) or [documentation](https://supabase.com/docs).
