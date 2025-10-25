# Llamanage Component Architecture

## Visual Component Tree

```
App.jsx (Router)
│
├─ LandingPage.jsx (/)
│
├─ SignIn.jsx (/signin)
│
├─ SignUp.jsx (/signup)
│
└─ Dashboard.jsx (/dashboard) ⭐ MAIN ORCHESTRATOR
   │
   ├─ Top Navigation Bar
   │  └─ Logout Button
   │
   ├─ Sidebar
   │  └─ Tab Navigation (6 tabs)
   │
   └─ Main Content Area
      │
      ├─ Tab: 'dashboard'
      │  └─ <DashboardOverview />
      │     ├─ Stats Cards (Files, Chats, Integrations)
      │     └─ Quick Actions Grid
      │
      ├─ Tab: 'flowbuilder'
      │  └─ <FlowBuilder />
      │     ├─ React Flow Canvas
      │     ├─ Node Palette (7 node types)
      │     └─ Save/Export Controls
      │
      ├─ Tab: 'files'
      │  └─ <FilesManager />
      │     ├─ Drag & Drop Upload Zone
      │     ├─ Uploaded Files List
      │     └─ Business Info Form
      │
      ├─ Tab: 'chat'
      │  └─ <ChatInterface />
      │     ├─ Chat Header
      │     ├─ Message List
      │     ├─ Input Box
      │     └─ Quick Questions
      │
      ├─ Tab: 'integrations'
      │  └─ <IntegrationsManager />
      │     ├─ Google Calendar Card (Featured)
      │     └─ Other Integrations Grid
      │
      └─ Tab: 'settings'
         └─ <SettingsPanel />
            ├─ Profile Information
            └─ Preferences
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                     Dashboard.jsx                        │
│                                                          │
│  STATE:                                                  │
│  • uploadedFiles[]        • messages[]                   │
│  • businessInfo{}         • inputMessage                 │
│  • integrations{}         • isTyping                     │
│  • isDragging             • activeTab                    │
│                                                          │
│  HANDLERS:                                               │
│  • handleFileUpload()     • handleSendMessage()          │
│  • handleDragOver()       • handleGoogleCalendarAuth()   │
│  • handleSubmit()         • handleLogout()               │
└─────────────────────────────────────────────────────────┘
                         ↓ Props
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DashboardOv. │  │ FilesManager │  │ ChatInterface│
│              │  │              │  │              │
│ - Displays   │  │ - Renders    │  │ - Shows      │
│   stats      │  │   upload UI  │  │   messages   │
│              │  │              │  │              │
│ - Quick      │  │ - Handles    │  │ - Typing     │
│   actions    │  │   drag/drop  │  │   indicator  │
└──────────────┘  └──────────────┘  └──────────────┘
        ↑ Callbacks         ↑ Callbacks      ↑ Callbacks
        └───────────────────┴─────────────────┘
```

## Data Flow Example: File Upload

```
1. User drops file in FilesManager
   ↓
2. FilesManager calls onDrop(event)
   ↓
3. Dashboard.jsx's handleDrop() processes file
   ↓
4. State updated: setUploadedFiles([...files, newFile])
   ↓
5. Dashboard re-renders
   ↓
6. FilesManager receives new uploadedFiles prop
   ↓
7. UI updates to show new file
```

## OAuth Flow: Google Calendar

```
1. User clicks "Connect" in IntegrationsManager
   ↓
2. Calls onGoogleCalendarAuth prop
   ↓
3. Dashboard.jsx's handleGoogleCalendarAuth()
   ↓
4. Saves state to sessionStorage
   ↓
5. Redirects to Google OAuth
   ↓
6. Google redirects back to /dashboard?code=...
   ↓
7. useEffect in Dashboard detects code param
   ↓
8. Exchanges code for tokens (currently mocked)
   ↓
9. Updates integrations state
   ↓
10. IntegrationsManager shows "Connected" status
```

## File Structure

```
src/
├── components/          👈 Reusable UI components
│   ├── ChatInterface.jsx
│   ├── DashboardOverview.jsx
│   ├── FilesManager.jsx
│   ├── FlowBuilder.jsx
│   ├── IntegrationsManager.jsx
│   └── SettingsPanel.jsx
│
├── pages/              👈 Route-level components
│   ├── Dashboard.jsx   (orchestrates all components)
│   ├── LandingPage.jsx
│   ├── SignIn.jsx
│   └── SignUp.jsx
│
├── utils/              👈 Helper functions
│   └── googleCalendar.js
│
├── App.jsx             👈 Router setup
├── main.jsx            👈 Entry point
└── index.css           👈 Global styles + Tailwind
```

## Key Design Decisions

### Why Keep State in Dashboard?
✅ **Centralized** - Easy to understand data flow
✅ **localStorage** - Simple to persist all state
✅ **OAuth** - Callbacks need access to state setter
✅ **Tab switching** - Preserves state between tabs

### Why Not Context/Redux?
- State tree is shallow (only 2-3 levels)
- No deeply nested components
- Prop drilling is explicit and clear
- Easy to debug with React DevTools

### Component Communication
```
Parent (Dashboard)
  ↓ Data (props)
Child (Component)
  ↑ Events (callbacks)
Parent (Dashboard)
```

This unidirectional flow makes debugging simple:
1. Check state in Dashboard.jsx
2. Verify props passed to component
3. Ensure callbacks are wired correctly

## Testing Strategy

### Unit Tests (Future)
- `DashboardOverview` - Renders stats correctly
- `FilesManager` - Upload handling
- `ChatInterface` - Message display
- `IntegrationsManager` - Connection status
- `SettingsPanel` - Form validation

### Integration Tests (Future)
- Tab navigation preserves state
- OAuth flow end-to-end
- File upload → Display → Remove
- Chat send → Response → History

### E2E Tests (Future)
- Complete user journey
- Sign up → Upload files → Configure flow → Test chat

## Performance Considerations

### Current Setup
- All tabs loaded at once (hidden with conditional rendering)
- Small bundle size - no heavy dependencies
- Vite HMR for fast development

### Future Optimizations
1. **Lazy Load Tabs**
   ```javascript
   const FlowBuilder = lazy(() => import('./components/FlowBuilder'))
   ```

2. **Memoize Components**
   ```javascript
   const MemoizedChat = memo(ChatInterface)
   ```

3. **Debounce Input**
   ```javascript
   const debouncedSearch = useDebouncedCallback(handleSearch, 300)
   ```

## Deployment Notes

### Environment Variables
```env
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_API_URL=http://localhost:5000
```

### Build Process
```bash
npm run build      # Creates dist/ folder
npm run preview    # Test production build
```

### Backend Integration
When backend is ready, update `MOCK_MODE = false` in:
- `Dashboard.jsx` (OAuth exchange)
- `FlowBuilder.jsx` (Save flow)
