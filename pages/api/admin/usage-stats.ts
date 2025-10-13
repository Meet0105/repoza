import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await connectToDatabase();
    if (!client) {
      return res.status(200).json({
        githubCalls: 0,
        geminiRequests: 0,
        totalSearches: 0,
        totalBoilerplates: 0,
      });
    }

    const db = client.db();
    
    // Get usage stats from various collections
    const [githubCalls, geminiRequests, totalSearches, totalBoilerplates] = await Promise.all([
      db.collection('api_logs').countDocuments({ service: 'github' }),
      db.collection('api_logs').countDocuments({ service: 'gemini' }),
      db.collection('searches').countDocuments(),
      db.collection('boilerplates').countDocuments(),
    ]);

    res.status(200).json({
      githubCalls,
      geminiRequests,
      totalSearches,
      totalBoilerplates,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
}
