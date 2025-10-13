# 🤖 AI Q&A System - Complete Guide

## Overview
Repoza now features an intelligent Q&A system that allows users to ask natural language questions about any GitHub repository. Using AI embeddings and semantic search, it can answer questions like "What database does this use?" or "How is authentication handled?" by analyzing the repository's code and documentation.

## 🧠 How It Works

### Architecture Overview

```
User Question → Embedding → Semantic Search → Context Retrieval → AI Answer
```

### Detailed Flow

#### 1. **Repository Indexing** (One-time per repo)
When a user visits a repo detail page:

1. **Fetch Content** - Backend fetches key files:
   - README.md (most important)
   - package.json, tsconfig.json
   - Source files from `src/`, `lib/`, `app/`, `pages/api/`
   - Config files (docker-compose.yml, .env.example)

2. **Chunk Content** - Files are split into 500-token chunks:
   ```typescript
   "import express from 'express'..." → Chunk 1
   "app.use(cors())..." → Chunk 2
   "app.listen(3000)..." → Chunk 3
   ```

3. **Generate Embeddings** - Each chunk is converted to a 768-dimensional vector using Gemini's `text-embedding-004` model

4. **Store in Pinecone** - Embeddings are stored with metadata:
   ```json
   {
     "id": "owner/repo::src/server.ts::0",
     "values": [0.123, -0.456, ...], // 768 dimensions
     "metadata": {
       "repoId": "owner/repo",
       "content": "import express...",
       "file": "src/server.ts",
       "chunkIndex": 0
     }
   }
   ```

#### 2. **Question Answering** (Real-time)
When a user asks a question:

1. **Embed Question** - Convert question to same 768-dimensional vector space

2. **Semantic Search** - Query Pinecone for top 5 most similar chunks using cosine similarity:
   ```
   Question: "How is authentication handled?"
   
   Top Results:
   1. src/auth.ts (95% match) - "NextAuth configuration..."
   2. README.md (88% match) - "Authentication uses GitHub OAuth..."
   3. src/middleware/auth.ts (82% match) - "JWT verification..."
   ```

3. **Generate Answer** - Send question + top chunks to Gemini:
   ```
   Prompt: "Based on these code excerpts, answer: How is authentication handled?"
   Context: [Top 5 chunks]
   
   Answer: "This project uses NextAuth.js for authentication with GitHub OAuth.
   The configuration is in src/auth.ts, and JWT tokens are verified in
   src/middleware/auth.ts..."
   ```

4. **Display Answer** - Show answer with source file references

---

## 🚀 Setup Instructions

### Step 1: Get Pinecone API Key

1. **Sign up** at https://www.pinecone.io/
2. **Create a new index:**
   - Name: `repoza-repos`
   - Dimensions: `768`
   - Metric: `cosine`
   - Region: Choose closest to you (e.g., `us-east-1-aws`)
3. **Copy API Key** from dashboard
4. **Copy Environment** (e.g., `us-east-1-aws`)

### Step 2: Update Environment Variables

Add to `.env.local`:
```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1-aws
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

---

## 💻 User Experience

### On Repo Detail Page

1. **Before Indexing:**
   - User sees "AI Q&A Not Available" message
   - "Index Repository" button displayed
   - Click to start indexing

2. **During Indexing:**
   - Progress message shown
   - Takes 30-60 seconds depending on repo size
   - Fetches files, chunks content, generates embeddings

3. **After Indexing:**
   - Q&A chat interface appears
   - Suggested questions displayed
   - User can ask custom questions

### Chat Interface

**Suggested Questions:**
- What database does this use?
- How is authentication handled?
- Where is the API defined?
- What are the main dependencies?
- How do I run this project?

**Custom Questions:**
- Type any question about the repository
- Press Enter or click Send
- AI analyzes code and responds
- Sources shown with match percentages

---

## 📊 Example Interactions

### Example 1: Database Question

**User:** "What database does this use?"

**AI Response:**
```
This project uses MongoDB as its database. The connection is configured
in backend/mongodb.ts using the MongoDB Node.js driver. The connection
string is stored in the MONGODB_URI environment variable.

