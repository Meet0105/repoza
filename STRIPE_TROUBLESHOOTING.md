# Stripe Payment Troubleshooting Guide

## Common Issue: Payment Failing

### Problem Description
You created one product "Repoza Pro - Monthly" and added USD price to it, but payment is failing.

### Root Cause
Our code expects **separate products for each currency**, not multiple prices on one product.

## ❌ Wrong Approach (What You Did)

```
Product: "Repoza Pro - Monthly"
  ├─ Price 1: USD $9.99
  ├─ Price 2: EUR €8.99  (if you add more)
  └─ Price 3: GBP £7.99  (if you add more)
```

This won't work because our code looks for specific Price IDs per currency.

## ✅ Correct Approach (What You Need)

```
Product 1: "Repoza Pro - Monthly (USD)"
  └─ Price: USD $9.99 → price_xxxxx (STRIPE_PRICE_USD_MONTHLY)

Product 2: "Repoza Pro - Monthly (EUR)"
  └─ Price: EUR €8.99 → price_yyyyy (STRIPE_PRICE_EUR_MONTHLY)

Product 3: "Repoza Pro - Monthly (GBP)"
  └─ Price: GBP £7.99 → price_zzzzz (STRIPE_PRICE_GBP_MONTHLY)

... and so on for all 10 currencies
```

## Step-by-Step Fix

### Step 1: Check Your Current Setup

1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/products
2. Look at your products
3. If you only have 1 product with multiple prices → **This is the problem**

### Step 2: Delete or Archive Wrong Products

**Option A: Start Fresh (Recommended)**
1. In Stripe Dashboard → Products
2. Click on "Repoza Pro - Monthly"
3. Click "Archive product" (top right)
4. Confirm

**Option B: Keep and Add More**
- You can keep the existing product and create 19 more
- But make sure each has only ONE price

### Step 3: Create Products Correctly

For **each currency**, create a **separate product**:

#### Example: USD Monthly

1. **Go to Products** → Click "Add product"

2. **Product Information:**
   - Name: `Repoza Pro - Monthly (USD)`
   - Description: `Unlimited access to all premium features`

3. **Pricing:**
   - Click "Add pricing"
   - Price: `9.99`
   - Currency: `USD` ← **Important!**
   - Billing period: `Monthly`
   - Click "Save product"

4. **Copy Price ID:**
   - After saving, you'll see: `price_1234567890abcdef`
   - **Copy this ID** - you need it for Vercel

5. **Repeat for all currencies:**
   - EUR: €8.99
   - GBP: £7.99
   - INR: ₹799
   - CAD: C$12.99
   - AUD: A$14.99
   - SGD: S$13.99
   - JPY: ¥1,299
   - BRL: R$49.99
   - MXN: MX$199

### Step 4: Update Vercel Environment Variables

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Monthly Price IDs
STRIPE_PRICE_USD_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_EUR_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_GBP_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_INR_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_CAD_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_AUD_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_SGD_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_JPY_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BRL_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_MXN_MONTHLY=price_xxxxxxxxxxxxx

# Yearly Price IDs
STRIPE_PRICE_USD_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_EUR_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_GBP_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_INR_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_CAD_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_AUD_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_SGD_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_JPY_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BRL_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_MXN_YEARLY=price_xxxxxxxxxxxxx
```

5. Click "Save"
6. **Redeploy** your application

### Step 5: Verify Setup

1. Check Vercel logs for any errors
2. Go to your website `/pricing`
3. Select USD currency
4. Click "Upgrade to Pro"
5. Should redirect to Stripe Checkout with correct price

## Quick Checklist

- [ ] Created separate product for USD Monthly
- [ ] Product has only ONE price (USD $9.99)
- [ ] Copied the Price ID (starts with `price_`)
- [ ] Added `STRIPE_PRICE_USD_MONTHLY` to Vercel env vars
- [ ] Redeployed the application
- [ ] Tested payment flow

## How to Find Your Price ID

1. Go to Stripe Dashboard → Products
2. Click on your product (e.g., "Repoza Pro - Monthly (USD)")
3. Under "Pricing", you'll see the price
4. Click on the price amount
5. Look for "API ID" - this is your Price ID
6. It looks like: `price_1234567890abcdef`

## Testing the Fix

### Test USD Payment:

1. Go to your website: `https://your-site.vercel.app/pricing`
2. Make sure USD is selected
3. Click "Upgrade to Pro" (Monthly)
4. Should redirect to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. Should redirect to success page

### If Still Failing:

**Check Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Share the error message

**Check Vercel Logs:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on latest deployment
5. Check "Functions" logs
6. Look for errors in `/api/subscription/create-checkout`

## Common Errors and Solutions

### Error: "No price found for currency"

**Cause:** Missing Price ID in environment variables

**Solution:**
1. Check Vercel env vars
2. Make sure `STRIPE_PRICE_USD_MONTHLY` exists
3. Value should start with `price_`
4. Redeploy

### Error: "Invalid price ID"

**Cause:** Wrong Price ID or Test/Live mode mismatch

**Solution:**
1. Verify you're in Test Mode in Stripe
2. Price ID should start with `price_` not `prod_`
3. Copy the correct Price ID from Stripe
4. Update Vercel env var
5. Redeploy

### Error: "Stripe key not configured"

**Cause:** Missing Stripe Secret Key

**Solution:**
1. Go to Stripe Dashboard → Developers → API Keys
2. Copy "Secret key" (starts with `sk_test_`)
3. Add to Vercel as `STRIPE_SECRET_KEY`
4. Redeploy

### Payment redirects but shows error

**Cause:** Webhook not configured or wrong URL

**Solution:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-site.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret (starts with `whsec_`)
5. Add to Vercel as `STRIPE_WEBHOOK_SECRET`
6. Redeploy

## Need More Help?

### Share These Details:

1. **Number of products in Stripe:** _____
2. **Product names:** _____
3. **Number of prices per product:** _____
4. **Price ID you're using:** `price_xxxxx`
5. **Error message from browser console:** _____
6. **Error message from Vercel logs:** _____

### Quick Test Command

To verify your Price ID is correct, you can test it:

1. Go to Stripe Dashboard → Developers → API Keys
2. Copy your Secret Key
3. Run this in terminal:

```bash
curl https://api.stripe.com/v1/prices/price_YOUR_PRICE_ID \
  -u sk_test_YOUR_SECRET_KEY:
```

If it returns price details → Price ID is valid
If it returns error → Price ID is wrong

## Summary

**The key point:** 
- ❌ Don't add multiple prices to one product
- ✅ Create one product per currency
- ✅ Each product has exactly one price
- ✅ Copy each Price ID to Vercel env vars
- ✅ Redeploy after updating env vars

Follow these steps and your payment should work! 🎉
