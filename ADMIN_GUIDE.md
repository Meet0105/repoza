# 🔧 Admin / Settings Page Guide

## Overview
The Admin/Settings page (`/admin`) provides a centralized dashboard for managing Repoza's configuration, API keys, theme settings, ranking algorithms, and usage monitoring.

## Access
- **Route:** `/admin` or `/settings`
- **Access Method:** Click the ⚙️ icon in the top-right corner of the homepage

## Features

### 1️⃣ API Key Configuration
Manage external service API keys dynamically without code changes.

**Available Keys:**
- GitHub API Token
- Gemini API Key
- Future keys (OpenAI, Vercel, etc.)

**Features:**
- 🔑 **Test Key** button - Validates if the entered API key is working
- 💾 **Save** button - Stores keys securely in MongoDB
- Keys are used dynamically for all future API calls

**How it works:**
1. Enter your API key in the input field
2. Click "Test" to verify the key is valid
3. Click "Save API Keys" to store them
4. The backend will use these keys for GitHub/Gemini API calls

---

### 2️⃣ Theme Settings
Customize the visual appearance of your Repoza platform.

**Options:**
- **Theme Mode:** Light / Dark
- **Color Scheme:** Blue-Gray, Minimal Black & White, Purple, Green
- **Font Size:** Small, Medium, Large

**How it works:**
1. Select your preferred theme options
2. Click "Save Theme"
3. Theme is saved to localStorage and MongoDB
4. Changes apply instantly across the platform

---

### 3️⃣ Ranking Weight & Filters
Fine-tune how search results are ranked and sorted.

**Adjustable Factors:**
- ⭐ **Stars** (0-1) - Repository popularity weight
- 🕒 **Last Updated** (0-1) - Recency weight
- 🧠 **Language Match** (0-1) - Programming language relevance
- 🍴 **Forks** (0-1) - Fork count weight
- 🐛 **Issues** (0-1) - Issue count weight

**How it works:**
1. Adjust sliders to set weight for each ranking factor
2. Click "Save Ranking Weights"
3. Search algorithm uses these weights dynamically
4. Higher weight = more influence on search results

**Example:**
- Set Stars to 0.9 and Last Updated to 0.2 → Prioritize popular repos over recent ones
- Set Language Match to 1.0 → Exact language matches get highest priority

---

### 4️⃣ Usage Monitoring
Track platform usage and API consumption.

**Metrics Displayed:**
- 🔍 **GitHub API Calls** - Total GitHub API requests made
- 🤖 **Gemini Requests** - Total Gemini AI API calls
- 📊 **Total Searches** - Number of searches performed
- ⚡ **Boilerplates Generated** - Total boilerplate projects created

**How it works:**
- Backend logs all API calls to MongoDB
- Stats are fetched from database collections
- Click "Refresh Stats" to update numbers
- Helps track API usage limits and popular features

---

## Database Collections Used

### `api_keys`
Stores encrypted API credentials:
```json
{
  "type": "credentials",
  "githubToken": "ghp_xxx",
  "geminiApiKey": "AIzaSyxxx",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### `settings`
Stores admin configuration:
```json
{
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
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### `api_logs`
Tracks API usage:
```json
{
  "service": "github",
  "endpoint": "search/repositories",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### `boilerplates`
Tracks generated boilerplates:
```json
{
  "projectName": "nextjs-typescript",
  "language": "typescript",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## API Endpoints

### `GET /api/admin/settings`
Fetch current admin settings (theme, ranking weights)

### `POST /api/admin/update-keys`
Update API keys
```json
{
  "githubToken": "ghp_xxx",
  "geminiApiKey": "AIzaSyxxx"
}
```

### `POST /api/admin/test-key`
Test if an API key is valid
```json
{
  "keyType": "github",
  "key": "ghp_xxx"
}
```

### `POST /api/admin/update-theme`
Save theme settings
```json
{
  "mode": "dark",
  "colorScheme": "blue-gray",
  "fontSize": "medium"
}
```

### `POST /api/admin/update-ranking`
Save ranking weights
```json
{
  "stars": 0.7,
  "lastUpdated": 0.5,
  "languageMatch": 0.3,
  "forks": 0.4,
  "issues": 0.2
}
```

### `GET /api/admin/usage-stats`
Get usage statistics

---

## Security Considerations

⚠️ **Important:** This is a basic implementation. For production:

1. **Add Authentication** - Protect `/admin` route with login
2. **Encrypt API Keys** - Use encryption for stored keys
3. **Role-Based Access** - Only admins should access this page
4. **Rate Limiting** - Prevent abuse of admin endpoints
5. **Audit Logs** - Track who changed what settings

---

## Future Enhancements

### 5️⃣ User Management (Optional)
When authentication is added:
- List registered users
- Assign roles (Admin / User)
- Delete / Block users
- View individual user history

---

## Tips

✅ **Test keys before saving** - Use the "Test" button to verify keys work  
✅ **Adjust weights gradually** - Small changes can have big impacts  
✅ **Monitor usage regularly** - Track API limits to avoid overages  
✅ **Backup settings** - Export settings before major changes  

---

## Troubleshooting

**Q: API keys not working after saving?**  
A: Make sure MongoDB is connected and keys are saved correctly. Check browser console for errors.

**Q: Theme not applying?**  
A: Clear localStorage and refresh the page. Check if theme is saved in MongoDB.

**Q: Usage stats showing 0?**  
A: Make sure MongoDB collections exist and API calls are being logged properly.

**Q: Ranking weights not affecting results?**  
A: Verify weights are saved in database and search API is fetching them correctly.

---

Happy configuring! 🚀
