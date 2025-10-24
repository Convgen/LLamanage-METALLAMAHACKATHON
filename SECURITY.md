# Security Best Practices for Google Calendar Integration

## ✅ What's Safe in Frontend

### Google Client ID
- **Status**: ✅ SAFE to expose
- **Why**: It's a public identifier, designed to be visible
- **Where it appears**: 
  - In OAuth URLs
  - In redirect URIs
  - In your frontend JavaScript
- **Protection**: Google validates it against your registered redirect URIs

### Redirect URIs
- **Status**: ✅ SAFE to expose
- **Why**: They're validated by Google OAuth
- **Protection**: Must match exactly what's registered in Google Console

### OAuth Scopes
- **Status**: ✅ SAFE to expose
- **Why**: User sees and approves them during OAuth flow
- **Example**: `https://www.googleapis.com/auth/calendar`

## 🚨 What Must NEVER Be in Frontend

### Client Secret
- **Status**: ❌ NEVER EXPOSE
- **Why**: With Client ID + Secret, anyone can impersonate your app
- **Where it belongs**: Backend only, environment variables
- **Protection**: 
  ```javascript
  // ❌ WRONG - Don't do this!
  const CLIENT_SECRET = 'GOCSPX-abc123...'
  
  // ✅ RIGHT - Backend only
  // In your Node.js backend:
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
  ```

### Access Tokens (Long-term storage)
- **Status**: ⚠️ Minimize frontend exposure
- **Why**: Can be used to access user's calendar
- **Where they belong**: 
  - ✅ Sent immediately to backend
  - ✅ Stored encrypted in database
  - ❌ Not in localStorage for long periods
  - ❌ Not in frontend state permanently

### Refresh Tokens
- **Status**: ❌ NEVER in frontend
- **Why**: Can generate new access tokens indefinitely
- **Where they belong**: Backend database, encrypted

## 🛡️ Current Implementation Security

### What We're Doing Right:

1. **Client ID via Environment Variables**
   ```javascript
   const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
   ```
   - Allows different IDs for dev/prod
   - Keeps it out of git (using .env.local)

2. **Immediate Backend Transfer**
   ```javascript
   // Token received, immediately send to backend
   saveIntegrationToBackend('googleCalendar', {
     accessToken: accessToken // Backend will encrypt
   })
   ```

3. **No Token in Frontend State**
   ```javascript
   googleCalendar: {
     connected: true,
     email: data.email,
     accessToken: null // Don't keep in frontend!
   }
   ```

4. **Clear Token from URL**
   ```javascript
   window.history.replaceState(null, '', window.location.pathname)
   ```

5. **HTTPS Required in Production**
   - OAuth won't work over HTTP in production
   - Google enforces HTTPS for security

## 🔐 Recommended Backend Implementation

### 1. Store Tokens Encrypted

```javascript
// backend/controllers/integrations.js
const crypto = require('crypto')

// Encryption function
function encryptToken(token) {
  const algorithm = 'aes-256-gcm'
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  }
}

// Save integration
app.post('/api/integrations', async (req, res) => {
  const { type, data, userId } = req.body
  
  // Encrypt the access token
  const encryptedToken = encryptToken(data.accessToken)
  
  // Save to database
  await db.integrations.create({
    userId,
    type,
    email: data.email,
    encryptedToken: encryptedToken.encrypted,
    iv: encryptedToken.iv,
    authTag: encryptedToken.authTag,
    createdAt: new Date()
  })
  
  res.json({ success: true })
})
```

### 2. Token Refresh Logic

```javascript
// backend/services/googleCalendar.js
const { google } = require('googleapis')

async function refreshGoogleToken(userId) {
  const integration = await db.integrations.findOne({
    where: { userId, type: 'googleCalendar' }
  })
  
  // Decrypt refresh token
  const refreshToken = decryptToken(integration.encryptedRefreshToken)
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  )
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })
  
  // This automatically refreshes the access token
  const { credentials } = await oauth2Client.refreshAccessToken()
  
  // Save new access token
  const encryptedToken = encryptToken(credentials.access_token)
  await integration.update({
    encryptedToken: encryptedToken.encrypted,
    iv: encryptedToken.iv,
    authTag: encryptedToken.authTag
  })
  
  return credentials.access_token
}
```

### 3. Secure API Endpoint for Calendar Operations

