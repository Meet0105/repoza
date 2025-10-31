# 🎯 Repoza Subscription System - Setup Guide

## ✅ What's Implemented

### 1. **Multi-Currency Support (10 Currencies)**
- 🇺🇸 USD - United States Dollar ($9.99/month)
- 🇪🇺 EUR - Euro (€9.49/month)
- 🇬🇧 GBP - British Pound (£7.99/month)
- 🇮🇳 INR - Indian Rupee (₹799/month)
- 🇨🇦 CAD - Canadian Dollar (C$13.49/month)
- 🇦🇺 AUD - Australian Dollar (A$14.99/month)
- 🇯🇵 JPY - Japanese Yen (¥1499/month)
- 🇧🇷 BRL - Brazilian Real (R$49.99/month)
- 🇲🇽 MXN - Mexican Peso (MX$179.99/month)
- 🇸🇬 SGD - Singapore Dollar (S$13.49/month)

### 2. **Auto-Region Detection**
- Automatically detects user's region from timezone
- Shows prices in local currency by default
- Users can manually switch currencies

### 3. **Two Billing Cycles**
- Monthly billing
- Yearly billing (17% discount)

### 4. **Two-Tier System**

#### Free Tier
- 10 searches/day
- 3 boilerplates/day
- 3 collections max
- 5 dependency scans/day
- 3 setup guides/day
- 7-day history

#### Pro Tier
- ✨ Unlimited searches
- ✨ Unlimited boilerplates
- ✨ Unlimited collections
- ✨ Code Converter
- ✨ Learning Paths
- ✨ Repo Q&A
- ✨ Live Preview
- ✨ One-Click Deploy
- ✨ 30-day history
- ✨ Priority AI processing

### 5. **Files Created**
```
pages/
  pricing.tsx                          # Beautiful pricing page with currency selector
  api/
    subscription/
      create-checkout.ts               # Create Stripe checkout session
      portal.ts                        # Customer portal for managing subscription
      status.ts                        # Get user subscription status & usage

utils/
  stripe.ts                            # Stripe integration & helper functions
  subscriptionChecker.ts               # Usage tracking & limit checking
```

## 🔧 Setup Instructions

### Step 1: Create Stripe Account
1. Go to https://stripe.com and create an account
2. Get your API keys from Dashboard → Developers → API keys

### Step 2: Create Products in Stripe

For each currency, create TWO products (Monthly & Yearly):

**Example for USD:**
1. Go to Products → Add Product
2. Create "Repoza Pro - Monthly (USD)"
   - Price: $9.99
   - Billing: Recurring monthly
   - Currency: USD
3. Copy the Price ID (starts with `price_`)
4. Repeat for yearly: $99.99/year

**Repeat for all 10 currencies!**

### Step 3: Set Up Webhook
1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret

### Step 4: Update Environment Variables

Add to your `.env.local` and Vercel:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Price IDs - Monthly
STRIPE_PRICE_USD_MONTHLY=price_xxx
STRIPE_PRICE_EUR_MONTHLY=price_xxx
STRIPE_PRICE_GBP_MONTHLY=price_xxx
STRIPE_PRICE_INR_MONTHLY=price_xxx
STRIPE_PRICE_CAD_MONTHLY=price_xxx
STRIPE_PRICE_AUD_MONTHLY=price_xxx
STRIPE_PRICE_JPY_MONTHLY=price_xxx
STRIPE_PRICE_BRL_MONTHLY=price_xxx
STRIPE_PRICE_MXN_MONTHLY=price_xxx
STRIPE_PRICE_SGD_MONTHLY=price_xxx

# Price IDs - Yearly
STRIPE_PRICE_USD_YEARLY=price_xxx
STRIPE_PRICE_EUR_YEARLY=price_xxx
STRIPE_PRICE_GBP_YEARLY=price_xxx
STRIPE_PRICE_INR_YEARLY=price_xxx
STRIPE_PRICE_CAD_YEARLY=price_xxx
STRIPE_PRICE_AUD_YEARLY=price_xxx
STRIPE_PRICE_JPY_YEARLY=price_xxx
STRIPE_PRICE_BRL_YEARLY=price_xxx
STRIPE_PRICE_MXN_YEARLY=price_xxx
STRIPE_PRICE_SGD_YEARLY=price_xxx
```

### Step 5: Test the Flow

1. Visit `/pricing` page
2. Select your region/currency
3. Click "Upgrade to Pro"
4. Complete test payment (use Stripe test card: 4242 4242 4242 4242)
5. Verify subscription in `/subscription` page

## 🎨 User Experience

### Pricing Page (`/pricing`)
- Beautiful gradient design
- Currency selector with region names
- Auto-detects user's region
- Shows equivalent USD price
- Monthly/Yearly toggle
- FAQ section

### Subscription Management (`/subscription`)
- View current plan
- See usage statistics
- Manage billing (via Stripe portal)
- Upgrade/downgrade options

## 📊 Usage Tracking

The system automatically tracks:
- Daily feature usage per user
- Enforces limits for free users
- Unlimited for Pro users

### How to Check Access in Your Code

```typescript
import { checkFeatureAccess, incrementUsage } from '../utils/subscriptionChecker';

// Before allowing a feature
const access = await checkFeatureAccess(userEmail, 'searches');
if (!access.allowed) {
  return res.status(403).json({ 
    error: access.reason,
    upgrade: true 
  });
}

// After successful use
await incrementUsage(userEmail, 'searches');
```

## 🚀 Next Steps

1. **Set up Stripe account** and get API keys
2. **Create all 20 products** (10 currencies × 2 billing cycles)
3. **Add environment variables** to Vercel
4. **Test with Stripe test mode** first
5. **Add feature gates** to existing features
6. **Switch to live mode** when ready

## 💡 Tips

- Start with just USD if you want to test quickly
- Use Stripe test mode for development
- Monitor webhook events in Stripe dashboard
- Set up email notifications for failed payments
- Consider adding a trial period

## 🔗 Important Links

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Test Cards: https://stripe.com/docs/testing
- Webhook Testing: https://stripe.com/docs/webhooks/test

---

**All set!** Your multi-currency subscription system is ready to go. Just complete the Stripe setup and you're live! 🎉
