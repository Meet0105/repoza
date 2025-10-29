import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../backend/mongodb';
import { requireAdminApi } from '../../../utils/adminApiAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAuthorized = await requireAdminApi(req, res);
  if (!isAuthorized) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { githubToken, geminiApiKey } = req.body;

    const client = await connectToDatabase();
    if (!client) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const db = client.db();
    
    // Store encrypted or hashed keys in production
    await db.collection('api_keys').updateOne(
      { type: 'credentials' },
      {
        $set: {
          githubToken,
          geminiApiKey,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating API keys:', error);
    res.status(500).json({ error: 'Failed to update API keys' });
  }
}
