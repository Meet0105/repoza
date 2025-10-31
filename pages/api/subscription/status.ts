import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getUserSubscription, getUserUsage, FREE_LIMITS, PRO_LIMITS } from '../../../utils/subscriptionChecker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const subscription = await getUserSubscription(session.user.email);
    const limits = subscription.plan === 'pro' ? PRO_LIMITS : FREE_LIMITS;
    
    // Get today's usage for all features
    const usage = {
      searches: await getUserUsage(session.user.email, 'searches'),
      boilerplates: await getUserUsage(session.user.email, 'boilerplates'),
      codeConversions: await getUserUsage(session.user.email, 'codeConversions'),
      learningPaths: await getUserUsage(session.user.email, 'learningPaths'),
      setupGuides: await getUserUsage(session.user.email, 'setupGuides'),
      dependencyAnalyzes: await getUserUsage(session.user.email, 'dependencyAnalyzes'),
    };

    res.status(200).json({
      subscription,
      limits,
      usage,
      isPro: subscription.plan === 'pro' && subscription.status === 'active',
    });
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
}
