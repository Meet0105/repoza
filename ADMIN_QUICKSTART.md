# 🚀 Admin Page - Quick Start Guide

## Step 1: Start Your Development Server

```bash
npm run dev
```

## Step 2: Access the Admin Page

Open your browser and navigate to:
```
http://localhost:3000/admin
```

Or click the ⚙️ icon in the top-right corner of the homepage.

---

## Step 3: Test Each Feature

### 🔑 API Keys Tab

1. **Enter your GitHub token:**
   ```
   ghp_your_github_token_here
   ```

2. **Click "Test"** - Should show ✅ if valid

3. **Enter your Gemini API key:**
   ```
   AIzaSy_your_gemini_key_here
   ```

4. **Click "Test"** - Should show ✅ if valid

5. **Click "Save API Keys"** - Should show success message

### 🎨 Theme Tab

1. **Select Theme Mode:** Dark or Light
2. **Select Color Scheme:** Blue-Gray, Minimal B&W, Purple, or Green
3. **Select Font Size:** Small, Medium, or Large
4. **Click "Save Theme"** - Theme should apply instantly

### ⚖️ Ranking Tab

1. **Adjust sliders:**
   - Stars: 0.7 (default)
   - Last Updated: 0.5
   - Language Match: 0.3
   - Forks: 0.4
   - Issues: 0.2

2. **Click "Save Ranking Weights"** - Should show success

3. **Test it:** Go to homepage and search for something
   - Results should be ranked using your weights

### 📊 Usage Tab

1. **View current stats:**
   - GitHub API Calls
   - Gemini Requests
   - Total Searches
   - Boilerplates Generated

2. **Click "Refresh Stats"** to update

3. **Perform actions to increase counts:**
   - Search on homepage → increases searches & GitHub calls
   - Generate boilerplate → increases boilerplates & Gemini calls

---

## Step 4: Verify Integration

### Test Dynamic API Keys
1. Save new API keys in admin
2. Go to homepage
3. Perform a search
4. Check console - should use your saved keys

### Test Dynamic Ranking
1. Set Stars weight to 1.0 and others to 0.1
2. Search for "react"
3. Results should prioritize high-star repos

### Test Usage Tracking
1. Note current stats
2. Perform 3 searches
3. Generate 1 boilerplate
4. Refresh stats
5. Numbers should increase

---

## 🐛 Troubleshooting

### Admin page not loading?
- Check if MongoDB is connected
- Check browser console for errors
- Verify `/api/admin/*` routes exist

### API keys not saving?
- Check MongoDB connection
- Check browser network tab for errors
- Verify `api_keys` collection exists

### Theme not applying?
- Clear localStorage
- Hard refresh (Ctrl+Shift+R)
- Check if theme is saved in MongoDB

### Stats showing 0?
- Perform some searches first
- Check if MongoDB collections exist
- Verify logging functions are called

---

## 📋 Quick Checklist

- [ ] Admin page loads at `/admin`
- [ ] All 4 tabs are visible
- [ ] Can enter and test API keys
- [ ] Can save API keys
- [ ] Can change theme settings
- [ ] Theme applies when saved
- [ ] Can adjust ranking sliders
- [ ] Ranking weights save successfully
- [ ] Usage stats display
- [ ] Stats refresh button works
- [ ] Settings icon visible on homepage
- [ ] Clicking settings icon navigates to admin

---

## 🎯 Expected Behavior

### After Saving API Keys:
- ✅ Success message appears
- ✅ Keys stored in MongoDB `api_keys` collection
- ✅ Future API calls use saved keys

### After Saving Theme:
- ✅ Success message appears
- ✅ Theme applies immediately
- ✅ Theme persists on page refresh
- ✅ Theme saved in MongoDB `settings` collection

### After Saving Ranking Weights:
- ✅ Success message appears
- ✅ Weights saved in MongoDB `settings` collection
- ✅ Future searches use new weights

### After Refreshing Stats:
- ✅ Numbers update
- ✅ Reflects actual usage
- ✅ Counts increase with activity

---

## 🔍 MongoDB Collections to Check

After testing, verify these collections exist:

```javascript
// api_keys collection
{
  "_id": ObjectId("..."),
  "type": "credentials",
  "githubToken": "ghp_xxx",
  "geminiApiKey": "AIzaSyxxx",
  "updatedAt": ISODate("2025-01-15T10:30:00Z")
}

// settings collection
{
  "_id": ObjectId("..."),
  "type": "admin",
  "theme": {
    "mode": "dark",
    "colorScheme": "blue-gray",
    "fontSize": "medium"
  },
  "rankingWeights": {
    "stars": 0.7,
    "lastUpdated": 0.5,
    "languageMatch": 0.3,
    "forks": 0.4,
    "issues": 0.2
  },
  "updatedAt": ISODate("2025-01-15T10:30:00Z")
}

// api_logs collection
{
  "_id": ObjectId("..."),
  "service": "github",
  "endpoint": "search/repositories",
  "timestamp": ISODate("2025-01-15T10:30:00Z")
}

// boilerplates collection
{
  "_id": ObjectId("..."),
  "projectName": "nextjs-typescript",
  "language": "typescript",
  "timestamp": ISODate("2025-01-15T10:30:00Z")
}
```

---

## 🎉 You're All Set!

Your admin page is ready to use. Enjoy managing your Repoza platform! 🚀

**Need help?** Check `ADMIN_GUIDE.md` for detailed documentation.
