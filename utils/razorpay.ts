import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default razorpay;

// Plan IDs
export const RAZORPAY_PLANS = {
  monthly: process.env.RAZORPAY_PLAN_MONTHLY || '',
  yearly: process.env.RAZORPAY_PLAN_YEARLY || '',
};

// Create subscription
export async function createSubscription({
  planId,
  customerEmail,
  customerName,
  customerPhone,
}: {
  planId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
}) {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12, // Number of billing cycles (12 months for yearly, will auto-renew)
      quantity: 1,
      customer_notify: 1, // Send email/SMS to customer
      notes: {
        email: customerEmail,
        name: customerName || '',
        phone: customerPhone || '',
      },
    });

    return subscription;
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error);
    throw error;
  }
}

// Verify payment signature
export function verifyPaymentSignature({
  razorpayPaymentId,
  razorpaySubscriptionId,
  razorpaySignature,
}: {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}): boolean {
  try {
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest('hex');

    return generatedSignature === razorpaySignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  webhookBody: string,
  webhookSignature: string
): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    return await razorpay.subscriptions.fetch(subscriptionId);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    return await razorpay.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

// Get customer by ID
export async function getCustomer(customerId: string) {
  try {
    return await razorpay.customers.fetch(customerId);
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}
