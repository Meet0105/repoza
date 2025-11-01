import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { verifyPaymentSignature, getSubscription } from '../../../utils/razorpay';
import { connectToDatabase } from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    // Verify payment signature
    const isValid = verifyPaymentSignature({
      razorpayPaymentId: razorpay_payment_id,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Get subscription details from Razorpay
    const subscription = await getSubscription(razorpay_subscription_id);

    // Update user subscription in database
    const client = await connectToDatabase();
    if (!client) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const db = client.db();
    
    // Calculate subscription end date
    const currentPeriodEnd = new Date();
    if (subscription.plan_id.includes('yearly')) {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          'subscription.plan': 'pro',
          'subscription.status': 'active',
          'subscription.razorpaySubscriptionId': razorpay_subscription_id,
          'subscription.razorpayPaymentId': razorpay_payment_id,
          'subscription.currentPeriodEnd': currentPeriodEnd,
          'subscription.updatedAt': new Date(),
        },
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
}
