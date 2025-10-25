# Llamanage AI Agent Instructions

## Project Overview
Llamanage is a B2B SaaS platform for creating AI-powered customer support agents for the **health tourism industry**. This is a **React 19 + Vite 7** frontend using **Tailwind CSS v4** (new API with `@tailwindcss/vite`) and **Supabase** for backend services.

## Architecture

### Core Structure
- **Modular dashboard**: `Dashboard.jsx` orchestrates 6 tab components with shared state management
- **React Router routes**: `/` (landing), `/signin`, `/signup`, `/dashboard`
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time + Edge Functions)
- **AI Layer**: Supabase Edge Functions call OpenRouter (LLM) + HuggingFace (embeddings)
- **State Management**: React hooks + Supabase client
- **Styling**: Tailwind CSS v4 only (no UI component library)
- **No Mock Mode**: All features are real with Supabase integration

### Dashboard Components (Modular Architecture)
- `Dashboard.jsx`: Main container managing state, authentication, and tab routing (~420 lines)
- `DashboardOverview.jsx`: Stats cards and quick actions for the main dashboard view
- `FilesManager.jsx`: File upload (drag & drop) and business information forms
- `ChatInterface.jsx`: AI chat UI with message history and typing indicators
- `IntegrationsManager.jsx`: OAuth integrations (Google Calendar, Slack, Discord, etc.)
- `SettingsPanel.jsx`: User profile and preferences
- `FlowBuilder.jsx`: Visual node-based editor using React Flow for AI conversation flows (7 node types)

### Supabase Integration
- `supabaseClient.js`: Single utility file with all Supabase helpers
  - `authHelpers`: signUp, signIn, signOut, getUser, getSession, signInWithGoogle
  - `dbHelpers`: CRUD operations for all tables (profiles, flows, files, chat_messages, business_info, document_embeddings, calendar_events, support_tickets, etc.)
  - `storageHelpers`: File upload/download/delete
  - `realtimeHelpers`: WebSocket subscriptions for live updates

### AI Backend Architecture
- **Edge Functions** (TypeScript Deno):
  - `supabase/functions/chat-completion/index.ts`: Main chat endpoint with RAG pipeline
  - `supabase/functions/chat-completion/tools.ts`: 8 AI tool definitions (calendar, tickets, knowledge base, etc.)
  - `supabase/functions/process-document/index.ts`: Document extraction, chunking, embedding generation
- **AI Service Layer** (`src/utils/`):
  - `backendAI.js`: Frontend wrapper calling Edge Functions (sendChatMessage, processDocumentBackend)
  - `documentProcessor.js`: Client-side text extraction for PDF, DOCX, CSV, TXT, JSON, Markdown
  - `googleCalendar.js`: Google Calendar API helpers (listEvents, createEvent, checkAvailability)
- **AI Models**:
  - Chat: `meta-llama/llama-3.3-70b-instruct:free` via OpenRouter (function calling support)
  - Embeddings: `sentence-transformers/all-MiniLM-L6-v2` via HuggingFace (384 dimensions)
- **RAG Pipeline**: User message → Embedding → pgvector similarity search → Context injection → LLM response

## Development Workflow

### Commands
```bash
npm run dev      # Start dev server (Vite on port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint

# Supabase Edge Functions (requires Supabase CLI)
npx supabase functions list                          # List deployed functions
npx supabase functions deploy chat-completion        # Deploy chat function
npx supabase functions deploy process-document       # Deploy document processor
```

### Tailwind CSS v4 Setup
- Uses NEW `@tailwindcss/vite` plugin (not PostCSS)
- Theme variables in `index.css` with `@theme` directive
- Import: `@import "tailwindcss"` (not traditional v3 directives)
- **NO UI component library** - using pure Tailwind utilities with custom components
- Brand colors defined as CSS variables in `index.css`:
  - Primary Green: `#75FDA8` (buttons, accents)
  - Deep Teal: `#27705D` (borders, hover states)
  - Dark Gray: `#2D2D2D` (backgrounds)
  - Darker Gray: `#1F1F1F` (section alternates)
  - Medical Blue: `#1890FF` (medical features)
  - Health Orange: `#FA8C16` (health features)

### AI Development Workflow
1. **Test AI locally**: Supabase Edge Functions run on Deno runtime
2. **Local testing**: `npx supabase functions serve chat-completion --env-file .env.local`
3. **Deploy to production**: `npx supabase functions deploy chat-completion`
4. **View logs**: Check Supabase Dashboard → Edge Functions → Logs
5. **Environment variables**: Set in Supabase Dashboard → Settings → Edge Functions (OPENROUTER_API_KEY, HUGGINGFACE_API_KEY)

## Project Conventions

### Styling Pattern
Inline styles with hex colors for brand consistency, NOT Tailwind utility classes for colors:
```jsx
style={{ backgroundColor: '#2D2D2D', borderColor: '#75FDA8' }}
className="px-6 py-4 rounded-lg"  // Use Tailwind for spacing/layout only
```

