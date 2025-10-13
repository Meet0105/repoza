import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { generateVercelDeployUrl } from '../../backend/vercel';
import { connectToDatabase } from '../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { repoUrl, framework = 'nextjs' } = req.body;

    if (!repoUrl) {
        return res.status(400).json({ error: 'repoUrl is required' });
    }

    // Validate GitHub URL
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(repoUrl.replace(/\.git$/, ''))) {
        return res.status(400).json({
            error: 'Invalid GitHub URL. Format: https://github.com/owner/repo',
        });
    }

    try {
        // Extract repo name from URL
        const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
        const repoName = match ? match[2].replace(/\.git$/, '') : 'unknown';

        // Generate Vercel deploy URL
        const vercelDeployUrl = generateVercelDeployUrl(repoUrl);

        // Save deployment record
        try {
            const client = await connectToDatabase();
            if (client) {
                const db = client.db();
                await db.collection('deployments').insertOne({
                    userId: session.user.email,
                    repoName,
                    repoUrl: repoUrl.replace(/\.git$/, ''),
                    vercelUrl: vercelDeployUrl,
                    framework,
                    type: 'existing',
                    createdAt: new Date(),
                });
            }
        } catch (dbError) {
            console.error('Failed to save deployment record:', dbError);
            // Don't fail the request if DB save fails
        }

        return res.status(200).json({
            success: true,
            repoUrl: repoUrl.replace(/\.git$/, ''),
            vercelDeployUrl,
            message: 'Redirecting to Vercel for deployment...',
        });
    } catch (error: any) {
        console.error('Deployment error:', error);
        return res.status(500).json({
            error: 'Failed to prepare deployment',
            details: error.message,
        });
    }
}
