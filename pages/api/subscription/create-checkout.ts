import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { createCheckoutSession } from '../../../utils/stripe';
import { getUserSubscription } from '../../../utils/subscriptionChecker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { currency = 'USD', billingCycle = 'monthly' } = req.body;
    
    const userSubscription = await getUserSubscription(session.user.email);
    
    // Check if user already has active subscription
    if (userSubscription.plan === 'pro' && userSubscription.status === 'active') {
      return res.status(400).json({ error: 'User already has active subscription' });
    }

    const checkoutSession = await createCheckoutSession({
      customerId: userSubscription.stripeCustomerId,
      customerEmail: session.user.email,
      currency: currency.toLowerCase(),
      billingCycle,
      successUrl: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/pricing`,
    });

    res.status(200).json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
