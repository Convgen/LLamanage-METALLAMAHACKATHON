 # Understanding `access_type=offline` in Google OAuth

## The Question
**Why is `access_type=offline` used in the Google Calendar OAuth flow?**

## Quick Answer
`access_type=offline` requests a **refresh token** from Google, which allows your backend to get new access tokens automatically without requiring the user to re-authenticate every hour.

---

## Detailed Explanation

### The Problem with Access Tokens
- ⏱️ Google access tokens expire after **1 hour**
- 🔄 Without refresh tokens, users must re-authenticate every hour
- 😤 This creates a terrible user experience

### What `access_type=offline` Does
```javascript
access_type=offline  // Tells Google: "Please send me a refresh token too!"
```

When set to `offline`, Google returns:
1. ✅ **Access Token** - Valid for 1 hour, used to make API calls
2. ✅ **Refresh Token** - Never expires (until revoked), used to get new access tokens

### The Two OAuth Flows

#### ❌ Old Implementation (Implicit Flow)
```javascript
response_type=token    // Returns access token in URL hash
access_type=offline    // IGNORED! Implicit flow doesn't support refresh tokens
```

**Problems:**
- No refresh tokens even with `access_type=offline`
- Tokens expire after 1 hour
- Less secure (token in URL)
- User must re-authenticate frequently

#### ✅ New Implementation (Authorization Code Flow)
```javascript
response_type=code     // Returns authorization code
access_type=offline    // NOW WORKS! Returns refresh token
```

**Benefits:**
- ✅ Returns refresh tokens
- ✅ More secure (backend handles tokens)
- ✅ Tokens never exposed in URLs
- ✅ User authenticates once

---

## How It Works Now

### Step 1: User Clicks "Connect"
```javascript
// Frontend redirects to Google
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/dashboard&
  response_type=code&           // Request auth code
  access_type=offline&          // Request refresh token
  prompt=consent&               // Force consent screen
  scope=calendar
```

### Step 2: User Authorizes
- User sees Google's consent screen
- User clicks "Allow"
- Google redirects back with `?code=AUTHORIZATION_CODE`

### Step 3: Backend Exchanges Code
```javascript
// Backend receives authorization code
POST https://oauth2.googleapis.com/token
{
  code: "AUTHORIZATION_CODE",
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET",  // Backend only!
  redirect_uri: "https://yourapp.com/dashboard",
  grant_type: "authorization_code"
}

// Google responds with:
{
  access_token: "ya29.a0...",        // Expires in 1 hour
  refresh_token: "1//0g...",         // Never expires!
  expires_in: 3600,
  token_type: "Bearer",
  scope: "calendar"
}
```

### Step 4: Backend Stores Tokens
```javascript
// Store ENCRYPTED in database
{
  userId: "user@example.com",
  accessToken: encrypt("ya29.a0..."),
  refreshToken: encrypt("1//0g..."),
  expiresAt: Date.now() + 3600000
}
```

### Step 5: Token Refresh (Automatic)
```javascript
// When access token expires, backend automatically:
POST https://oauth2.googleapis.com/token
{
  refresh_token: "1//0g...",
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET",
  grant_type: "refresh_token"
}

// Google responds with new access token:
{
  access_token: "ya29.NEW_TOKEN...",  // Fresh 1-hour token
  expires_in: 3600,
  token_type: "Bearer"
}
```

---

## Why `prompt=consent` is Also Important

```javascript
prompt=consent  // Forces Google to show consent screen every time
```

**Why needed:**
- Google only returns refresh tokens on the FIRST authorization
- If user already authorized, Google skips consent and NO refresh token
- `prompt=consent` forces consent screen = guarantees refresh token

---

## The Updated Flow

```mermaid
User clicks "Connect"
    ↓
Frontend redirects to Google
(with access_type=offline & prompt=consent)
    ↓
User authorizes on Google
    ↓
Google redirects with authorization code
    ↓
Frontend sends code to Backend
    ↓
Backend exchanges code for tokens
(gets access_token + refresh_token)
    ↓
Backend encrypts and stores both tokens
    ↓
User is connected!
    ↓
When access token expires (1 hour):
    ↓
Backend uses refresh token automatically
    ↓
Gets new access token
    ↓
User never needs to re-authenticate!
```

---

## Backend Implementation Required

### Endpoint 1: Exchange Code for Tokens
```javascript
// POST /api/oauth/google/callback
app.post('/api/oauth/google/callback', async (req, res) => {
  const { code, userId } = req.body
  
  // Exchange authorization code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,  // Backend only!
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  })
  
  const tokens = await tokenResponse.json()
  
  // Get user's Google profile
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  })
  const profile = await profileResponse.json()
  
  // Encrypt and store tokens
  await db.integrations.create({
    userId,
    type: 'googleCalendar',
    email: profile.email,
    accessToken: encrypt(tokens.access_token),
    refreshToken: encrypt(tokens.refresh_token),  // THIS is why we need offline!
    expiresAt: Date.now() + tokens.expires_in * 1000
  })
  
  res.json({ success: true, email: profile.email })
})
```

### Endpoint 2: Auto-Refresh Tokens
```javascript
// Middleware to ensure valid token
async function ensureValidGoogleToken(userId) {
  const integration = await db.integrations.findOne({
    where: { userId, type: 'googleCalendar' }
  })
  
  // Check if access token expired
  if (Date.now() >= integration.expiresAt) {
    console.log('Token expired, refreshing...')
    
    // Use refresh token to get new access token
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: decrypt(integration.refreshToken),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token'
      })
    })
    
    const tokens = await refreshResponse.json()
    
    // Update with new access token
    await integration.update({
      accessToken: encrypt(tokens.access_token),
      expiresAt: Date.now() + tokens.expires_in * 1000
    })
    
    return tokens.access_token
  }
  
  return decrypt(integration.accessToken)
}
```

---

## Summary

### Before (Implicit Flow):
```javascript
response_type=token       // ❌ No refresh tokens
access_type=offline       // ❌ Ignored
// Result: User re-authenticates every hour 😤
```

### After (Authorization Code Flow):
```javascript
response_type=code        // ✅ Authorization code
access_type=offline       // ✅ Returns refresh token
prompt=consent            // ✅ Guarantees refresh token
// Result: User authenticates once, works forever! 🎉
```

---

## Key Takeaways

1. **`access_type=offline`** = "Give me a refresh token"
2. **Only works with Authorization Code Flow** (`response_type=code`)
3. **Doesn't work with Implicit Flow** (`response_type=token`)
4. **Requires backend** to exchange code for tokens
5. **`prompt=consent`** ensures refresh token on every auth
6. **Refresh tokens = No re-authentication needed**

The user authenticates once and your AI can access their calendar indefinitely! 🚀

