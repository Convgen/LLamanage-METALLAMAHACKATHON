# 🎯 Supabase Quick Reference

## Setup Checklist

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run SQL schema (copy from `SUPABASE_SETUP.md`)
- [ ] Create `user-files` storage bucket
- [ ] Add storage policies (3 policies: INSERT, SELECT, DELETE)
- [ ] Configure authentication providers
- [ ] Copy `.env.example` to `.env`
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`
- [ ] Run `npm run dev`
- [ ] Test sign up/sign in

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Quick Reference

### Authentication
```javascript
import { authHelpers } from '../utils/supabaseClient'

// Sign up
await authHelpers.signUp(email, password, companyName)

// Sign in
await authHelpers.signIn(email, password)

// Sign out
await authHelpers.signOut()

// Get current user
const { user, error } = await authHelpers.getUser()

// Google OAuth
await authHelpers.signInWithGoogle()
```

### Database Operations
```javascript
import { dbHelpers } from '../utils/supabaseClient'

// Get all flows for user
const { data, error } = await dbHelpers.getFlows(userId)

// Create new flow
await dbHelpers.createFlow(userId, { flowName, nodes, edges })

// Update flow
await dbHelpers.updateFlow(flowId, { flowName, nodes, edges })

// Delete flow
await dbHelpers.deleteFlow(flowId)

// Get files
await dbHelpers.getFiles(userId)

// Create file record
await dbHelpers.createFileRecord(userId, fileData)

// Get chat messages
await dbHelpers.getChatMessages(userId)

// Create chat message
await dbHelpers.createChatMessage(userId, message, role)

// Business info
await dbHelpers.getBusinessInfo(userId)
await dbHelpers.upsertBusinessInfo(userId, businessData)
```

### File Storage
```javascript
import { storageHelpers } from '../utils/supabaseClient'

// Upload file
const { data, error } = await storageHelpers.uploadFile(userId, file)

// Delete file
await storageHelpers.deleteFile(filePath)

// Get public URL
const url = storageHelpers.getPublicUrl(filePath)

// Get signed URL (expires in 1 hour)
const { data } = await storageHelpers.getSignedUrl(filePath)
```

### Real-time Subscriptions
```javascript
import { realtimeHelpers } from '../utils/supabaseClient'

// Subscribe to chat messages
const channel = realtimeHelpers.subscribeToChatMessages(userId, (payload) => {
  console.log('New message:', payload.new)
})

// Unsubscribe
realtimeHelpers.unsubscribe(channel)
```

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User profiles | id, email, company_name |
| `flows` | Flow builder data | user_id, flow_name, nodes, edges |
| `files` | File metadata | user_id, file_name, storage_path |
| `chat_messages` | Chat history | user_id, message, role |
| `business_info` | Business info | user_id, company_name, services, faqs |
| `document_embeddings` | AI vectors | user_id, content, embedding (vector) |

## Supabase Dashboard URLs

| Feature | URL |
|---------|-----|
| Table Editor | `https://supabase.com/dashboard/project/[id]/editor` |
| SQL Editor | `https://supabase.com/dashboard/project/[id]/sql` |
| Authentication | `https://supabase.com/dashboard/project/[id]/auth/users` |
| Storage | `https://supabase.com/dashboard/project/[id]/storage/buckets` |
| Logs | `https://supabase.com/dashboard/project/[id]/logs/explorer` |
| API Settings | `https://supabase.com/dashboard/project/[id]/settings/api` |

## Row Level Security

All tables have RLS policies that ensure users can only:
- View their own data
- Insert records as themselves
- Update/delete only their own records

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Module not found: @supabase/supabase-js" | `npm install @supabase/supabase-js` |
| "Failed to fetch" | Check .env file, restart server |
| "Row Level Security" error | Run all SQL policies |
| "Bucket not found" | Create `user-files` bucket |
| "Invalid JWT" | User not authenticated, redirect to signin |

## Useful SQL Queries

```sql
-- View all users
SELECT * FROM auth.users;

-- View user profiles
SELECT * FROM profiles;

-- Count flows per user
SELECT user_id, COUNT(*) FROM flows GROUP BY user_id;

-- View storage usage
SELECT 
  user_id,
  SUM(file_size) / 1024 / 1024 AS mb_used
FROM files
GROUP BY user_id;

-- Recent chat messages
SELECT * FROM chat_messages 
ORDER BY created_at DESC 
LIMIT 10;
```

## Next Steps

1. **Follow Setup**: Read `SUPABASE_SETUP.md`
2. **Test Features**: Try signing up, uploading files, creating flows
3. **Add AI**: Integrate OpenAI for chat responses
4. **Enable Real-time**: Add live updates to chat
5. **Deploy**: Host on Vercel/Netlify with production Supabase

## Resources

- 📖 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Full setup guide
- 📖 [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) - Migration summary
- 📖 [Supabase Docs](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com/)
