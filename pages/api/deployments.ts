import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { connectToDatabase } from '../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const client = await connectToDatabase();
    if (!client) {
      return res.status(200).json({ deployments: [] });
    }

    const db = client.db();
    const deployments = await db
      .collection('deployments')
      .find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return res.status(200).json({
      deployments: deployments.map((d) => ({
        id: d._id,
        repoName: d.repoName,
        repoUrl: d.repoUrl,
        vercelUrl: d.vercelUrl,
        framework: d.framework,
        type: d.type,
        createdAt: d.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Failed to get deployments:', error);
    return res.status(500).json({
      error: 'Failed to get deployments',
      details: error.message,
    });
  }
}
