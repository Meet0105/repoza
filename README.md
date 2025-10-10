# AI Codebase Recommender Platform

A smart platform that helps developers find the perfect GitHub repositories for their projects using natural language queries powered by AI.

## Features

- **Natural Language Search**: Describe your project in plain English
- **AI-Powered Query Parsing**: OpenAI extracts technologies, purpose, and keywords
- **Smart Ranking Algorithm**: Ranks repos by stars, recency, language match, and relevance
- **Beautiful UI**: Modern gradient design with animations using Framer Motion
- **Boilerplate Generation**: Auto-generate project structures based on your needs
- **Search History**: Keep track of recent searches
- **Quick Actions**: Copy clone commands, view on GitHub

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **AI**: Google Gemini Pro (Free)
- **APIs**: GitHub REST API
- **Database**: MongoDB Atlas (optional, for analytics)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-codebase-recommender
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Required
GEMINI_API_KEY=your-gemini-api-key

# Optional but recommended (increases GitHub API rate limit)
GITHUB_TOKEN=ghp_your-github-token

# Optional (for analytics and saved repos)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-codebase-recommender
```

#### Getting API Keys:

**Google Gemini API Key:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env.local`
4. **100% FREE** with generous limits (60 requests/minute)

**GitHub Token (Optional):**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `public_repo` scope
4. Copy and paste into `.env.local`

**MongoDB URI (Optional):**
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Replace username/password with your credentials

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter your project idea in plain language (e.g., "MERN stack blog with authentication")
2. Click Search or press Enter
3. View AI-parsed query details
4. Browse ranked repository results
5. Click "Generate Boilerplate" for starter code structure
6. Copy clone commands or view repos on GitHub

## Example Queries

- "MERN stack blog with authentication"
- "Next.js SaaS starter with Stripe"
- "Python ML pipeline with FastAPI"
- "React Native app with Firebase"
- "Vue.js e-commerce with payment gateway"

## Project Structure

```
├── backend/
│   ├── mongodb.ts      # MongoDB connection and analytics
│   ├── openai.ts       # OpenAI query parsing and boilerplate generation
│   └── ranker.ts       # Repository ranking algorithm
├── components/
│   └── RepoCard.tsx    # Repository card component
├── pages/
│   ├── api/
│   │   ├── generate.ts # Boilerplate generation endpoint
│   │   └── search.ts   # Repository search endpoint
│   ├── _app.tsx        # Next.js app wrapper
│   └── index.tsx       # Main page
├── styles/
│   └── globals.css     # Global styles
└── .env.example        # Environment variables template
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

## Future Enhancements

- User authentication (NextAuth.js)
- Save favorite repositories
- Advanced filtering options
- Trending repositories dashboard
- Team collaboration features
- Embedding-based semantic search

## License

MIT
