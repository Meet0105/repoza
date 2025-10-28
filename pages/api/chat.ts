import { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from '../../backend/gemini';

const REPOZA_KNOWLEDGE_BASE = `
# REPOZA - AI-Powered GitHub Repository Platform

## CORE FEATURES:

### 1. SEARCH & DISCOVERY
- **Smart Search**: Search GitHub repositories with AI-powered ranking
- **Filters**: Filter by language, stars, forks, last updated
- **AI Ranking**: Toggle AI ranking for more relevant results
- **Sorting**: Sort by stars, forks, or custom AI score
- **Real-time Results**: Instant search with pagination

### 2. BOILERPLATE GENERATOR
- **AI-Powered**: Generate project boilerplates using AI
- **Multi-Language**: Supports JavaScript, Python, Go, Java, etc.
- **Customizable**: Choose framework, features, and structure
- **Instant Download**: Download as ZIP file
- **Location**: Available at /generator page

### 3. LEARNING PATHS
- **AI-Generated**: Personalized learning journeys
- **4 Levels**: Beginner → Intermediate → Advanced → Expert
- **Curated Repos**: Best GitHub repos for each level
- **Progress Tracking**: Mark steps complete, track percentage
- **Skills & Projects**: Clear objectives and practice projects
- **Location**: Available at /learn page

### 4. COLLECTIONS
- **Save Repos**: Organize favorite repositories
- **Multiple Collections**: Create unlimited collections
- **Heart Icon**: Click heart on any repo to save
- **Export/Import**: Download collections as JSON
- **Location**: Available at /collections page

### 5. DEPLOYMENT
- **One-Click Deploy**: Deploy to Vercel instantly
- **Existing Repos**: Deploy any GitHub repo
- **Generated Boilerplates**: Deploy generated code
- **Auto-Configuration**: Automatic setup and deployment

### 6. LIVE PREVIEW
- **StackBlitz Integration**: Preview repos in browser
- **No Installation**: Test code without cloning
- **Interactive**: Edit and run code live
- **Multiple Frameworks**: React, Vue, Angular, etc.

### 7. CODE CONVERTER
- **Multi-Language**: Convert between languages
- **AI-Powered**: Smart code translation
- **Syntax Highlighting**: Beautiful code display
- **Copy to Clipboard**: Easy code copying

### 8. DEPENDENCY ANALYZER
- **Health Check**: Analyze repo dependencies
- **Outdated Detection**: Find packages needing updates
- **Vulnerability Scan**: Security issue warnings
- **Health Score**: 0-100 quality rating
- **Multi-Language**: JavaScript, Python, Go support

### 9. SETUP GUIDE
- **AI-Generated**: Step-by-step setup instructions
- **OS-Specific**: Windows, macOS, Linux commands
- **Prerequisites**: Required software and versions
- **Troubleshooting**: Common issues and solutions

### 10. REPO Q&A
- **Ask Questions**: Chat with AI about any repo
- **Context-Aware**: Understands repo structure
- **Code Explanations**: Explain specific files
- **Indexing**: Index repos for better answers

### 11. ADMIN PANEL
- **API Keys**: Configure GitHub, Gemini, Pinecone
- **Ranking Weights**: Adjust search algorithm
- **Usage Stats**: Monitor API usage
- **Theme Settings**: Customize appearance
- **Location**: Available at /admin page

### 12. HISTORY
- **Search History**: Track your searches
- **Repo History**: Visited repositories
- **Boilerplate History**: Generated projects
- **Location**: Available at /history page

## NAVIGATION:
- **Home (/)**: Search repositories
- **Generator (/generator)**: Create boilerplates
- **Learn (/learn)**: Learning paths
- **Collections (/collections)**: Saved repos
- **History (/history)**: Your activity
- **Admin (/admin)**: Settings

## AUTHENTICATION:
- **GitHub OAuth**: Sign in with GitHub
- **Protected Routes**: Some features require login
- **Session Management**: Secure authentication

## COMMON TASKS:

### How to Search:
1. Go to home page (/)
2. Type your query in search bar
3. Use filters to refine results
4. Enable AI ranking for better results
5. Click on repo to see details

### How to Generate Boilerplate:
1. Go to /generator
2. Describe your project
3. Select language and features
4. Click "Generate Boilerplate"
5. Download ZIP file

### How to Create Learning Path:
1. Go to /learn
2. Enter topic (e.g., "React")
3. Select your current level
4. Click "Generate Path"
5. Follow the structured journey

### How to Save Repos:
1. Find a repo you like
2. Click the heart icon
3. Select or create collection
4. Repo is saved!

### How to Deploy:
1. Go to repo detail page
2. Click "Deploy to Vercel"
3. Authorize Vercel
4. Deployment starts automatically

## TROUBLESHOOTING:

### Search not working:
- Check internet connection
- Verify GitHub API key in admin
- Try different search terms

### Deployment failed:
- Ensure logged in
- Check Vercel connection in admin
- Verify repo has package.json

### AI features not working:
- Check Gemini API key in admin
- Verify API key is valid
- Check API usage limits

### Collections not saving:
- Ensure logged in
- Check MongoDB connection
- Try refreshing page

## TIPS & TRICKS:
- Use AI ranking for better search results
- Save repos to collections for later
- Create learning paths to learn systematically
- Use dependency analyzer before using repos
- Generate setup guides for quick start
- Deploy to Vercel for instant hosting
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
      contextInfo = 'User is on the SEARCH page.';
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
      contextInfo = 'User is viewing a REPOSITORY DETAIL page.';
    }

    const conversationHistory = previousMessages
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are the Repoza AI Assistant, a helpful and friendly chatbot for the Repoza platform.

${REPOZA_KNOWLEDGE_BASE}

CONTEXT: ${contextInfo}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n` : ''}

USER QUESTION: ${message}

INSTRUCTIONS:
- Be helpful, friendly, and concise
- Use emojis to make responses engaging
- Provide step-by-step instructions when needed
- Suggest relevant features the user might not know about
- If user asks about something not in Repoza, politely explain what Repoza can do
- Use markdown formatting for better readability
- Keep responses under 200 words unless detailed explanation needed
- Always be encouraging and positive

Respond to the user's question:`;

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
