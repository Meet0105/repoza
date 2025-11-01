import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createCheckoutSession, STRIPE_PRICES } from '../../../utils/stripe';
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
    const { billingCycle = 'monthly' } = req.body;
    
    const userSubscription = await getUserSubscription(session.user.email);
    
    // Check if user already has active subscription
    if (userSubscription.plan === 'pro' && userSubscription.status === 'active') {
      return res.status(400).json({ error: 'User already has active subscription' });
    }

    // Get price ID based on billing cycle
    const priceId = billingCycle === 'yearly' ? STRIPE_PRICES.yearly : STRIPE_PRICES.monthly;

    if (!priceId) {
      return res.status(500).json({ error: 'Plan not configured' });
    }

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      customerEmail: session.user.email,
      priceId,
      successUrl: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/pricing`,
    });

    // Return checkout URL
    res.status(200).json({
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
