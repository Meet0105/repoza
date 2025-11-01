import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { createSubscription, RAZORPAY_PLANS } from '../../../utils/razorpay';
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
    const { billingCycle = 'monthly' } = req.body;
    
    const userSubscription = await getUserSubscription(session.user.email);
    
    // Check if user already has active subscription
    if (userSubscription.plan === 'pro' && userSubscription.status === 'active') {
      return res.status(400).json({ error: 'User already has active subscription' });
    }

    // Get plan ID based on billing cycle
    const planId = billingCycle === 'yearly' ? RAZORPAY_PLANS.yearly : RAZORPAY_PLANS.monthly;

    if (!planId) {
      return res.status(500).json({ error: 'Plan not configured' });
    }

    // Create Razorpay subscription
    const subscription = await createSubscription({
      planId,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
    });

    // Return subscription details for frontend
    res.status(200).json({
      subscriptionId: subscription.id,
      planId: subscription.plan_id,
      status: subscription.status,
      // Frontend will use these to open Razorpay checkout
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}
