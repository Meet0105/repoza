# 🔐 Authentication Setup Guide

## Overview
Repoza now supports authentication with **Google** and **GitHub** using NextAuth.js!

## ✅ What's Been Implemented

### Features
- 🔑 **Google OAuth** - Sign in with Google account
- 🐙 **GitHub OAuth** - Sign in with GitHub account
- 👤 **User Sessions** - Persistent login with JWT
- 🔒 **Protected Routes** - `/admin` and `/history` require authentication
- 📊 **User Tracking** - Save user searches and activity to MongoDB
- 🎨 **Beautiful UI** - Custom sign-in page with smooth UX
- 📱 **Responsive** - Works on all devices

### Protected Pages
- `/admin` - Admin settings (requires login)
- `/history` - Search history (requires login)

### Public Pages
- `/` - Homepage (accessible to everyone)
- `/generator` - Boilerplate generator (accessible to everyone)
- `/repo/[owner]/[repo]` - Repository details (accessible to everyone)

---

## 🚀 Setup Instructions

### Step 1: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
# On Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use this online: https://generate-secret.vercel.app/32
```

Copy the output and add it to your `.env.local`:
```env
NEXTAUTH_SECRET=paste_your_generated_secret_here
```

---

### Step 2: Setup Google OAuth

#### 2.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

#### 2.2 Create a New Project (or select existing)
1. Click on project dropdown (top-left)
2. Click "New Project"
3. Name it "Repoza" or similar
4. Click "Create"

#### 2.3 Enable Google+ API
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

#### 2.4 Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: Repoza
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps
4. Back to "Create OAuth client ID":
   - Application type: **Web application**
   - Name: Repoza Web Client
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
5. Click "Create"
6. **Copy the Client ID and Client Secret**

#### 2.5 Add to .env.local
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

### Step 3: Setup GitHub OAuth

#### 3.1 Go to GitHub Developer Settings
Visit: https://github.com/settings/developers

#### 3.2 Create New OAuth App
1. Click "OAuth Apps" in left sidebar
2. Click "New OAuth App"
3. Fill in details:
   - **Application name:** Repoza
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"

#### 3.3 Generate Client Secret
1. After creating, you'll see your **Client ID**
2. Click "Generate a new client secret"
3. **Copy both Client ID and Client Secret immediately** (you won't see the secret again!)

#### 3.4 Add to .env.local
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

---

### Step 4: Verify Your .env.local

Your `.env.local` should now look like this:

```env
GEMINI_API_KEY=AIzaSy...
GITHUB_TOKEN=github_pat_...
MONGODB_URI=mongodb+srv://...

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.abc123...
GITHUB_CLIENT_SECRET=abc123def456...
```

---

### Step 5: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

---

## 🧪 Testing Authentication

### Test Login Flow

1. **Visit Homepage**
   ```
   http://localhost:3000
   ```

2. **Click "Login" button** (top-right)

3. **Choose Provider**
   - Click "Continue with Google" or "Continue with GitHub"

4. **Authorize**
   - Sign in with your account
   - Grant permissions

5. **Success!**
   - You should be redirected back to homepage
   - Your name/avatar should appear in top-right
   - Click on your avatar to see dropdown menu

### Test Protected Routes

1. **Try accessing `/admin` without login**
   - Should redirect to sign-in page

2. **Login and try again**
   - Should show admin dashboard

3. **Try `/history`**
   - Should show your search history

### Test Logout

1. **Click your avatar** (top-right)
2. **Click "Logout"**
3. **Verify you're logged out**
   - Should see "Login" button again

---

## 🗄️ Database Collections

### `users` Collection
Stores user information:
```json
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://avatars.githubusercontent.com/...",
  "provider": "google",
  "createdAt": ISODate("2025-01-15T10:00:00Z"),
  "lastLogin": ISODate("2025-01-15T10:00:00Z")
}
```

### `user_searches` Collection
Tracks user search history:
```json
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "query": "react authentication",
  "results": 42,
  "timestamp": ISODate("2025-01-15T10:00:00Z")
}
```

---

## 🎨 UI Components

### Navbar Component
- Shows "Login" button when not authenticated
- Shows user avatar + dropdown when authenticated
- Dropdown includes:
  - User info (name, email)
  - History link
  - Admin Settings link
  - Logout button

### Sign In Page (`/auth/signin`)
- Beautiful gradient background
- Two provider buttons (Google, GitHub)
- Responsive design
- Back to home link

### Protected Route Wrapper
- Checks authentication status
- Shows loading spinner while checking
- Redirects to sign-in if not authenticated
- Preserves callback URL for redirect after login

---

## 🔒 Security Features

### JWT Sessions
- Secure token-based authentication
- No server-side session storage needed
- Tokens expire automatically

### Protected API Routes
You can protect API routes like this:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // User is authenticated
  const userEmail = session.user.email;
  // ... your logic
}
```

---

## 🚨 Troubleshooting

### "Configuration error" on sign-in page
- Check that all environment variables are set
- Verify NEXTAUTH_SECRET is generated
- Restart dev server after adding env vars

### Google OAuth not working
- Verify redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check that Google+ API is enabled
- Make sure OAuth consent screen is configured

### GitHub OAuth not working
- Verify callback URL matches: `http://localhost:3000/api/auth/callback/github`
- Check that client secret is correct (copy it again if needed)
- Make sure you're using the OAuth App, not GitHub App

### "Invalid callback URL" error
- Check that your redirect URIs in Google/GitHub match exactly
- No trailing slashes
- Use `http://` for localhost (not `https://`)

### Session not persisting
- Check that NEXTAUTH_SECRET is set
- Clear browser cookies and try again
- Check browser console for errors

---

## 🌐 Production Deployment

When deploying to production (e.g., Vercel):

### 1. Update Environment Variables
```env
NEXTAUTH_URL=https://your-domain.com
```

### 2. Update OAuth Redirect URIs

**Google:**
- Add: `https://your-domain.com/api/auth/callback/google`

**GitHub:**
- Add: `https://your-domain.com/api/auth/callback/github`

### 3. Generate New Secret
```bash
# Generate a new, production-specific secret
openssl rand -base64 32
```

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
- [GitHub OAuth Setup](https://next-auth.js.org/providers/github)
- [NextAuth.js Examples](https://github.com/nextauthjs/next-auth-example)

---

## ✨ Future Enhancements

- [ ] Add more OAuth providers (Twitter, Discord, etc.)
- [ ] Add email/password authentication
- [ ] Add user profile page
- [ ] Add user settings (preferences, API keys)
- [ ] Add admin role management
- [ ] Add user activity dashboard
- [ ] Add email verification
- [ ] Add password reset flow

---

**Status:** ✅ Ready to Use!  
**Next Step:** Setup OAuth credentials and test the authentication flow!
