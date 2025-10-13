import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await connectToDatabase();
    if (!client) {
      return res.status(200).json({ theme: null, rankingWeights: null });
    }

    const db = client.db();
    const settings = await db.collection('settings').findOne({ type: 'admin' });

    res.status(200).json({
      theme: settings?.theme || null,
      rankingWeights: settings?.rankingWeights || null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}
