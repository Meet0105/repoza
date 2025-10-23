import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { 
  addRepoToCollection, 
  removeRepoFromCollection 
} from '../../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = session.user.email;
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid collection ID' });
  }

  if (req.method === 'POST') {
    // Add repo to collection
    const { repo } = req.body;

    if (!repo || !repo.full_name) {
      return res.status(400).json({ error: 'Invalid repo data' });
    }

    const success = await addRepoToCollection(id, email, repo);

    if (!success) {
      return res.status(500).json({ error: 'Failed to add repo to collection' });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    // Remove repo from collection
    const { repoFullName } = req.body;

    if (!repoFullName) {
      return res.status(400).json({ error: 'Repo full name is required' });
    }

    const success = await removeRepoFromCollection(id, email, repoFullName);

    if (!success) {
      return res.status(500).json({ error: 'Failed to remove repo from collection' });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
