# Llamanage AI Agent Instructions

## Project Overview
Llamanage is a B2B SaaS platform for creating AI-powered customer support agents with a visual flow builder. This is a **React 19 + Vite 7** frontend using **Tailwind CSS v4** (new API with `@tailwindcss/vite`) and **Supabase** for backend services.

## Architecture

### Core Structure
- **Modular dashboard**: `Dashboard.jsx` orchestrates 6 tab components with shared state management
- **React Router routes**: `/` (landing), `/signin`, `/signup`, `/dashboard`
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **State Management**: React hooks + Supabase client
- **No Mock Mode**: All features are real with Supabase integration

### Dashboard Components (Modular Architecture)
- `Dashboard.jsx`: Main container managing state, authentication, and tab routing (~400 lines)
- `DashboardOverview.jsx`: Stats cards and quick actions for the main dashboard view
- `FilesManager.jsx`: File upload (drag & drop) and business information forms
- `ChatInterface.jsx`: AI chat UI with message history and typing indicators
- `IntegrationsManager.jsx`: OAuth integrations (Google Calendar, Slack, Discord, etc.)
- `SettingsPanel.jsx`: User profile and preferences
- `FlowBuilder.jsx`: Visual node-based editor using React Flow for AI conversation flows (7 node types)

### Supabase Integration
- `supabaseClient.js`: Single utility file with all Supabase helpers
  - `authHelpers`: signUp, signIn, signOut, getUser, getSession, signInWithGoogle
  - `dbHelpers`: CRUD operations for all tables
  - `storageHelpers`: File upload/download/delete
  - `realtimeHelpers`: WebSocket subscriptions for live updates

## Development Workflow

### Commands
```bash
npm run dev      # Start dev server (Vite on port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

### Tailwind CSS v4 Setup
- Uses NEW `@tailwindcss/vite` plugin (not PostCSS)
- Theme variables in `index.css` with `@theme` directive
- Import: `@import "tailwindcss"` (not traditional v3 directives)
- Custom properties: `--color-primary-green: #75FDA8`, `--color-dark-gray: #2D2D2D`, `--color-deep-teal: #27705D`

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
- Keys still used: `companyName` for convenience

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

### Backend Integration (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Built-in JWT with automatic token refresh
- **Storage**: S3-compatible object storage for file uploads
- **Real-time**: WebSocket subscriptions for live data
- **Vector DB**: pgvector extension for AI embeddings
- **Base URL**: Managed by Supabase client automatically
- **Key Tables**:
  - `profiles` - User profiles (extends auth.users)
  - `flows` - Flow builder data (nodes, edges)
  - `files` - File metadata with storage paths
  - `chat_messages` - Chat history
  - `business_info` - Business information and FAQs
  - `document_embeddings` - Vector embeddings for semantic search
- **Storage Buckets**:
  - `user-files` - Private bucket for user file uploads
- **Security**: Row Level Security ensures users only access their own data

## React Flow (FlowBuilder)

### Node Types
7 custom nodes: StartNode, MessageNode, QuestionNode, ConditionNode, ActionNode, AIResponseNode, EndNode

### Node Structure
- All nodes use `<Handle>` components for connections
- Node data changes via `data.onChange?.()` callbacks passed down from parent
- Edges use `MarkerType.ArrowClosed` for visual arrow indicators
- Save flow: Sends to Supabase via `dbHelpers.createFlow()` or `dbHelpers.updateFlow()`

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
```

## Setup Requirements

1. Create Supabase project (free tier)
2. Run SQL schema from `SUPABASE_SETUP.md`
3. Create storage bucket `user-files` with RLS policies
4. Add env variables to `.env`
5. Start dev server: `npm run dev`

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

### Testing Supabase Integration
- All features are real - no mock mode needed
- Authentication works out of the box
- File uploads go to Supabase Storage
- Database operations respect RLS policies
- Check Supabase dashboard for data verification

### File Organization
- Page components go in `src/pages/`
- Reusable components go in `src/components/`
- Utility functions go in `src/utils/`
- Documentation in root: `SUPABASE_SETUP.md`, `SUPABASE_MIGRATION.md`

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
