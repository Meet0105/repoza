# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Google Gemini API key (required - FREE!)
- GitHub token (optional but recommended)

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

```bash
# Windows (CMD)
copy .env.example .env.local

# Windows (PowerShell) or Mac/Linux
cp .env.example .env.local
```

### 3. Add Your Gemini API Key

Open `.env.local` and add:

```env
GEMINI_API_KEY=your-actual-key-here
```

Get your key from: https://aistudio.google.com/app/apikey (100% FREE!)

### 4. Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

## First Search

Try searching for:
- "MERN stack blog with authentication"
- "Next.js SaaS starter with Stripe"
- "Python FastAPI REST API"

## Troubleshooting

**Error: Gemini API key not found**
- Make sure `.env.local` exists in the root directory
- Verify your API key is correct (starts with `AIza`)
- Restart the dev server after adding the key

**Error: GitHub API rate limit**
- Add a GitHub token to `.env.local` as `GITHUB_TOKEN`
- Get one from: https://github.com/settings/tokens

**No results showing**
- Check browser console for errors
- Verify your Gemini API key is valid
- Try a simpler query like "React app"

## What's Next?

- Add a GitHub token for higher rate limits
- Set up MongoDB for analytics (optional)
- Deploy to Vercel for production use
- Customize the ranking algorithm in `backend/ranker.ts`

## Need Help?

Check the full README.md for detailed documentation.
