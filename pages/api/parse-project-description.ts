import type { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from '../../backend/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { description } = req.body;

    if (!description) {
        return res.status(400).json({ error: 'Description is required' });
    }

    try {
        const prompt = `You are a project configuration assistant. Based on the user's project description, extract and return ONLY a JSON object with the following structure:

{
  "framework": "nextjs" | "react" | "vue" | "express" | "fastapi",
  "language": "typescript" | "javascript" | "python",
  "features": ["tailwind", "api", "auth", "database", "testing", "docker", "eslint", "prettier"]
}

Rules:
- Return ONLY valid JSON, no markdown, no explanation
- framework: choose the most appropriate one
- language: default to typescript for JS frameworks, python for FastAPI
- features: include only features explicitly mentioned or strongly implied

User description: "${description}"

JSON:`;

        const aiResponse = await generateText(prompt);

        // Extract JSON from response
        let jsonStr = aiResponse.trim();

        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Parse the JSON
        const parsed = JSON.parse(jsonStr);

        return res.status(200).json(parsed);
    } catch (error: any) {
        console.error('Parse error:', error);
        return res.status(500).json({
            error: 'Failed to parse description',
            details: error.message,
        });
    }
}
