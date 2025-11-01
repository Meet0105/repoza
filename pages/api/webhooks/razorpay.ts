import { NextApiRequest, NextApiResponse } from 'next';
import { verifyWebhookSignature } from '../../../utils/razorpay';
import { connectToDatabase } from '../../../backend/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body
async function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body and signature
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Parse the event
    const event = JSON.parse(rawBody);
    const { event: eventType, payload } = event;

    console.log('Razorpay webhook event:', eventType);

    const client = await connectToDatabase();
    if (!client) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const db = client.db();

    // Handle different event types
    switch (eventType) {
      case 'subscription.activated': {
        // Subscription activated (first payment successful)
        const subscription = payload.subscription.entity;
        const payment = payload.payment.entity;

        await db.collection('users').updateOne(
          { 'subscription.razorpaySubscriptionId': subscription.id },
          {
            $set: {
              'subscription.plan': 'pro',
              'subscription.status': 'active',
              'subscription.razorpayPaymentId': payment.id,
              'subscription.currentPeriodEnd': new Date(subscription.current_end * 1000),
              'subscription.updatedAt': new Date(),
            },
          }
        );
        break;
      }

      case 'subscription.charged': {
        // Recurring payment successful
        const subscription = payload.subscription.entity;
        const payment = payload.payment.entity;

        await db.collection('users').updateOne(
          { 'subscription.razorpaySubscriptionId': subscription.id },
          {
            $set: {
              'subscription.status': 'active',
              'subscription.razorpayPaymentId': payment.id,
              'subscription.currentPeriodEnd': new Date(subscription.current_end * 1000),
              'subscription.updatedAt': new Date(),
            },
          }
        );
        break;
      }

      case 'subscription.cancelled': {
        // Subscription cancelled
        const subscription = payload.subscription.entity;

        await db.collection('users').updateOne(
          { 'subscription.razorpaySubscriptionId': subscription.id },
          {
            $set: {
              'subscription.status': 'cancelled',
              'subscription.cancelledAt': new Date(),
              'subscription.updatedAt': new Date(),
            },
          }
        );
        break;
      }

      case 'subscription.completed': {
        // Subscription completed (all billing cycles done)
        const subscription = payload.subscription.entity;

        await db.collection('users').updateOne(
          { 'subscription.razorpaySubscriptionId': subscription.id },
          {
            $set: {
              'subscription.plan': 'free',
              'subscription.status': 'completed',
              'subscription.updatedAt': new Date(),
            },
          }
        );
        break;
      }

      case 'subscription.halted': {
        // Subscription halted (payment failed)
        const subscription = payload.subscription.entity;

        await db.collection('users').updateOne(
          { 'subscription.razorpaySubscriptionId': subscription.id },
          {
            $set: {
              'subscription.status': 'halted',
              'subscription.updatedAt': new Date(),
            },
          }
        );
        break;
      }

      case 'payment.failed': {
        // Payment failed
        const payment = payload.payment.entity;
        console.log('Payment failed:', payment.id);
        // You can send email notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
}
