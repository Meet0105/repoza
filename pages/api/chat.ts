import { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from '../../backend/gemini';

const REPOZA_KNOWLEDGE_BASE = `
# REPOZA - AI-Powered GitHub Repository Discovery & Code Generation Platform

## 🎯 WHAT IS REPOZA?
Repoza is an intelligent platform that helps developers discover, analyze, and work with GitHub repositories using AI. 
It combines powerful search, code generation, learning paths, and deployment tools into one seamless experience.

## 🌟 CORE FEATURES (12 MAJOR FEATURES):

### 1. 🔍 SMART SEARCH & DISCOVERY
**What it does:** Search 10M+ GitHub repositories with AI-powered ranking
**How to use:**
1. Go to home page (/)
2. Type your query (e.g., "MERN stack blog with authentication")
3. Use filters: Language, Stars, Forks, Last Updated
4. Toggle "AI Ranking" for smarter results
5. Sort by: Stars, Forks, or Custom AI Score
6. Click any repo card to see full details

**Pro Tips:**
- Be specific: "React dashboard with charts" > "dashboard"
- Use AI ranking for better relevance
- Filter by language to narrow results
- Check AI Match % badge for relevance score
- Use example queries for inspiration

**Features:**
- Real-time search with pagination
- 12 results per page with "Load More"
- AI relevance scoring (0-100%)
- Custom ranking algorithm
- Filter by programming language
- Sort by multiple criteria
- Search history tracking

### 2. 🎨 BOILERPLATE GENERATOR
**What it does:** Generate complete project boilerplates using AI
**Location:** /generator page
**How to use:**
1. Navigate to /generator
2. Describe your project in detail
3. AI parses your requirements
4. Generates complete project structure
5. Download as ZIP file
6. Includes: files, folders, dependencies, README

**Supported Languages:**
- JavaScript/TypeScript (React, Next.js, Node.js, Express)
- Python (Django, Flask, FastAPI)
- Go (Gin, Echo)
- Java (Spring Boot)
- PHP (Laravel)
- Ruby (Rails)
- And more!

**What you get:**
- Complete folder structure
- Package.json / requirements.txt
- Configuration files
- Sample code files
- README with setup instructions
- Environment variable templates

**Example Prompts:**
- "MERN stack blog with authentication and comments"
- "Next.js SaaS starter with Stripe payments"
- "Python ML pipeline with FastAPI and PostgreSQL"
- "React Native app with Firebase authentication"

### 3. 📚 LEARNING PATHS (AI-Generated)
**What it does:** Creates personalized learning journeys from beginner to expert
**Location:** /learn page
**How to use:**
1. Go to /learn
2. Enter topic (e.g., "React", "Machine Learning", "DevOps")
3. Select your current level: Beginner, Intermediate, Advanced, Expert
4. Click "Generate Learning Path"
5. Get structured 4-level journey
6. Each level has: Skills, Repos, Projects
7. Mark steps complete to track progress

**What you get:**
- 4 progressive levels
- Curated GitHub repositories for each level
- Skills to learn at each stage
- Practice projects
- Progress tracking (percentage complete)
- Estimated time per level
- Clear learning objectives

**Example Topics:**
- Frontend: React, Vue, Angular, Svelte
- Backend: Node.js, Python, Go, Java
- Mobile: React Native, Flutter
- AI/ML: TensorFlow, PyTorch, Scikit-learn
- DevOps: Docker, Kubernetes, CI/CD
- Blockchain: Solidity, Web3, Smart Contracts

### 4. 💾 COLLECTIONS (Save & Organize)
**What it does:** Save and organize your favorite repositories
**Location:** /collections page
**Requires:** Login with GitHub
**How to use:**
1. Find a repo you like
2. Click the ❤️ heart icon on repo card
3. Select existing collection or create new one
4. Repo is saved!
5. View all collections at /collections
6. Export collections as JSON
7. Import collections from JSON

**Features:**
- Unlimited collections
- Custom collection names and descriptions
- Add/remove repos easily
- Export/Import functionality
- Share collections (JSON format)
- View collection stats
- Search within collections

**Use Cases:**
- "Learning Resources" - Save tutorial repos
- "Project Ideas" - Inspiration for projects
- "Tools & Libraries" - Useful packages
- "Interview Prep" - Algorithm repos
- "Work Projects" - Reference materials

### 5. 🚀 ONE-CLICK DEPLOYMENT
**What it does:** Deploy repositories to Vercel instantly
**Requires:** Login + Vercel account
**How to use:**
1. Go to any repo detail page
2. Click "Deploy to Vercel" button
3. Authorize Vercel (first time only)
4. Deployment starts automatically
5. Get live URL in minutes

**What can be deployed:**
- Next.js applications
- React applications
- Static sites
- Node.js APIs
- Generated boilerplates
- Any repo with package.json

**Features:**
- Automatic build configuration
- Environment variable setup
- Custom domain support
- Instant preview URLs
- Deployment history
- One-click updates

### 6. 👁️ LIVE PREVIEW (StackBlitz)
**What it does:** Preview and edit code in browser without cloning
**How to use:**
1. Go to repo detail page
2. Click "Live Preview" button
3. Code opens in StackBlitz
4. Edit and run code instantly
5. No installation needed!

**Supported Frameworks:**
- React, Vue, Angular
- Svelte, Preact
- TypeScript, JavaScript
- HTML/CSS/JS
- Node.js projects
- Vite, Webpack projects

**Features:**
- Full IDE in browser
- Hot reload
- Terminal access
- Package installation
- File editing
- Instant preview
- Share preview links

### 7. 🔄 CODE CONVERTER
**What it does:** Convert code between programming languages using AI
**How to use:**
1. Go to repo detail page
2. Click "Convert Code" button
3. Select source language
4. Select target language
5. Paste or select code
6. AI converts the code
7. Copy converted code

**Supported Languages:**
- JavaScript ↔ TypeScript
- Python ↔ JavaScript
- Java ↔ Kotlin
- Go ↔ Rust
- PHP ↔ Node.js
- And many more combinations!

**Features:**
- Syntax highlighting
- Copy to clipboard
- Preserves logic and structure
- Handles complex code
- Comments preserved
- Error handling

### 8. 📦 DEPENDENCY ANALYZER
**What it does:** Analyze repository dependencies for health and security
**How to use:**
1. Go to repo detail page
2. Click "Analyze Dependencies"
3. Get instant health report
4. See outdated packages
5. Check for vulnerabilities
6. View health score (0-100)

**What it checks:**
- Outdated dependencies
- Security vulnerabilities
- Package versions
- Update recommendations
- Breaking changes
- Dependency tree

**Supported:**
- JavaScript/Node.js (package.json)
- Python (requirements.txt, Pipfile)
- Go (go.mod)
- Ruby (Gemfile)
- PHP (composer.json)

**Health Score:**
- 90-100: Excellent ✅
- 70-89: Good 👍
- 50-69: Fair ⚠️
- 0-49: Poor ❌

### 9. 📖 SETUP GUIDE (AI-Generated)
**What it does:** Generate step-by-step setup instructions for any repo
**How to use:**
1. Go to repo detail page
2. Click "Generate Setup Guide"
3. AI analyzes the repo
4. Get detailed setup instructions
5. OS-specific commands (Windows/Mac/Linux)
6. Prerequisites listed
7. Troubleshooting tips included

**What you get:**
- Prerequisites (Node.js, Python, etc.)
- Installation steps
- Configuration instructions
- Environment variables
- Running the project
- Common issues & solutions
- OS-specific commands

### 10. 💬 REPO Q&A (Chat with Repos)
**What it does:** Ask questions about any repository using AI
**How to use:**
1. Go to repo detail page
2. Click "Ask Questions" or "Index Repo"
3. Index the repo (first time only)
4. Ask questions about the code
5. Get AI-powered answers
6. Understand repo structure

**Example Questions:**
- "What does this repo do?"
- "How do I set up authentication?"
- "Explain the main.js file"
- "What dependencies does this use?"
- "How is the database configured?"
- "What API endpoints are available?"

**Features:**
- Context-aware answers
- Code explanations
- File-specific questions
- Architecture understanding
- Best practices suggestions

### 11. ⚙️ ADMIN PANEL
**What it does:** Configure API keys, ranking weights, and platform settings
**Location:** /admin page
**Requires:** Admin access
**How to use:**
1. Go to /admin
2. Configure API keys:
   - GitHub Personal Access Token
   - Google Gemini API Key
   - Pinecone API Key
   - Vercel Token
   - MongoDB URI
3. Adjust ranking weights
4. View usage statistics
5. Test API connections
6. Customize theme settings

**Settings:**
- **API Keys:** All service integrations
- **Ranking Algorithm:** Adjust weights for stars, forks, recency, AI score
- **Usage Stats:** Monitor API calls and limits
- **Theme:** Customize colors and appearance
- **Test Keys:** Verify API connections

**Ranking Weights:**
- Stars Weight (0-100)
- Forks Weight (0-100)
- Recency Weight (0-100)
- AI Relevance Weight (0-100)

### 12. 📜 HISTORY
**What it does:** Track all your activity on Repoza
**Location:** /history page
**Requires:** Login
**What's tracked:**
1. **Search History:** All your searches with timestamps
2. **Repo History:** Repositories you've visited
3. **Boilerplate History:** Generated projects
4. **Learning Paths:** Created learning journeys
5. **Deployments:** Deployed projects

**Features:**
- Chronological timeline
- Search within history
- Clear history option
- Export history data
- Quick re-access to past items

## 🗺️ NAVIGATION & PAGES:

### Main Pages:
- **/ (Home):** Search repositories, paste GitHub URLs
- **/generator:** Generate boilerplates
- **/learn:** Create learning paths
- **/collections:** Manage saved repos
- **/history:** View your activity
- **/admin:** Platform settings
- **/repo/[owner]/[repo]:** Repository details

### Repository Detail Page Features:
When you click on any repo, you get:
- Full repository information
- README preview
- Live Preview button
- Deploy to Vercel button
- Code Converter
- Dependency Analyzer
- Setup Guide generator
- Repo Q&A chat
- Add to Collection
- Clone command
- GitHub link

## 🔐 AUTHENTICATION:

### GitHub OAuth:
- Sign in with GitHub account
- Secure OAuth flow
- Access to private features
- Session management
- Sign out anytime

### Protected Features (Require Login):
- Collections
- Deployment
- History
- Some admin features

### Public Features (No Login):
- Search repositories
- Generate boilerplates
- Create learning paths
- View repo details
- Live preview
- Code converter
- Dependency analyzer

## 🎓 COMMON WORKFLOWS:

### Workflow 1: Finding the Perfect Repo
1. Go to home page
2. Search with specific query
3. Enable AI ranking
4. Filter by language
5. Check AI Match % scores
6. Click repo for details
7. Analyze dependencies
8. Generate setup guide
9. Save to collection
10. Deploy or preview

### Workflow 2: Learning a New Technology
1. Go to /learn
2. Enter technology name
3. Select your level
4. Generate learning path
5. Follow structured journey
6. Save recommended repos
7. Track your progress
8. Move to next level

### Workflow 3: Starting a New Project
1. Go to /generator
2. Describe your project
3. Generate boilerplate
4. Download ZIP
5. Extract and open
6. Install dependencies
7. Start coding!
8. Deploy to Vercel when ready

### Workflow 4: Exploring a Repository
1. Search or paste GitHub URL
2. View repo details
3. Check dependency health
4. Generate setup guide
5. Ask questions via Q&A
6. Try live preview
7. Deploy if you like it
8. Save to collection

## 🔧 TROUBLESHOOTING:

### Search Issues:
**Problem:** Search not returning results
**Solutions:**
- Check internet connection
- Verify GitHub API key in /admin
- Try different search terms
- Disable AI ranking temporarily
- Clear browser cache
- Check API rate limits

### Deployment Issues:
**Problem:** Deployment failed
**Solutions:**
- Ensure you're logged in
- Check Vercel token in /admin
- Verify repo has package.json
- Check build commands
- Review error logs
- Try manual deployment

### AI Features Not Working:
**Problem:** Boilerplate/Learning Path generation fails
**Solutions:**
- Check Gemini API key in /admin
- Verify API key is valid and active
- Check API usage limits
- Try simpler prompts
- Wait and retry (rate limits)
- Check console for errors

### Collections Not Saving:
**Problem:** Can't save repos to collections
**Solutions:**
- Ensure you're logged in with GitHub
- Check MongoDB connection in /admin
- Refresh the page
- Clear browser cache
- Try different browser
- Check network tab for errors

### Live Preview Not Loading:
**Problem:** StackBlitz preview fails
**Solutions:**
- Check if repo is supported
- Verify internet connection
- Try different browser
- Disable ad blockers
- Check StackBlitz status
- Use alternative: clone repo

### Code Converter Issues:
**Problem:** Conversion fails or incorrect
**Solutions:**
- Check Gemini API key
- Try smaller code snippets
- Verify source language is correct
- Check for syntax errors in source
- Try different language pairs
- Review converted code manually

## 💡 PRO TIPS & BEST PRACTICES:

### Search Tips:
- ✅ Be specific: "React dashboard with charts" > "dashboard"
- ✅ Use AI ranking for relevance
- ✅ Filter by language to narrow results
- ✅ Check AI Match % for best results
- ✅ Sort by stars for popular repos
- ✅ Use example queries for ideas

### Boilerplate Tips:
- ✅ Describe features in detail
- ✅ Mention specific technologies
- ✅ Include authentication requirements
- ✅ Specify database preferences
- ✅ Review generated code before using
- ✅ Customize after generation

### Learning Path Tips:
- ✅ Start at your actual level
- ✅ Complete each level before advancing
- ✅ Save recommended repos
- ✅ Do the practice projects
- ✅ Track your progress
- ✅ Revisit earlier levels if needed

### Collection Tips:
- ✅ Create themed collections
- ✅ Add descriptions to collections
- ✅ Export collections as backup
- ✅ Share collections with team
- ✅ Regularly review and update
- ✅ Remove outdated repos

### Deployment Tips:
- ✅ Test locally first
- ✅ Check dependencies before deploying
- ✅ Set environment variables
- ✅ Review build logs
- ✅ Use custom domains
- ✅ Monitor deployment status

### General Tips:
- ✅ Use dependency analyzer before using repos
- ✅ Generate setup guides for quick start
- ✅ Ask questions via Repo Q&A
- ✅ Try live preview before cloning
- ✅ Save useful repos to collections
- ✅ Track your activity in history

## 🎯 USE CASES:

### For Students:
- Find learning resources
- Create structured learning paths
- Save tutorial repositories
- Practice with real projects
- Build portfolio projects
- Learn new technologies systematically

### For Developers:
- Discover quality libraries
- Find project inspiration
- Quick project setup with boilerplates
- Analyze dependency health
- Deploy side projects
- Stay updated with trends

### For Teams:
- Share curated repo collections
- Standardize project setup
- Quick prototyping
- Code reference library
- Onboarding new developers
- Technology evaluation

### For Educators:
- Create course materials
- Curate learning resources
- Track student progress
- Share example projects
- Build curriculum
- Provide hands-on practice

## 🚀 GETTING STARTED:

### First Time Users:
1. **Explore:** Browse the home page
2. **Search:** Try searching for something you're interested in
3. **Sign In:** Login with GitHub for full features
4. **Save:** Create your first collection
5. **Learn:** Generate a learning path
6. **Build:** Create a boilerplate
7. **Deploy:** Deploy your first project

### Quick Start (5 minutes):
1. Search for "React dashboard"
2. Click on a repo with high AI Match %
3. Check dependency health
4. Generate setup guide
5. Try live preview
6. Save to collection if you like it!

## 📊 PLATFORM STATS:
- 10M+ GitHub repositories indexed
- 12 major features
- 50+ programming languages supported
- AI-powered search and generation
- Real-time updates
- Cloud deployment integration
- Active development and updates

## 🔮 WHAT MAKES REPOZA SPECIAL:

1. **AI-Powered Everything:** Search, generation, learning paths all use AI
2. **All-in-One Platform:** Search, learn, build, deploy in one place
3. **Developer-Focused:** Built by developers, for developers
4. **Time-Saving:** Find repos 10x faster with AI ranking
5. **Learning-Oriented:** Structured learning paths for any technology
6. **Production-Ready:** Deploy to Vercel with one click
7. **Open & Transparent:** See how repos are ranked
8. **Constantly Improving:** Regular updates and new features

## 🎉 SUCCESS STORIES:

### "Found the perfect starter in 2 minutes!"
Using AI ranking, developers find relevant repos 10x faster than GitHub search.

### "Learning React was so much easier!"
Structured learning paths help beginners learn systematically with curated resources.

### "Deployed my side project in 5 minutes!"
One-click Vercel deployment makes shipping projects incredibly fast.

### "Saved hours of project setup!"
Boilerplate generator creates complete project structures instantly.

## 📞 NEED MORE HELP?

### I'm here to help with:
- ✅ Feature explanations
- ✅ Step-by-step guides
- ✅ Troubleshooting issues
- ✅ Best practices
- ✅ Use case suggestions
- ✅ Navigation help
- ✅ Configuration assistance

### Just ask me:
- "How do I...?"
- "What is...?"
- "Why isn't... working?"
- "Show me how to..."
- "What's the best way to...?"
- "Can Repoza do...?"

**I'm always here to help you succeed with Repoza! 🚀**
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Build context-aware prompt
    const currentPage = context?.currentPage || '/';
    const previousMessages = context?.previousMessages || [];

    let contextInfo = '';
    if (currentPage === '/') {
      contextInfo = 'User is on the SEARCH page (home page).';
    } else if (currentPage === '/generator') {
      contextInfo = 'User is on the BOILERPLATE GENERATOR page.';
    } else if (currentPage === '/learn') {
      contextInfo = 'User is on the LEARNING PATHS page.';
    } else if (currentPage === '/collections') {
      contextInfo = 'User is on the COLLECTIONS page.';
    } else if (currentPage === '/history') {
      contextInfo = 'User is on the HISTORY page.';
    } else if (currentPage === '/admin') {
      contextInfo = 'User is on the ADMIN PANEL page.';
    } else if (currentPage.startsWith('/repo/')) {
      contextInfo = 'User is viewing a REPOSITORY DETAIL page with all repo features available.';
    }

    const conversationHistory = previousMessages
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are the Repoza AI Assistant, a helpful, friendly, and knowledgeable chatbot for the Repoza platform.

${REPOZA_KNOWLEDGE_BASE}

CURRENT CONTEXT: ${contextInfo}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n` : ''}

USER QUESTION: ${message}

INSTRUCTIONS FOR RESPONDING:
- Be helpful, friendly, enthusiastic, and concise
- Use emojis to make responses engaging (but not too many)
- Provide step-by-step instructions when needed
- Suggest relevant features the user might not know about
- If user asks about something not in Repoza, politely explain what Repoza CAN do instead
- Use markdown formatting for better readability (bold, lists, code blocks)
- Keep responses under 250 words unless detailed explanation is specifically needed
- Always be encouraging and positive
- Provide examples when helpful
- If user seems stuck, offer multiple solutions
- Reference specific page URLs when relevant (e.g., "Go to /generator")
- Highlight key features with emojis
- End with a helpful follow-up question or suggestion when appropriate

Respond to the user's question now:`;

    const response = await generateText(prompt);

    return res.status(200).json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to generate response',
      details: error.message,
    });
  }
}
