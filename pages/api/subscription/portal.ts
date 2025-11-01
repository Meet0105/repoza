import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { cancelSubscription } from '../../../utils/razorpay';
import { getUserSubscription } from '../../../utils/subscriptionChecker';
import { connectToDatabase } from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET - Get subscription details
  if (req.method === 'GET') {
    try {
      const userSubscription = await getUserSubscription(session.user.email);
      res.status(200).json(userSubscription);
    } catch (error: any) {
      console.error('Error getting subscription:', error);
      res.status(500).json({ error: 'Failed to get subscription' });
    }
    return;
  }

  // POST - Cancel subscription
  if (req.method === 'POST') {
    try {
      const { action } = req.body;

      if (action !== 'cancel') {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const userSubscription = await getUserSubscription(session.user.email);
      
      if (!userSubscription.razorpaySubscriptionId) {
        return res.status(400).json({ error: 'No active subscription found' });
      }

      // Cancel subscription in Razorpay
      await cancelSubscription(userSubscription.razorpaySubscriptionId);

      // Update database
      const client = await connectToDatabase();
      if (!client) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const db = client.db();
      await db.collection('users').updateOne(
        { email: session.user.email },
        {
          $set: {
            'subscription.status': 'cancelled',
            'subscription.cancelledAt': new Date(),
          },
        }
      );

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
