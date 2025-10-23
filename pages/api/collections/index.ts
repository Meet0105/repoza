import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { createCollection, getUserCollections } from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = session.user.email;

  if (req.method === 'GET') {
    // Get all collections for user
    const collections = await getUserCollections(email);
    return res.status(200).json({ collections });
  }

  if (req.method === 'POST') {
    // Create new collection
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await createCollection(email, name.trim(), description);

    if (!collection) {
      return res.status(500).json({ error: 'Failed to create collection' });
    }

    return res.status(201).json({ collection });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
