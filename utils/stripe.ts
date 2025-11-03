import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default stripe;

// Price IDs for different currencies
export const STRIPE_PRICES: Record<string, { monthly: string; yearly: string }> = {
  USD: {
    monthly: process.env.STRIPE_PRICE_USD_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_USD_YEARLY || '',
  },
  EUR: {
    monthly: process.env.STRIPE_PRICE_EUR_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_EUR_YEARLY || '',
  },
  GBP: {
    monthly: process.env.STRIPE_PRICE_GBP_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_GBP_YEARLY || '',
  },
  INR: {
    monthly: process.env.STRIPE_PRICE_INR_MONTHLY || process.env.STRIPE_PRICE_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_INR_YEARLY || process.env.STRIPE_PRICE_YEARLY || '',
  },
  CAD: {
    monthly: process.env.STRIPE_PRICE_CAD_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_CAD_YEARLY || '',
  },
  AUD: {
    monthly: process.env.STRIPE_PRICE_AUD_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_AUD_YEARLY || '',
  },
  JPY: {
    monthly: process.env.STRIPE_PRICE_JPY_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_JPY_YEARLY || '',
  },
  BRL: {
    monthly: process.env.STRIPE_PRICE_BRL_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_BRL_YEARLY || '',
  },
  MXN: {
    monthly: process.env.STRIPE_PRICE_MXN_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_MXN_YEARLY || '',
  },
  SGD: {
    monthly: process.env.STRIPE_PRICE_SGD_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_SGD_YEARLY || '',
  },
};

// Create checkout session
export async function createCheckoutSession({
  customerEmail,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      customerEmail,
    },
  });

  return session;
}

// Create customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Get subscription
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