### State Management
- **Supabase client** for all backend operations
- **React state** (useState) for component-level state
- **useEffect** hooks for data loading on mount
- **No localStorage** for auth (Supabase handles JWT automatically)
- Exception: `googleCalendarToken` stored in localStorage as fallback for OAuth token persistence

### Authentication Pattern
```javascript
// Check auth in useEffect with Supabase
useEffect(() => {
  const checkAuth = async () => {
    const { user, error } = await authHelpers.getUser()
    if (error || !user) navigate('/signin')
    setUser(user)
  }
  checkAuth()
}, [navigate])
```

### AI Chat Integration Pattern
```javascript
// Send message to AI with RAG and tools enabled
const response = await sendChatMessage(message, {
  conversationHistory: messages,
  useRAG: true,           // Enable document search
  enableTools: true,      // Enable AI function calling
  googleAccessToken: integrations.googleCalendar.accessToken  // Pass OAuth token
})

// Response includes: message, sources (RAG context), toolsUsed (calendar, tickets, etc.)
```

### Backend Integration (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Built-in JWT with automatic token refresh
- **Storage**: S3-compatible object storage for file uploads
- **Real-time**: WebSocket subscriptions for live data
- **Vector DB**: pgvector extension for AI embeddings (384 dimensions)
- **Edge Functions**: Deno runtime for serverless AI processing
- **Base URL**: Managed by Supabase client automatically
- **Key Tables**:
  - `profiles` - User profiles (extends auth.users)
  - `flows` - Flow builder data (nodes, edges)
  - `files` - File metadata with storage paths
  - `chat_messages` - Chat history
  - `business_info` - Business information and FAQs
  - `document_embeddings` - Vector embeddings for semantic search (pgvector cosine similarity)
  - `calendar_events` - Meeting scheduling data
  - `support_tickets` - Customer support tickets
  - `email_logs` - Email notification tracking
  - `tool_usage_logs` - AI tool usage analytics
- **Storage Buckets**:
  - `user-files` - Private bucket for user file uploads
- **Security**: Row Level Security ensures users only access their own data

### AI Tool System (8 Built-in Tools)
The Edge Function at `supabase/functions/chat-completion/tools.ts` defines 8 AI function-calling tools:
1. **search_knowledge_base**: RAG search across uploaded documents using pgvector
2. **check_calendar_availability**: Query Google Calendar via OAuth token
3. **create_calendar_event**: Schedule meetings in Google Calendar
4. **get_business_info**: Fetch company FAQs, hours, policies
5. **list_uploaded_documents**: Show available knowledge base files
6. **create_support_ticket**: Escalate to human agents
7. **send_email**: Send templated notifications (confirmation, followup, etc.)
8. **check_order_status**: Track order delivery (optional e-commerce feature)

**Tool Execution Flow**:
1. User sends message → `backendAI.sendChatMessage(message, { enableTools: true })`
2. Backend calls OpenRouter with tool definitions
3. LLM decides if/which tools to call based on context
4. Backend executes tools via `executeTool()` in `tools.ts`
5. Tool results injected back into LLM context
6. Final response returned with `toolsUsed` array

## React Flow (FlowBuilder)

### Node Types
7 custom nodes: StartNode, MessageNode, QuestionNode, ConditionNode, ActionNode, AIResponseNode, EndNode

