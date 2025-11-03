import { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from '../../backend/gemini';
import { requireFeatureAccess } from '../../utils/apiFeatureGate';
import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

interface LearningStep {
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  title: string;
  description: string;
  repos: Array<{
    owner: string;
    repo: string;
    url: string;
    stars: number;
    description: string;
    whatToLearn: string;
    estimatedTime: string;
  }>;
  skills: string[];
  projects: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check feature access
  const access = await requireFeatureAccess(req, res, 'learning-path');
  if (!access) return; // Response already sent

  const { topic, currentLevel } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Search for relevant repositories
    const searchQuery = `${topic} tutorial example learning`;
    const headers: any = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      searchQuery
    )}&sort=stars&order=desc&per_page=20`;

    const searchResponse = await axios.get(searchUrl, { headers });
    const repos = searchResponse.data.items;

    // Generate AI-powered learning path
    const prompt = `You are an expert programming educator. Create a comprehensive learning path for someone who wants to learn "${topic}".

Current Level: ${currentLevel || 'Beginner'}

Available repositories (top GitHub repos):
${repos
  .slice(0, 15)
  .map(
    (r: any, i: number) =>
      `${i + 1}. ${r.full_name} (${r.stargazers_count} stars) - ${r.description || 'No description'}`
  )
  .join('\n')}

Create a structured learning path with 4 levels: Beginner, Intermediate, Advanced, Expert.

For each level, provide:
1. Level name and description
2. Select 2-3 most appropriate repositories from the list above
3. For each repo, explain WHAT TO LEARN from it (be specific)
4. Estimated time to complete
5. Key skills to master at this level
6. Suggested practice projects

Format your response as JSON with this structure:
{
  "pathTitle": "Learning Path: [Topic]",
  "overview": "Brief overview of the learning journey",
  "totalEstimatedTime": "X weeks/months",
  "steps": [
    {
      "level": "Beginner",
      "title": "Getting Started with [Topic]",
      "description": "What you'll learn at this level",
      "repos": [
        {
          "fullName": "owner/repo",
          "whatToLearn": "Specific things to learn from this repo",
          "estimatedTime": "1-2 weeks"
        }
      ],
      "skills": ["skill1", "skill2"],
      "projects": ["project idea 1", "project idea 2"]
    }
  ]
}

Respond ONLY with valid JSON. Be specific and actionable.`;

    const aiResponse = await generateText(prompt);

    // Parse AI response
    let learningPath;
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      learningPath = JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to generate learning path');
    }

    // Enrich with actual repo data
    const enrichedSteps = learningPath.steps.map((step: any) => {
      const enrichedRepos = step.repos.map((stepRepo: any) => {
        const matchingRepo = repos.find((r: any) => r.full_name === stepRepo.fullName);
        if (matchingRepo) {
          return {
            owner: matchingRepo.owner.login,
            repo: matchingRepo.name,
            url: matchingRepo.html_url,
            stars: matchingRepo.stargazers_count,
            description: matchingRepo.description,
            whatToLearn: stepRepo.whatToLearn,
            estimatedTime: stepRepo.estimatedTime,
          };
        }
        return null;
      }).filter(Boolean);

      return {
        ...step,
        repos: enrichedRepos,
      };
    });

    return res.status(200).json({
      ...learningPath,
      steps: enrichedSteps,
      topic,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Learning path generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate learning path',
      details: error.message,
    });
  }
}