```javascript
// backend/routes/calendar.js
app.post('/api/calendar/create-event', async (req, res) => {
  const userId = req.user.id // From auth middleware
  
  // Get encrypted token from database
  const integration = await db.integrations.findOne({
    where: { userId, type: 'googleCalendar' }
  })
  
  if (!integration) {
    return res.status(400).json({ error: 'Google Calendar not connected' })
  }
  
  // Decrypt token
  const accessToken = decryptToken({
    encrypted: integration.encryptedToken,
    iv: integration.iv,
    authTag: integration.authTag
  })
  
  // Use token to create event
  try {
    const event = await createGoogleCalendarEvent(accessToken, req.body)
    res.json({ success: true, event })
  } catch (error) {
    if (error.code === 401) {
      // Token expired, refresh it
      const newToken = await refreshGoogleToken(userId)
      const event = await createGoogleCalendarEvent(newToken, req.body)
      res.json({ success: true, event })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})
```

## 🌐 Production Environment Setup

### .env.local (Frontend - Not in git)
```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_URL=https://api.yourdomain.com
```

### .env (Backend - Not in git)
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
ENCRYPTION_KEY=64-character-hex-string-here
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
```

## 📝 Security Checklist

### Frontend:
- [x] Client ID via environment variable
- [x] Don't store access tokens long-term
- [x] Clear OAuth tokens from URL
- [x] Send tokens to backend immediately
- [x] Use HTTPS in production
- [ ] Implement CSP headers
- [ ] Add rate limiting on OAuth attempts

### Backend:
- [ ] Encrypt tokens at rest
- [ ] Use environment variables for secrets
- [ ] Implement token refresh
- [ ] Validate all requests
- [ ] Log OAuth events
- [ ] Set up token expiration monitoring
- [ ] Implement CORS properly
- [ ] Use secure session management

### Google Console:
- [x] Restrict redirect URIs
- [ ] Enable OAuth verification
- [ ] Set up usage quotas
- [ ] Monitor API usage
- [ ] Restrict API key usage (if using API keys)

## 🚀 Deployment Security

### Development
```javascript
// OK for development
const GOOGLE_CLIENT_ID = '123456-dev.apps.googleusercontent.com'
```

### Production
```javascript
// Use environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Verify it's loaded
if (!GOOGLE_CLIENT_ID) {
  console.error('GOOGLE_CLIENT_ID not configured!')
}
```

### CI/CD
```yaml
# .github/workflows/deploy.yml
env:
  VITE_GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
```

## ⚠️ Common Security Mistakes

### ❌ Don't Do This:
```javascript
// Storing token in localStorage
localStorage.setItem('google_token', accessToken)

// Exposing Client Secret
const CLIENT_SECRET = 'GOCSPX-abc123'

// Keeping token in React state
const [accessToken, setAccessToken] = useState(token)

// Not validating on backend
app.post('/api/calendar', (req, res) => {
  // Using token from frontend without validation
  createEvent(req.body.token, req.body.event)
})
```

### ✅ Do This Instead:
```javascript
// Send token to backend immediately
await saveToBackend(token)

// Client Secret on backend only
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Don't keep token in state
const [isConnected, setIsConnected] = useState(false)

// Validate and use backend-stored token
app.post('/api/calendar', authenticate, async (req, res) => {
  const token = await getEncryptedToken(req.user.id)
  createEvent(token, req.body.event)
})
```

## 🔍 Monitoring & Auditing

1. **Log OAuth Events**
   - User connected
   - User disconnected
   - Token refreshes
   - Failed auth attempts

2. **Monitor Token Usage**
   - API call frequency
   - Unusual patterns
   - Failed API calls

3. **Alert on**
   - Multiple failed OAuth attempts
   - Token leaks (check for tokens in logs)
   - Unusual API usage patterns

## 📚 Resources

- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🎯 Summary

**Client ID in frontend: ✅ SAFE**
- It's a public identifier
- Google designed it to be exposed
- Protected by redirect URI validation

**Client Secret in frontend: ❌ NEVER**
- Must stay on backend
- Use environment variables
- Never commit to git

**Access Tokens:**
- ⚠️ Minimize frontend exposure
- Send immediately to backend
- Store encrypted
- Implement refresh logic

Your current implementation is secure for the Client ID. Just make sure to never expose the Client Secret!
