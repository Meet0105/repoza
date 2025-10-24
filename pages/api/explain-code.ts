import { NextApiRequest, NextApiResponse } from 'next';
import { explainCode } from '../../backend/gemini';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { owner, repo, filePath, code, fileName, language } = req.body;

  if (!code && (!owner || !repo || !filePath)) {
    return res.status(400).json({ error: 'Either code or repo details required' });
  }

  try {
    let codeToExplain = code;
    let fileNameToUse = fileName || filePath;
    let languageToUse = language;

    // If code not provided, fetch it from GitHub
    if (!codeToExplain && owner && repo && filePath) {
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          headers: githubToken ? { Authorization: `token ${githubToken}` } : {},
        }
      );

      if (githubRes.data.content) {
        codeToExplain = Buffer.from(githubRes.data.content, 'base64').toString('utf-8');
      } else {
        return res.status(400).json({ error: 'Could not fetch file content' });
      }

      // Detect language from file extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        js: 'JavaScript',
        jsx: 'JavaScript (React)',
        ts: 'TypeScript',
        tsx: 'TypeScript (React)',
        py: 'Python',
        java: 'Java',
        go: 'Go',
        rs: 'Rust',
        cpp: 'C++',
        c: 'C',
        cs: 'C#',
        rb: 'Ruby',
        php: 'PHP',
        swift: 'Swift',
        kt: 'Kotlin',
        html: 'HTML',
        css: 'CSS',
        scss: 'SCSS',
        json: 'JSON',
        md: 'Markdown',
      };
      languageToUse = langMap[ext || ''] || ext || 'Unknown';
    }

    // Generate explanation
    const explanation = await explainCode(codeToExplain, fileNameToUse, languageToUse);

    return res.status(200).json({ explanation });
  } catch (error: any) {
    console.error('Explain code error:', error);
    return res.status(500).json({ error: error.message || 'Failed to explain code' });
  }
}
