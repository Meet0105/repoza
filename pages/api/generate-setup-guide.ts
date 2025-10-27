import { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from '../../backend/gemini';
import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { owner, repo, os, readme } = req.body;

  if (!owner || !repo || !os) {
    return res.status(400).json({ error: 'Owner, repo, and OS are required' });
  }

  try {
    // Fetch package.json or other config files to understand the project
    const headers: any = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    let projectInfo = '';
    let language = 'Unknown';
    let framework = 'Unknown';

    // Try to get package.json
    try {
      const packageJsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
      const response = await axios.get(packageJsonUrl, { headers });
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      const packageJson = JSON.parse(content);
      
      language = 'JavaScript/TypeScript';
      projectInfo += `\nPackage: ${packageJson.name}\n`;
      projectInfo += `Description: ${packageJson.description || 'N/A'}\n`;
      
      // Detect framework
      if (packageJson.dependencies) {
        if (packageJson.dependencies.react) framework = 'React';
        if (packageJson.dependencies.next) framework = 'Next.js';
        if (packageJson.dependencies.vue) framework = 'Vue.js';
        if (packageJson.dependencies.angular) framework = 'Angular';
        if (packageJson.dependencies.express) framework = 'Express.js';
        if (packageJson.dependencies.gatsby) framework = 'Gatsby';
      }
      
      projectInfo += `Framework: ${framework}\n`;
      projectInfo += `Scripts: ${Object.keys(packageJson.scripts || {}).join(', ')}\n`;
    } catch (error) {
      // Try requirements.txt for Python
      try {
        const requirementsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`;
        await axios.get(requirementsUrl, { headers });
        language = 'Python';
        framework = 'Python';
      } catch (error) {
        // Try go.mod for Go
        try {
          const goModUrl = `https://api.github.com/repos/${owner}/${repo}/contents/go.mod`;
          await axios.get(goModUrl, { headers });
          language = 'Go';
          framework = 'Go';
        } catch (error) {
          // Try pom.xml for Java
          try {
            const pomUrl = `https://api.github.com/repos/${owner}/${repo}/contents/pom.xml`;
            await axios.get(pomUrl, { headers });
            language = 'Java';
            framework = 'Maven';
          } catch (error) {
            // Default
            language = 'General';
          }
        }
      }
    }

    // Generate AI-powered setup guide
    const prompt = `You are a helpful developer assistant. Generate a comprehensive, step-by-step setup guide for the following GitHub repository.

Repository: ${owner}/${repo}
Language: ${language}
Framework: ${framework}
User's Operating System: ${os}
${projectInfo}

${readme ? `README excerpt:\n${readme.slice(0, 1000)}` : ''}

Generate a detailed setup guide with the following sections:

1. **Prerequisites** - List all required software (Node.js, Python, Go, etc.) with version requirements
2. **Clone Repository** - Exact git clone command
3. **Installation Steps** - Step-by-step commands to install dependencies
4. **Configuration** - Environment variables, config files needed
5. **Running the Project** - Commands to start/run the project
6. **Common Issues** - 3-4 common problems and their solutions
7. **First Steps** - What to do after successful setup

IMPORTANT:
- Use ${os}-specific commands (e.g., for Windows use 'dir' not 'ls')
- Include actual command-line examples
- Be specific and actionable
- Format commands in code blocks
- Keep it concise but complete
- Use emojis for better readability

Format the response in Markdown.`;

    const setupGuide = await generateText(prompt);

    return res.status(200).json({
      setupGuide,
      language,
      framework,
      os,
    });
  } catch (error: any) {
    console.error('Setup guide generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate setup guide',
      details: error.message,
    });
  }
}
