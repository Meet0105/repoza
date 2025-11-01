import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../backend/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  const client = await connectToDatabase();
  if (!client) {
    return res.status(500).json({ error: 'Database connection failed' });
  }

  const db = client.db();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.metadata?.customerEmail || session.customer_email;
        
        if (customerEmail && session.subscription) {
          await db.collection('users').updateOne(
            { email: customerEmail },
            {
              $set: {
                'subscription.plan': 'pro',
                'subscription.status': 'active',
                'subscription.stripeCustomerId': session.customer,
                'subscription.stripeSubscriptionId': session.subscription,
                'subscription.currentPeriodEnd': new Date(session.expires_at! * 1000),
              },
            },
            { upsert: true }
          );
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          await db.collection('users').updateOne(
            { 'subscription.stripeSubscriptionId': subscription.id },
            {
              $set: {
                'subscription.status': 'active',
                'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
              },
            }
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await db.collection('users').updateOne(
            { 'subscription.stripeSubscriptionId': invoice.subscription },
            {
              $set: {
                'subscription.status': 'past_due',
              },
            }
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db.collection('users').updateOne(
          { 'subscription.stripeSubscriptionId': subscription.id },
          {
            $set: {
              'subscription.plan': 'free',
              'subscription.status': 'canceled',
            },
          }
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
}
