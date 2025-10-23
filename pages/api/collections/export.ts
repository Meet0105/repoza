import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getUserCollections } from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = session.user.email;
  const collections = await getUserCollections(email);

  // Export as JSON
  const exportData = {
    exportedAt: new Date().toISOString(),
    user: email,
    collections: collections.map(c => ({
      name: c.name,
      description: c.description,
      repos: c.repos,
      createdAt: c.createdAt,
    })),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="repoza-collections-${Date.now()}.json"`);
  return res.status(200).json(exportData);
}
