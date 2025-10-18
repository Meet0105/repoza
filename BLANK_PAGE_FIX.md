# Blank Page Fix - StackBlitz Preview

## 🐛 Problem
The Live Preview modal shows a blank page after loading completes.

## 🔍 What We Fixed

### Issue 1: Height Configuration
**Problem:** The StackBlitz iframe wasn't getting proper height
**Fix:** 
- Changed modal content height to `calc(100% - 64px)` to account for header
- Set container `minHeight` to `600px`
- Changed StackBlitz height from `'100%'` to `600` (numeric value)

### Issue 2: DOM Timing
**Problem:** StackBlitz SDK was trying to embed before container was in DOM
**Fix:**
- Set status to 'ready' first to render the container
- Wait 100ms for DOM to update
- Then call `sdk.embedGithubProject()`

### Issue 3: Error Handling
**Problem:** No visibility into what's failing
**Fix:**
- Added console.log statements for debugging
- Added try-catch around StackBlitz embedding
- Better error messages

## 🧪 How to Test

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools (F12)**

3. **Go to a repo page:**
   ```
   http://localhost:3000/repo/Meet0105/CrickBuddy_Frontend_V
   ```

4. **Click "🚀 Live Preview"**

5. **Check Console tab** - You should see:
   ```
   Embedding StackBlitz project from GitHub...
   Repository: Meet0105/CrickBuddy_Frontend_V
   StackBlitz embedded successfully!
   ```

6. **Wait 30-60 seconds** for StackBlitz to:
   - Clone the repo
   - Install dependencies
   - Build the project
   - Start dev server

7. **You should see:**
   - ✅ StackBlitz editor on the left
   - ✅ Preview pane on the right
   - ✅ Console at the bottom

## 🔍 Debugging Steps

### If still blank:

1. **Check Console for errors:**
   - Look for red error messages
   - Check if `embedGithubProject` is being called
   - Look for StackBlitz-specific errors

2. **Check Network tab:**
   - Look for requests to `stackblitz.com`
   - Check if any requests are failing (red)

3. **Check Elements tab:**
   - Find the `#stackblitz-container` div
   - See if there's an iframe inside it
   - Check the iframe's src attribute

4. **Try "Open in StackBlitz" button:**
   - Click the blue button in the modal header
   - See if the repo opens in a new tab
   - If it works there, the issue is with embedding

### Common Issues:

#### Issue A: "Repository not found"
**Cause:** The repo might be private or doesn't exist
**Solution:** Make sure the repo is public

#### Issue B: StackBlitz shows "Project not supported"
**Cause:** The repo doesn't have a valid `package.json`
**Solution:** Try a different repo with proper package.json

#### Issue C: Iframe is blocked by browser
**Cause:** Browser security settings
**Solution:** Check browser console for CSP errors

#### Issue D: StackBlitz is loading but taking forever
**Cause:** Large repo or many dependencies
**Solution:** Wait longer (up to 2 minutes)

## 🎯 Expected Console Output

### Success:
```
Embedding StackBlitz project from GitHub...
Repository: Meet0105/CrickBuddy_Frontend_V
StackBlitz embedded successfully! [VM object]
```

### Failure:
```
Embedding StackBlitz project from GitHub...
Repository: Meet0105/CrickBuddy_Frontend_V
Error embedding StackBlitz: [error message]
```

## 🚀 Alternative: Try Simple Repo First

If your repo still doesn't work, try a known-working simple repo:

```
http://localhost:3000/repo/stackblitz/vite-react-ts-starter
```

This is a StackBlitz official starter - it WILL work!

If this works but yours doesn't, the issue is with your specific repo, not the code.

## 📝 What Changed in Code

### components/LivePreviewModal.tsx:

1. **Modal content height:**
   ```tsx
   <div className="h-full" style={{ height: 'calc(100% - 64px)' }}>
   ```

2. **Container styling:**
   ```tsx
   <div
     ref={iframeContainerRef}
     className="w-full h-full"
     id="stackblitz-container"
     style={{ minHeight: '600px' }}
   />
   ```

3. **Embedding sequence:**
   ```tsx
   // Set status to ready first (renders container)
   setState({ status: 'ready', ... });
   
   // Wait for DOM
   await new Promise(resolve => setTimeout(resolve, 100));
   
   // Then embed
   await sdk.embedGithubProject(...);
   ```

4. **Better logging:**
   ```tsx
   console.log('Embedding StackBlitz project from GitHub...');
   console.log(`Repository: ${owner}/${repo}`);
   console.log('StackBlitz embedded successfully!', vm);
   ```

## ✅ Success Criteria

You'll know it works when:
- ✅ Modal opens
- ✅ Loading completes
- ✅ Console shows "StackBlitz embedded successfully!"
- ✅ You see StackBlitz editor interface
- ✅ Preview pane shows your app running
- ✅ No blank page!

## 🎉 Next Steps

Once this works:
1. Test with different repos
2. Try editing code in StackBlitz
3. Check if hot reload works
4. Test full-screen mode
5. Test "Open in StackBlitz" button

---

**Try it now and check the browser console!** 🔍

If you still see a blank page, share the console output and I'll help debug further!