### Node Structure
- All nodes use `<Handle>` components for connections
- Node data changes via `data.onChange?.()` callbacks passed down from parent
- Edges use `MarkerType.ArrowClosed` for visual arrow indicators
- Save flow: Sends to Supabase via `dbHelpers.createFlow()` or `dbHelpers.updateFlow()`
- Each node has custom styling matching brand colors (#2D2D2D, #75FDA8, #27705D)

### Example Node Implementation Pattern
```jsx
const MessageNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" 
       style={{ backgroundColor: '#2D2D2D', borderColor: '#75FDA8' }}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <textarea
      value={data.message || ''}
      onChange={(e) => data.onChange?.(e.target.value)}
      className="w-full p-2 rounded"
      style={{ backgroundColor: '#1F1F1F', color: '#FFFFFF' }}
    />
  </div>
)
```

## Supabase Integration Details

### Authentication Flow
1. User signs up → `authHelpers.signUp(email, password, companyName)`
2. Supabase creates user in `auth.users` table
3. Database trigger auto-creates profile in `profiles` table
4. User receives email verification (optional in dev)
5. User signs in → `authHelpers.signIn(email, password)`
6. Supabase returns session with JWT token (stored in httpOnly cookie)
7. All subsequent requests automatically include JWT

### Google OAuth Flow (Optional)
1. User clicks "Connect Google Calendar" → `authHelpers.signInWithGoogle()`
2. Supabase redirects to Google OAuth consent screen
3. User approves permissions (Google Calendar access)
4. Google redirects back to `/dashboard` with auth code
5. Supabase automatically exchanges code for tokens
6. Access token available via `session.provider_token`

### File Upload Flow
1. User selects/drops files → `storageHelpers.uploadFile(userId, file)`
2. File uploaded to Supabase Storage bucket `user-files/{userId}/filename`
3. Returns storage path and metadata
4. Create database record → `dbHelpers.createFileRecord(userId, fileData)`
5. File appears in user's dashboard

### Data Persistence
- All data automatically saved to PostgreSQL
- Row Level Security ensures data isolation
- Real-time subscriptions available for live updates
- No manual token management needed

## Environment Variables

```env
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Dashboard → Settings → Edge Functions (for AI features)
OPENROUTER_API_KEY=sk-or-...
HUGGINGFACE_API_KEY=hf_...
```

## Setup Requirements

1. Create Supabase project (free tier)
2. Run SQL schema from `extra_files/SUPABASE_SETUP.md` 
3. Run tool tables migration: `supabase/migrations/add_tool_tables.sql`
4. Create storage bucket `user-files` with RLS policies
5. Deploy Edge Functions: `npx supabase functions deploy chat-completion`
6. Set Edge Function secrets in Supabase Dashboard (OPENROUTER_API_KEY, HUGGINGFACE_API_KEY)
7. Add `.env` variables to root
8. Start dev server: `npm run dev`

## Important Notes

### Component Architecture
- Dashboard components are modular: Each tab is a separate component in `src/components/`
- State management flows from `Dashboard.jsx` down via props
- Use prop drilling for now (no context/Redux) - keeps data flow explicit
- Component naming: `ComponentName.jsx` (PascalCase)

### When Adding Features
- Create new components in `src/components/` for reusable UI
- Keep business logic in `Dashboard.jsx` or create utility functions in `src/utils/`
- Use the same dark theme color scheme: `#2D2D2D` background, `#75FDA8` accents, `#27705D` borders
- Follow the inline style + Tailwind class pattern
- Use Supabase helpers from `supabaseClient.js`
- Add RLS policies for new tables
- For AI tools: Add tool definition to `tools.ts`, implement in `executeTool()`, update tool count in docs

### Testing Supabase Integration
- All features are real - no mock mode needed
- Authentication works out of the box
- File uploads go to Supabase Storage
- Database operations respect RLS policies
- Check Supabase dashboard for data verification
- Test Edge Functions via Dashboard → Edge Functions → Logs

### File Organization
- Page components go in `src/pages/`
- Reusable components go in `src/components/`
- Utility functions go in `src/utils/`
- Edge Functions in `supabase/functions/`
- Documentation in `extra_files/` and root
- SQL migrations in `supabase/migrations/`

### Document Processing Pipeline
1. **Upload**: User drops file → `storageHelpers.uploadFile()` → Supabase Storage
2. **Extract**: Call `processDocumentBackend()` → Edge Function extracts text (TXT, MD, JSON, CSV, PDF, DOCX)
3. **Chunk**: Backend splits into 1000-char chunks with 200-char overlap
4. **Embed**: Each chunk → HuggingFace API → 384-dim vector
5. **Store**: Vectors saved to `document_embeddings` table with pgvector
6. **Search**: User query → Embedding → Cosine similarity search → Top 5 results → RAG context

### Google Calendar OAuth Flow (Critical)
1. User clicks "Connect Google Calendar" in `IntegrationsManager.jsx`
2. `authHelpers.signInWithGoogle()` initiates OAuth with `scopes: 'https://www.googleapis.com/auth/calendar'`
3. Google redirects to `/dashboard` after consent
4. **Token retrieval**: Check `session.provider_token` via `authHelpers.getSession()`
5. **Fallback**: Store token in `localStorage.getItem('googleCalendarToken')` for persistence
6. **Usage**: Pass token to `sendChatMessage()` as `googleAccessToken` parameter
7. **Backend**: Edge Function receives token, forwards to Google Calendar API via AI tools

## Common Patterns

### Tab Navigation in Dashboard
```javascript
const [activeTab, setActiveTab] = useState('dashboard')
// Then render based on activeTab === 'tab-name'
```

### Supabase Data Pattern
```javascript
// Fetch data
const { data, error } = await dbHelpers.getFlows(user.id)
if (error) console.error(error)
else setFlows(data)

// Insert data
const { data, error } = await dbHelpers.createFlow(user.id, { flowName, nodes, edges })

// Update data
const { data, error } = await dbHelpers.updateFlow(flowId, { flowName, nodes, edges })
```

### Color Hover Effects
```jsx
onMouseEnter={(e) => e.target.style.backgroundColor = '#27705D'}
onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
```

### Vector Search Pattern (in Edge Function)
```typescript
// Generate embedding for query
const queryEmbedding = await generateEmbedding(userMessage)

// pgvector cosine similarity search (384 dimensions)
const { data: searchResults } = await supabaseClient
  .rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5
  })

// Inject results as context into LLM prompt
const context = searchResults.map(r => r.content).join('\n\n')
```
