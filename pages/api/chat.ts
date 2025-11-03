import { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from '../../backend/gemini';

const REPOZA_KNOWLEDGE_BASE = `
# REPOZA - AI-Powered GitHub Repository Discovery & Code Generation Platform

## 🎯 WHAT IS REPOZA?
Repoza is an intelligent platform that helps developers discover, analyze, and work with GitHub repositories using AI. 
It combines powerful search, code generation, learning paths, and deployment tools into one seamless experience.

## 💎 SUBSCRIPTION PLANS:

### FREE PLAN (Always Free):
**What you get:**
- ✅ Smart Search & Discovery (10 searches/day)
- ✅ Boilerplate Generator (3 per day)
- ✅ Dependency Analyzer (5 per day)
- ✅ Code Explanation (unlimited)
- ✅ AI Chatbot (unlimited)
- ✅ Collections (up to 3)
- ✅ Setup Guide Generator (3 per day)
- ✅ History (7 days)

**Perfect for:**
- Students learning to code
- Hobbyists exploring projects
- Trying out Repoza features

### PRO PLAN ($9.99/month or $99.99/year):
**Everything in Free, plus:**
- ✅ **Unlimited Searches** - No daily limits
- ✅ **Code Converter** - Convert between languages
- ✅ **Learning Path Generator** - AI-powered learning journeys
- ✅ **Repository Q&A** - Chat with any repository
- ✅ **Live Preview** - StackBlitz integration
- ✅ **One-Click Deploy** - Deploy to Vercel instantly
- ✅ **Unlimited Boilerplates** - Generate as many as you need
- ✅ **Unlimited Collections** - Organize without limits
- ✅ **30-Day History** - Extended activity tracking
- ✅ **Priority Support** - Get help faster

**Perfect for:**
- Professional developers
- Teams building projects
- Serious learners
- Anyone who wants full access

### MULTI-CURRENCY SUPPORT:
We support 10 currencies for global accessibility:
- 🇺🇸 **USD:** $9.99/month, $99.99/year
- 🇪🇺 **EUR:** €8.99/month, €89.99/year
- 🇬🇧 **GBP:** £7.99/month, £79.99/year
- 🇮🇳 **INR:** ₹799/month, ₹7,999/year
- 🇨🇦 **CAD:** C$12.99/month, C$129.99/year
- 🇦🇺 **AUD:** A$14.99/month, A$149.99/year
- 🇸🇬 **SGD:** S$13.99/month, S$139.99/year
- 🇯🇵 **JPY:** ¥1,299/month, ¥12,999/year
- 🇧🇷 **BRL:** R$49.99/month, R$499.99/year
- 🇲🇽 **MXN:** MX$199/month, MX$1,999/year

**Save ~17% with yearly billing!**

### HOW TO UPGRADE:
1. Go to **/pricing** page
2. Select your currency from dropdown
3. Choose Monthly or Yearly billing
4. Click "Upgrade to Pro"
5. Complete payment with Stripe
6. Instant access to all Pro features!

### MANAGE SUBSCRIPTION:
- View current plan on /pricing page
- Click "Manage Subscription" to:
  - Update payment method
  - Switch between monthly/yearly
  - View invoice history
  - Cancel subscription (keeps access until period ends)
- Powered by Stripe for secure payments

### PAYMENT FEATURES:
- 🔒 **Secure:** Stripe-powered payments
- 💳 **Easy:** Credit/debit cards accepted
- 🌍 **Global:** 10 currencies supported
- 🔄 **Flexible:** Cancel anytime
- 📧 **Receipts:** Automatic email invoices
- 🔐 **Safe:** No charges stored on our servers

## 🌟 CORE FEATURES (15 MAJOR FEATURES):

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

### 3. 📚 LEARNING PATHS (PRO FEATURE 👑)
**What it does:** Creates personalized learning journeys from beginner to expert using AI
**Location:** /learn page
**Requires:** Pro subscription
**How to use:**
1. Go to /learn
2. Enter topic (e.g., "React", "Machine Learning", "DevOps")
3. Select your current level: Beginner, Intermediate, Advanced
4. Click "Generate Learning Path"
5. Get structured 4-level journey with AI-curated content
6. Each level has: Skills, Repos, Projects, Estimated time
7. Mark steps complete to track progress
8. Save paths for later reference

**What you get:**
- 4 progressive levels (Beginner → Intermediate → Advanced → Expert)
- Curated GitHub repositories for each level
- Skills to learn at each stage
- Practice projects with descriptions
- Progress tracking (percentage complete)
- Estimated time per level
- Clear learning objectives
- What to learn from each repo
- Saved learning paths history

**Example Topics:**
- Frontend: React, Vue, Angular, Svelte, Next.js
- Backend: Node.js, Python, Go, Java, Rust
- Mobile: React Native, Flutter, Swift
- AI/ML: TensorFlow, PyTorch, Scikit-learn, LangChain
- DevOps: Docker, Kubernetes, CI/CD, Terraform
- Blockchain: Solidity, Web3, Smart Contracts, DeFi
- Data Science: Pandas, NumPy, Data Visualization
- Game Dev: Unity, Unreal Engine, Godot

**Free users see:** Upgrade prompt explaining Pro benefits

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

### 5. 🚀 ONE-CLICK DEPLOYMENT (PRO FEATURE 👑)
**What it does:** Deploy repositories to Vercel instantly with zero configuration
**Requires:** Pro subscription + GitHub login
**How to use:**
1. Go to any repo detail page
2. Click "Deploy to Vercel" button
3. Authorize Vercel (first time only)
4. Repo is automatically created in your GitHub
5. Deployment starts automatically
6. Get live URL in minutes!

**What can be deployed:**
- Next.js applications
- React applications (Create React App, Vite)
- Static sites (HTML/CSS/JS)
- Node.js APIs
- Vue, Svelte, Angular apps
- Generated boilerplates
- Any repo with package.json

**Deployment Types:**
1. **Existing Repo:** Deploy any GitHub repository
2. **Generated Boilerplate:** Deploy your generated code

**Features:**
- Automatic build configuration
- Framework auto-detection
- Environment variable setup
- Custom domain support
- Instant preview URLs
- Deployment history
- One-click updates
- Automatic HTTPS
- CDN distribution
- Serverless functions support

**How it works:**
1. Repo is forked/created in your GitHub
2. Connected to Vercel automatically
3. Build settings configured
4. Deployment triggered
5. Live URL provided
6. Continuous deployment enabled

**Free users see:** "Upgrade to Deploy" button with Pro benefits

### 6. 👁️ LIVE PREVIEW (PRO FEATURE 👑)
**What it does:** Preview and edit code in browser without cloning using StackBlitz
**Requires:** Pro subscription
**How to use:**
1. Go to repo detail page
2. Click "Live Preview" button
3. Repo is analyzed for framework compatibility
4. Code opens in StackBlitz embedded IDE
5. Edit and run code instantly in browser
6. No installation or cloning needed!

**Supported Frameworks:**
- React, Vue, Angular
- Svelte, Preact, Solid
- TypeScript, JavaScript
- HTML/CSS/JS
- Node.js projects
- Vite, Webpack, Parcel projects
- Next.js, Nuxt, SvelteKit

**Features:**
- Full IDE in browser with VS Code-like interface
- Hot module reload (instant updates)
- Terminal access for commands
- Package installation (npm/yarn)
- File editing with syntax highlighting
- Instant preview pane
- Share preview links
- Download modified code
- No local setup required

**How it works:**
1. Framework is auto-detected
2. Files are fetched from GitHub
3. Project is created in StackBlitz
4. Opens in embedded iframe
5. Full development environment ready!

**Free users see:** Upgrade modal explaining Live Preview benefits

### 7. 🔄 CODE CONVERTER (PRO FEATURE 👑)
**What it does:** Convert entire repositories between programming languages using AI
**Requires:** Pro subscription
**How to use:**
1. Go to repo detail page
2. Click "Convert Code" button
3. Select target language (Python, Java, Go, Rust, PHP, Ruby, TypeScript, etc.)
4. Choose target framework (optional)
5. Select scope: Full repo or specific files
6. AI converts all code files
7. Download as ZIP with converted code

**Supported Conversions:**
- JavaScript/TypeScript → Python, Java, Go, Rust, PHP, Ruby
- Python → JavaScript, TypeScript, Java, Go
- Java → Kotlin, Go, Rust
- Go → Rust, Java
- PHP → Node.js, Python
- And many more combinations!

**What you get:**
- All code files converted
- Dependencies converted (package.json → requirements.txt, etc.)
- Folder structure preserved
- README with conversion notes
- Success/failure report
- Download as ZIP

**Features:**
- Batch conversion (up to 50 files)
- Framework-aware conversion
- Dependency translation
- Syntax preservation
- Logic maintained
- Comments preserved
- Error handling

**Free users see:** Upgrade prompt with Pro benefits

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

### 10. 💬 REPO Q&A (PRO FEATURE 👑)
**What it does:** Ask questions about any repository using AI-powered semantic search
**Requires:** Pro subscription
**How to use:**
1. Go to repo detail page
2. Click "Ask Questions" or "Index Repository"
3. Index the repo (first time only - takes 1-2 minutes)
4. Ask questions about the code in natural language
5. Get AI-powered answers with source references
6. Understand repo structure and implementation

**Example Questions:**
- "What does this repo do and what problem does it solve?"
- "How do I set up authentication in this project?"
- "Explain the main.js file and its purpose"
- "What dependencies does this use and why?"
- "How is the database configured?"
- "What API endpoints are available?"
- "Where is the user authentication logic?"
- "How does the payment system work?"
- "What testing framework is used?"
- "Explain the folder structure"

**Features:**
- Context-aware answers using vector embeddings
- Code explanations with line references
- File-specific questions
- Architecture understanding
- Best practices suggestions
- Source file references
- Relevance scoring
- Chat history within session
- Suggested questions

**How it works:**
1. Repo is indexed using Pinecone vector database
2. Code is chunked and embedded
3. Your question is converted to embedding
4. Most relevant code chunks are retrieved
5. AI generates answer using context
6. Sources are cited

**Free users see:** Inline upgrade prompt with feature explanation

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
- **/learn:** Create learning paths (Pro)
- **/collections:** Manage saved repos
- **/history:** View your activity
- **/pricing:** View plans and upgrade to Pro
- **/admin:** Platform settings (Admin only)
- **/repo/[owner]/[repo]:** Repository details

### Pricing & Subscription:
- **/pricing:** Compare Free vs Pro plans, upgrade, manage subscription
- **/subscription/success:** Payment success confirmation
- **Stripe Customer Portal:** Manage billing, update payment method, cancel subscription

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

### Free Features (No Login Required):
- Search repositories (10/day)
- Generate boilerplates (3/day)
- View repo details
- Dependency analyzer (5/day)
- Code explanation
- AI Chatbot

### Features Requiring Login:
- Collections
- History
- Subscription management
- Deployment (Pro)
- Learning paths (Pro)
- Repo Q&A (Pro)
- Live preview (Pro)
- Code converter (Pro)

### Pro Features (Require Pro Subscription):
- 🔄 Code Converter
- 📚 Learning Path Generator
- 💬 Repository Q&A
- 👁️ Live Preview
- 🚀 One-Click Deploy
- ♾️ Unlimited searches, boilerplates, collections
- 📊 Extended history (30 days)

## 💳 SUBSCRIPTION & BILLING FAQ:

### How do I upgrade to Pro?
1. Go to /pricing page
2. Select your currency
3. Choose monthly or yearly
4. Click "Upgrade to Pro"
5. Complete Stripe checkout
6. Instant access!

### What payment methods are accepted?
- Credit cards (Visa, Mastercard, Amex, Discover)
- Debit cards
- Powered by Stripe (secure & trusted)
- No PayPal or crypto currently

### Can I cancel anytime?
Yes! Cancel anytime from:
1. Go to /pricing
2. Click "Manage Subscription"
3. Click "Cancel subscription"
4. Choose "Cancel at period end"
5. Keep access until billing period ends
6. No refunds for partial months

### What happens when I cancel?
- Subscription continues until period end
- You keep Pro access until then
- After period ends, downgrade to Free
- Your data is preserved
- Can resubscribe anytime

### Can I switch between monthly and yearly?
Yes! In Customer Portal:
1. Click "Manage Subscription"
2. Click "Update plan"
3. Select monthly or yearly
4. Prorated charges applied
5. Changes take effect immediately

### Can I change my currency?
- Currency is set at signup
- To change: Cancel current subscription
- Wait for period to end
- Subscribe again with new currency

### Do you offer refunds?
- No refunds for partial months
- Cancel anytime to stop future charges
- Access continues until period ends
- Contact support for special cases

### Is my payment information secure?
- Yes! We use Stripe for payments
- We never store card details
- PCI DSS compliant
- Industry-standard encryption
- Trusted by millions worldwide

### What if my payment fails?
- You'll receive email notification
- Update payment method in Customer Portal
- Grace period provided
- Access continues during grace period
- Subscription cancelled if not resolved

### Can I get an invoice?
Yes! Invoices are:
- Emailed automatically after payment
- Available in Customer Portal
- Downloadable as PDF
- Include all payment details
- For business expense reports

### Do you offer team/business plans?
- Currently: Individual plans only
- Team plans: Coming soon!
- Contact us for bulk pricing
- Enterprise options available

### What happens to my data if I downgrade?
- All data is preserved
- Collections limited to 3 (oldest kept)
- History limited to 7 days
- Pro features become locked
- Can upgrade anytime to restore access

### Can I try Pro before buying?
- No free trial currently
- But: Cancel anytime!
- Try for a month risk-free
- Full refund if cancelled within 24 hours
- Contact support if not satisfied

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

### Pro Features Showing Upgrade Prompt:
**Problem:** Paid for Pro but still seeing upgrade prompts
**Solutions:**
- Refresh the page (Ctrl+F5)
- Sign out and sign in again
- Check /pricing page for subscription status
- Verify payment succeeded in Stripe
- Check email for payment confirmation
- Wait 1-2 minutes for webhook to process
- Contact support if issue persists

### Payment Failed:
**Problem:** Payment not going through
**Solutions:**
- Check card details are correct
- Ensure sufficient funds
- Try different card
- Check if card supports international payments
- Disable VPN if using one
- Try different browser
- Contact your bank
- Contact our support

### Subscription Not Showing:
**Problem:** Paid but subscription not active
**Solutions:**
- Check email for payment confirmation
- Go to /pricing to verify status
- Wait 2-3 minutes for processing
- Check Stripe dashboard for payment
- Refresh page (Ctrl+F5)
- Sign out and sign in
- Contact support with payment details

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
- 15 major features
- 50+ programming languages supported
- 10 currencies supported globally
- AI-powered search and generation
- Real-time updates
- Cloud deployment integration
- Secure Stripe payments
- Active development and updates

## 🔮 WHAT MAKES REPOZA SPECIAL:

1. **AI-Powered Everything:** Search, generation, learning paths, Q&A all use AI
2. **All-in-One Platform:** Search, learn, build, deploy in one place
3. **Developer-Focused:** Built by developers, for developers
4. **Time-Saving:** Find repos 10x faster with AI ranking
5. **Learning-Oriented:** Structured learning paths for any technology
6. **Production-Ready:** Deploy to Vercel with one click
7. **Global Access:** 10 currencies, worldwide availability
8. **Flexible Pricing:** Free forever plan + affordable Pro
9. **Feature Gates:** Try before you buy, upgrade when ready
10. **Secure Payments:** Stripe-powered, PCI compliant
11. **No Lock-In:** Cancel anytime, data preserved
12. **Constantly Improving:** Regular updates and new features

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
