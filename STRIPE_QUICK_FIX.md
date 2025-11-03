# 🚨 Quick Fix: Stripe Payment Not Working

## The Problem
You added USD price to one product, but payment is failing.

## Why It's Failing
Our code expects **one product per currency**, not multiple prices on one product.

## Quick Fix (5 Minutes)

### 1. Create Product Correctly

Go to Stripe Dashboard → Products → Add product

**Product Details:**
```
Name: Repoza Pro - Monthly (USD)
Description: Unlimited access to all premium features
```

**Pricing:**
```
Price: 9.99
Currency: USD
Billing: Monthly
```

Click **Save**

### 2. Copy Price ID

After saving, you'll see something like:
```
price_1QKxyz123ABC456
```

**Copy this entire ID!**

### 3. Add to Vercel

Go to Vercel → Your Project → Settings → Environment Variables

Add this variable:
```
Name: STRIPE_PRICE_USD_MONTHLY
Value: price_1QKxyz123ABC456  (your actual Price ID)
```

Click **Save**

### 4. Redeploy

In Vercel:
- Go to Deployments
- Click "Redeploy" on latest deployment
- Wait for deployment to complete

### 5. Test

1. Go to your website `/pricing`
2. Select USD
3. Click "Upgrade to Pro"
4. Should work now! ✅

## Still Not Working?

### Check These:

**1. Is Price ID correct?**
- Should start with `price_`
- Should be from Test Mode (not Live Mode)

**2. Is Stripe Secret Key added?**
```
STRIPE_SECRET_KEY=sk_test_xxxxx
```

**3. Did you redeploy after adding env vars?**
- Vercel needs redeploy to pick up new variables

**4. Are you in Test Mode?**
- Stripe Dashboard should show "Test Mode" toggle ON

## Need to Create All 20 Products?

For now, just create USD Monthly to test. Once it works, you can add the other 19 products later.

**Minimum to test:**
- 1 product: "Repoza Pro - Monthly (USD)"
- 1 price: $9.99 USD
- 1 env var: `STRIPE_PRICE_USD_MONTHLY`

That's it! 🎉

## Visual Guide

```
❌ WRONG:
Product: "Repoza Pro - Monthly"
  ├─ Price 1: USD $9.99
  └─ Price 2: EUR €8.99

✅ CORRECT:
Product 1: "Repoza Pro - Monthly (USD)"
  └─ Price: USD $9.99

Product 2: "Repoza Pro - Monthly (EUR)"
  └─ Price: EUR €8.99
```

## Environment Variables Needed

**Minimum (for testing):**
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_USD_MONTHLY=price_xxxxx
```

**Full Setup (all currencies):**
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

STRIPE_PRICE_USD_MONTHLY=price_xxxxx
STRIPE_PRICE_EUR_MONTHLY=price_xxxxx
STRIPE_PRICE_GBP_MONTHLY=price_xxxxx
STRIPE_PRICE_INR_MONTHLY=price_xxxxx
STRIPE_PRICE_CAD_MONTHLY=price_xxxxx
STRIPE_PRICE_AUD_MONTHLY=price_xxxxx
STRIPE_PRICE_SGD_MONTHLY=price_xxxxx
STRIPE_PRICE_JPY_MONTHLY=price_xxxxx
STRIPE_PRICE_BRL_MONTHLY=price_xxxxx
STRIPE_PRICE_MXN_MONTHLY=price_xxxxx

STRIPE_PRICE_USD_YEARLY=price_xxxxx
STRIPE_PRICE_EUR_YEARLY=price_xxxxx
STRIPE_PRICE_GBP_YEARLY=price_xxxxx
STRIPE_PRICE_INR_YEARLY=price_xxxxx
STRIPE_PRICE_CAD_YEARLY=price_xxxxx
STRIPE_PRICE_AUD_YEARLY=price_xxxxx
STRIPE_PRICE_SGD_YEARLY=price_xxxxx
STRIPE_PRICE_JPY_YEARLY=price_xxxxx
STRIPE_PRICE_BRL_YEARLY=price_xxxxx
STRIPE_PRICE_MXN_YEARLY=price_xxxxx
```

## Test Card

Use this card for testing:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

## Success Checklist

- [ ] Created product "Repoza Pro - Monthly (USD)"
- [ ] Added price $9.99 USD to it
- [ ] Copied Price ID (starts with `price_`)
- [ ] Added `STRIPE_PRICE_USD_MONTHLY` to Vercel
- [ ] Added `STRIPE_SECRET_KEY` to Vercel
- [ ] Redeployed application
- [ ] Tested payment with test card
- [ ] Payment successful! 🎉

---

**Pro Tip:** Start with just USD to test. Once it works, add other currencies one by one.
