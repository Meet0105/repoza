import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stars, lastUpdated, languageMatch, forks, issues } = req.body;

    const client = await connectToDatabase();
    if (!client) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const db = client.db();
    
    await db.collection('settings').updateOne(
      { type: 'admin' },
      {
        $set: {
          rankingWeights: { stars, lastUpdated, languageMatch, forks, issues },
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating ranking weights:', error);
    res.status(500).json({ error: 'Failed to update ranking weights' });
  }
}
