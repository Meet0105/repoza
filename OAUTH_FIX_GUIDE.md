# OAuth "Invalid Request" Fix Guide

## 🐛 Problem

Getting "Invalid request" error when trying to sign in with Google or GitHub.

## 🔍 Root Cause

The **redirect URI** in your OAuth app settings doesn't match your application URL.

Your `.env.local` has:
```
NEXTAUTH_URL=http://localhost:3000
```

But your OAuth apps might be configured for a different URL!

## ✅ Solution

### Fix Google OAuth

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/apis/credentials

2. **Find your OAuth 2.0 Client ID:**
   - Client ID: `743775330203-5do5t419onofpp0ol540dhunvrtompth`

3. **Click on it to edit**

4. **Add these Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   http://localhost:3002/api/auth/callback/google
   ```

5. **Add these Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:3001
   http://localhost:3002
   ```

6. **Click "Save"**

---

### Fix GitHub OAuth

1. **Go to GitHub Developer Settings:**
   https://github.com/settings/developers

2. **Find your OAuth App:**
   - Client ID: `Ov23limnEbnHkwNJc6bJ`

3. **Click on it to edit**

4. **Set Homepage URL:**
   ```
   http://localhost:3000
   ```

5. **Set Authorization callback URL:**
   ```
   http://localhost:3000/api/auth/callback/github
   ```

6. **Click "Update application"**

---

## 🧪 Test After Fix

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to sign in page:**
   ```
   http://localhost:3000/auth/signin
   ```

3. **Try Google Sign In** - Should work now! ✅

4. **Try GitHub Sign In** - Should work now! ✅

---

## 🔧 Alternative: Check Your Current Port

If your dev server is running on a different port (like 3001 or 3002), update your `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3001
```

Then restart the server.

---

## 📝 Common Issues

### Issue 1: "Redirect URI mismatch"
**Solution:** Make sure the redirect URI in OAuth settings EXACTLY matches:
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
```

### Issue 2: "Invalid client"
**Solution:** Double-check your Client ID and Client Secret in `.env.local`

### Issue 3: "Access blocked"
**Solution:** 
- For Google: Make sure your app is in "Testing" mode and you've added your email as a test user
- For GitHub: Make sure the OAuth app is not suspended

---

## 🎯 Quick Checklist

- [ ] Google OAuth redirect URI includes `/api/auth/callback/google`
- [ ] GitHub OAuth callback URL includes `/api/auth/callback/github`
- [ ] `NEXTAUTH_URL` in `.env.local` matches your dev server URL
- [ ] Dev server restarted after changes
- [ ] Browser cache cleared (or use incognito mode)

---

## 🚀 After OAuth is Fixed

Once OAuth works, you can test the Live Preview feature while signed in!

The Live Preview might work better with authentication because:
- ✅ Can access private repos
- ✅ Higher GitHub API rate limits
- ✅ Better StackBlitz integration

---

**Fix the OAuth settings and try again!** 🎉