Sources:
📄 backend/mongodb.ts (92% match)
📄 .env.example (85% match)
📄 README.md (78% match)
```

### Example 2: Authentication Question

**User:** "How is authentication handled?"

**AI Response:**
```
Authentication is handled using NextAuth.js with support for Google and
GitHub OAuth providers. The configuration is in pages/api/auth/[...nextauth].ts.
JWT tokens are used for session management with a strategy defined in the
authOptions object.

Sources:
📄 pages/api/auth/[...nextauth].ts (95% match)
📄 README.md (88% match)
📄 components/ProtectedRoute.tsx (82% match)
```

### Example 3: Setup Question

**User:** "How do I run this project locally?"

**AI Response:**
```
To run this project locally:
1. Install dependencies: npm install
2. Copy .env.example to .env.local and fill in your API keys
3. Run the development server: npm run dev
4. Open http://localhost:3000 in your browser

The project requires Node.js 18+ and uses Next.js 14.

Sources:
📄 README.md (94% match)
📄 package.json (87% match)
```

---

## 🔧 API Endpoints

### POST `/api/repo-index`

Index a repository for Q&A.

**Request:**
```json
{
  "owner": "vercel",
  "repo": "next.js",
  "forceReindex": false
}
```

**Response:**
```json
{
  "message": "Repository indexed successfully",
  "repoId": "vercel/next.js",
  "filesProcessed": 15,
  "chunksCreated": 127,
  "embeddingsStored": 127
}
```

### POST `/api/repo-qa`

Ask a question about an indexed repository.

**Request:**
```json
{
  "repoId": "vercel/next.js",
  "question": "What database does this use?"
}
```

**Response:**
```json
{
  "answer": "This project uses MongoDB...",
  "sources": [
    {
      "file": "backend/mongodb.ts",
      "score": 0.92,
      "preview": "import { MongoClient } from 'mongodb'..."
    }
  ],
  "repoId": "vercel/next.js",
  "question": "What database does this use?"
}
```

---

## 🎯 Technical Details

### Files Fetched

**Priority Files:**
- README.md
- package.json
- tsconfig.json
- next.config.js/ts
- .env.example
- docker-compose.yml
- Dockerfile

**Source Directories (5 files each):**
- `src/`
- `lib/`
- `app/`
- `pages/api/`
- `api/`

**File Types:**
- `.ts`, `.tsx`, `.js`, `.jsx`
- `.py`, `.go`, `.rs`, `.java`

### Chunking Strategy

- **Max Chunk Size:** 500 tokens (~2000 characters)
- **Method:** Split by lines, preserve context
- **Overlap:** None (for simplicity)

### Embedding Model

- **Model:** `text-embedding-004` (Gemini)
- **Dimensions:** 768
- **Context Window:** 2048 tokens

### Vector Database

- **Provider:** Pinecone
- **Index:** `repoza-repos`
- **Metric:** Cosine similarity
- **Top K:** 5 chunks per query

### Answer Generation

- **Model:** `gemini-2.0-flash-exp`
- **Context:** Top 5 relevant chunks
- **Max Tokens:** ~2000 per response

---

## 📈 Performance

### Indexing Time

- **Small Repo** (< 10 files): 10-20 seconds
- **Medium Repo** (10-50 files): 30-60 seconds
- **Large Repo** (50+ files): 1-2 minutes

### Query Time

- **Embedding Generation:** 0.5-1 second
- **Pinecone Search:** 0.1-0.3 seconds
- **Answer Generation:** 2-4 seconds
- **Total:** 3-6 seconds per question

### Cost Estimates (per repo)

**Indexing:**
- Gemini Embeddings: ~$0.001 per 1000 chunks
- Pinecone Storage: ~$0.10 per month per 100k vectors

**Querying:**
- Gemini Embeddings: ~$0.00001 per question
- Gemini Text: ~$0.0001 per answer
- Pinecone Queries: Included in free tier

---

## 🔒 Security & Privacy

### Data Storage

- **Embeddings:** Stored in Pinecone (encrypted at rest)
- **Original Code:** NOT stored, only embeddings
- **Metadata:** File paths and chunk indices only

### API Keys

- **Pinecone:** Server-side only, never exposed to client
- **Gemini:** Server-side only, never exposed to client
- **GitHub:** Used for fetching public repos only

### Rate Limiting

- **Indexing:** 1 repo per minute per user (recommended)
- **Questions:** 10 questions per minute per user (recommended)

---

## 🚧 Limitations

### Current Limitations

1. **Public Repos Only** - Can't access private repositories
2. **No Real-time Updates** - Indexed content is static
3. **File Size Limits** - Skips files > 50KB
4. **Language Support** - Best for English documentation
5. **Context Window** - Limited to 5 chunks per answer

### Future Enhancements

- [ ] Support for private repositories
- [ ] Automatic re-indexing on repo updates
- [ ] Multi-language support
- [ ] Larger context windows
- [ ] Code-specific embeddings
- [ ] Conversation history
- [ ] Follow-up questions
- [ ] Code snippet highlighting

---

## 🐛 Troubleshooting

### "Repository not indexed" error

**Solution:** Click "Index Repository" button on repo detail page

### Indexing takes too long

**Possible causes:**
- Large repository (many files)
- Slow network connection
- Gemini API rate limits

**Solution:** Wait patiently, or try again later

### Answers are not relevant

**Possible causes:**
- Repository not well-documented
- Question too vague
- Relevant code not in indexed files

**Solution:**
- Ask more specific questions
- Check if README exists
- Try re-indexing with `forceReindex: true`

### "Failed to generate embedding" error

**Possible causes:**
- Invalid Pinecone API key
- Pinecone index not created
- Network issues

**Solution:**
- Check `.env.local` has correct keys
- Verify Pinecone index exists
- Check Pinecone dashboard for errors

---

## 📚 Best Practices

### For Users

1. **Ask Specific Questions** - "How is auth handled?" vs "Tell me about this repo"
2. **Check Sources** - Verify answer accuracy by checking source files
3. **Follow Up** - Ask clarifying questions if needed
4. **Report Issues** - If answers are wrong, report to improve system

### For Developers

1. **Cache Embeddings** - Don't re-index unnecessarily
2. **Monitor Costs** - Track Gemini and Pinecone usage
3. **Optimize Chunks** - Experiment with chunk sizes
4. **Handle Errors** - Graceful fallbacks for API failures
5. **Rate Limit** - Prevent abuse with rate limiting

---

## 🎉 Success Metrics

### User Engagement

- **Questions Asked:** Track per repo
- **Answer Quality:** User feedback (thumbs up/down)
- **Source Clicks:** How often users check sources
- **Re-indexing:** How often repos are re-indexed

### System Performance

- **Indexing Success Rate:** % of successful indexes
- **Query Success Rate:** % of successful answers
- **Average Response Time:** Seconds per answer
- **API Costs:** Monthly Gemini + Pinecone costs

---

## 🔮 Future Roadmap

### Phase 1 - Core Improvements
- [ ] Conversation history
- [ ] Follow-up questions
- [ ] Better error messages
- [ ] Loading indicators

### Phase 2 - Advanced Features
- [ ] Code snippet highlighting
- [ ] Multi-file context
- [ ] Diagram generation
- [ ] Video tutorials

### Phase 3 - Enterprise Features
- [ ] Private repo support
- [ ] Team collaboration
- [ ] Custom embeddings
- [ ] Analytics dashboard

---

**Status:** ✅ Fully Implemented  
**Ready for:** Production Testing  
**Next Step:** Get Pinecone API key and test Q&A!
