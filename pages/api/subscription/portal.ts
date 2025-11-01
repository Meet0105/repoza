import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createCustomerPortalSession } from '../../../utils/stripe';
import { getUserSubscription } from '../../../utils/subscriptionChecker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userSubscription = await getUserSubscription(session.user.email);
    
    if (!userSubscription.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const portalSession = await createCustomerPortalSession(
      userSubscription.stripeCustomerId,
      `${process.env.NEXTAUTH_URL}/subscription`
    );

    res.status(200).json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
}
