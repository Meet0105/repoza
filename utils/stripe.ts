import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default stripe;

// Price IDs for different currencies and billing cycles
// You'll need to create these in your Stripe dashboard
const PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  usd: {
    monthly: process.env.STRIPE_PRICE_USD_MONTHLY || 'price_usd_monthly',
    yearly: process.env.STRIPE_PRICE_USD_YEARLY || 'price_usd_yearly',
  },
  eur: {
    monthly: process.env.STRIPE_PRICE_EUR_MONTHLY || 'price_eur_monthly',
    yearly: process.env.STRIPE_PRICE_EUR_YEARLY || 'price_eur_yearly',
  },
  gbp: {
    monthly: process.env.STRIPE_PRICE_GBP_MONTHLY || 'price_gbp_monthly',
    yearly: process.env.STRIPE_PRICE_GBP_YEARLY || 'price_gbp_yearly',
  },
  inr: {
    monthly: process.env.STRIPE_PRICE_INR_MONTHLY || 'price_inr_monthly',
    yearly: process.env.STRIPE_PRICE_INR_YEARLY || 'price_inr_yearly',
  },
  cad: {
    monthly: process.env.STRIPE_PRICE_CAD_MONTHLY || 'price_cad_monthly',
    yearly: process.env.STRIPE_PRICE_CAD_YEARLY || 'price_cad_yearly',
  },
  aud: {
    monthly: process.env.STRIPE_PRICE_AUD_MONTHLY || 'price_aud_monthly',
    yearly: process.env.STRIPE_PRICE_AUD_YEARLY || 'price_aud_yearly',
  },
  jpy: {
    monthly: process.env.STRIPE_PRICE_JPY_MONTHLY || 'price_jpy_monthly',
    yearly: process.env.STRIPE_PRICE_JPY_YEARLY || 'price_jpy_yearly',
  },
  brl: {
    monthly: process.env.STRIPE_PRICE_BRL_MONTHLY || 'price_brl_monthly',
    yearly: process.env.STRIPE_PRICE_BRL_YEARLY || 'price_brl_yearly',
  },
  mxn: {
    monthly: process.env.STRIPE_PRICE_MXN_MONTHLY || 'price_mxn_monthly',
    yearly: process.env.STRIPE_PRICE_MXN_YEARLY || 'price_mxn_yearly',
  },
  sgd: {
    monthly: process.env.STRIPE_PRICE_SGD_MONTHLY || 'price_sgd_monthly',
    yearly: process.env.STRIPE_PRICE_SGD_YEARLY || 'price_sgd_yearly',
  },
};

export async function createCheckoutSession({
  customerId,
  customerEmail,
  currency = 'usd',
  billingCycle = 'monthly',
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  customerEmail: string;
  currency?: string;
  billingCycle?: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}) {
  const currencyLower = currency.toLowerCase();
  const priceId = PRICE_IDS[currencyLower]?.[billingCycle] || PRICE_IDS.usd[billingCycle];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
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
      currency: currencyLower,
      billingCycle,
    },
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
