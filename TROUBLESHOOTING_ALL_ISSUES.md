# 🔧 Complete Troubleshooting Guide

## Current Issues

1. ❌ StackBlitz Live Preview showing errors
2. ❌ Google OAuth "Invalid request"
3. ❌ GitHub OAuth "Invalid request"

---

## 🎯 Issue 1: StackBlitz Errors

### What's Happening?
You're still seeing errors in StackBlitz console when trying to preview repos.

### Possible Causes:

#### A) The repo you're testing doesn't work with StackBlitz
Not all repos work in StackBlitz. Try these **known working repos**:

✅ **Test with these repos first:**
```
facebook/create-react-app
vercel/next.js (might be too large)
vuejs/vue
angular/angular-cli
sveltejs/template
```

❌ **These won't work:**
- Repos without `package.json`
- Repos with backend dependencies (databases, APIs)
- Very large monorepos
- Repos requiring native modules

#### B) StackBlitz is still loading
StackBlitz needs time to:
1. Clone the repo
2. Install dependencies (`npm install`)
3. Build the project
4. Start dev server

**This can take 30-60 seconds!** Wait longer before checking for errors.

#### C) The repo has actual errors
Some repos have bugs or missing dependencies. This is not your fault!

### Solution:

**Test with a simple, known-working repo:**

1. Go to: `http://localhost:3000/repo/facebook/create-react-app`
2. Click "🚀 Live Preview"
3. Wait 60 seconds
4. Check if it works

If this works, then your code is fine! The other repo just has issues.

---

## 🎯 Issue 2 & 3: OAuth "Invalid Request"

### What's Happening?
When you click "Sign in with Google" or "Sign in with GitHub", you get "Invalid request" error.

### Root Cause:
The **redirect URI** in your OAuth app settings doesn't match your app URL.

### Fix Google OAuth:

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Find your OAuth Client:**
   - Look for Client ID: `743775330203-5do5t419onofpp0ol540dhunvrtompth`

3. **Click to edit it**

4. **Under "Authorized redirect URIs", add:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

5. **Under "Authorized JavaScript origins", add:**
   ```
   http://localhost:3000
   ```

6. **Click "Save"**

7. **Wait 5 minutes** for changes to propagate

### Fix GitHub OAuth:

1. **Go to:** https://github.com/settings/developers

2. **Find your OAuth App:**
   - Look for Client ID: `Ov23limnEbnHkwNJc6bJ`

3. **Click to edit it**

4. **Set "Homepage URL":**
   ```
   http://localhost:3000
   ```

5. **Set "Authorization callback URL":**
   ```
   http://localhost:3000/api/auth/callback/github
   ```

6. **Click "Update application"**

### Test OAuth:

1. **Restart dev server:**
   ```bash
   taskkill /F /IM node.exe
   npm run dev
   ```

2. **Clear browser cache** or use **Incognito mode**

3. **Go to:** `http://localhost:3000/auth/signin`

4. **Try signing in** - Should work now! ✅

---

## 🧪 Complete Testing Checklist

### Step 1: Fix OAuth First
- [ ] Update Google OAuth redirect URI
- [ ] Update GitHub OAuth callback URL
- [ ] Wait 5 minutes
- [ ] Restart dev server
- [ ] Test sign in - Should work! ✅

### Step 2: Test Live Preview with Simple Repo
- [ ] Go to: `/repo/facebook/create-react-app`
- [ ] Click "🚀 Live Preview"
- [ ] Wait 60 seconds (be patient!)
- [ ] Check if preview loads
- [ ] If it works, your code is fine! ✅

### Step 3: Test with Different Repos
- [ ] Try: `/repo/vuejs/vue`
- [ ] Try: `/repo/sveltejs/template`
- [ ] Try: `/repo/angular/angular-cli`

---

## 🎯 Expected Behavior

### ✅ What SHOULD Happen:

1. **Click "Live Preview"**
2. **See loading screen** (20-60 seconds)
3. **StackBlitz loads** with:
   - Code editor on left
   - Preview pane on right
   - Console at bottom
4. **Project runs** successfully

### ❌ What Might NOT Work:

Some repos will fail because:
- Too large (>100MB)
- Missing dependencies
- Require backend services
- Have build errors
- Use unsupported features

**This is normal!** Not every repo can run in StackBlitz.

---

## 🔍 Debugging Tips

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors from YOUR code (not StackBlitz)

### Check Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Check if `/api/stackblitz/create-project` returns 200 OK

### Check Server Logs:
Look at your terminal where `npm run dev` is running. Check for:
- API errors
- Framework detection results
- File fetching status

---

## 🚀 Quick Fixes

### If OAuth still doesn't work:
```bash
# 1. Stop server
taskkill /F /IM node.exe

# 2. Clear .next folder
rmdir /s /q .next

# 3. Restart
npm run dev
```

### If StackBlitz shows errors:
1. **Try a different repo** (use facebook/create-react-app)
2. **Wait longer** (60 seconds minimum)
3. **Check if repo has package.json** on GitHub
4. **Try "Open in StackBlitz" button** to see if it works there

### If nothing works:
```bash
# Nuclear option - fresh start
taskkill /F /IM node.exe
rmdir /s /q .next
rmdir /s /q node_modules\.cache
npm run dev
```

---

## 📝 Summary

### Priority Order:

1. **Fix OAuth first** (5 minutes)
   - Update redirect URIs in Google/GitHub
   - Restart server
   - Test sign in

2. **Test Live Preview with simple repo** (2 minutes)
   - Use facebook/create-react-app
   - Wait 60 seconds
   - Check if it works

3. **If simple repo works, your code is fine!** ✅
   - Other repos might just have issues
   - Not all repos work in StackBlitz
   - This is expected behavior

---

## 🎉 Success Criteria

You'll know everything works when:
- ✅ Can sign in with Google
- ✅ Can sign in with GitHub
- ✅ Live Preview works with facebook/create-react-app
- ✅ Can see code editor and preview pane
- ✅ Can edit code and see changes

**Not all repos will work - that's OK!** 👍

---

**Follow this guide step by step and let me know which step fails!** 🔍
