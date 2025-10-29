import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { isAdmin } from './adminAuth';

/**
 * Middleware to protect admin API routes
 * Use this at the start of admin API handlers
 */
export async function requireAdminApi(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const session = await getSession({ req });
  
  if (!session || !session.user?.email) {
    res.status(401).json({ error: 'Unauthorized - Please sign in' });
    return false;
  }
  
  if (!isAdmin(session.user.email)) {
    res.status(403).json({ error: 'Forbidden - Admin access required' });
    return false;
  }
  
  return true;
}
