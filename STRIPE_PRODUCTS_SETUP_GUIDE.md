# Stripe Products Setup Guide - Multi-Currency

## Overview

For global payment support, you need to create **20 products** in Stripe:
- **10 currencies**: USD, EUR, GBP, INR, CAD, AUD, SGD, JPY, BRL, MXN
- **2 billing cycles**: Monthly and Yearly
- **Total**: 10 × 2 = 20 products

## Pricing Structure

### Monthly Plans
| Currency | Price | Symbol |
|----------|-------|--------|
| USD | $9.99 | $ |
| EUR | €8.99 | € |
| GBP | £7.99 | £ |
| INR | ₹799 | ₹ |
| CAD | $12.99 | C$ |
| AUD | $14.99 | A$ |
| SGD | $13.99 | S$ |
| JPY | ¥1,299 | ¥ |
| BRL | R$49.99 | R$ |
| MXN | $199 | MX$ |

### Yearly Plans (Save ~17%)
| Currency | Price | Monthly Equivalent | Savings |
|----------|-------|-------------------|---------|
| USD | $99.99 | $8.33/mo | $19.89/year |
| EUR | €89.99 | €7.50/mo | €17.89/year |
| GBP | £79.99 | £6.67/mo | £15.89/year |
| INR | ₹7,999 | ₹666/mo | ₹1,589/year |
| CAD | $129.99 | $10.83/mo | $25.89/year |
| AUD | $149.99 | $12.50/mo | $29.89/year |
| SGD | $139.99 | $11.67/mo | $27.89/year |
| JPY | ¥12,999 | ¥1,083/mo | ¥2,589/year |
| BRL | R$499.99 | R$41.67/mo | R$99.89/year |
| MXN | $1,999 | $166.58/mo | $389/year |

## Step-by-Step Setup

### Method 1: Manual Setup via Stripe Dashboard (Recommended for First Time)

#### Step 1: Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)
3. Navigate to **Products** → **Add product**

#### Step 2: Create Each Product

For each currency and billing cycle, follow these steps:

**Example: USD Monthly**

1. **Product Information:**
   - Name: `Repoza Pro - Monthly (USD)`
   - Description: `Unlimited access to all premium features including Code Converter, Learning Paths, Repo Q&A, Live Preview, and One-Click Deploy`
   - Image: Upload your logo (optional)

2. **Pricing:**
   - Click **Add pricing**
   - Model: `Standard pricing`
   - Price: `9.99`
   - Currency: `USD`
   - Billing period: `Monthly`
   - Usage type: `Licensed`

3. **Additional Options:**
   - Tax behavior: `Taxable` (if applicable)
   - Click **Save product**

4. **Copy Price ID:**
   - After saving, you'll see a Price ID like `price_xxxxxxxxxxxxx`
   - **IMPORTANT**: Copy this ID - you'll need it for your `.env.local`

#### Step 3: Repeat for All 20 Products

Create products in this order:

**Monthly Products:**
1. ✅ Repoza Pro - Monthly (USD) → `price_usd_monthly`
2. ✅ Repoza Pro - Monthly (EUR) → `price_eur_monthly`
3. ✅ Repoza Pro - Monthly (GBP) → `price_gbp_monthly`
4. ✅ Repoza Pro - Monthly (INR) → `price_inr_monthly`
5. ✅ Repoza Pro - Monthly (CAD) → `price_cad_monthly`
6. ✅ Repoza Pro - Monthly (AUD) → `price_aud_monthly`
7. ✅ Repoza Pro - Monthly (SGD) → `price_sgd_monthly`
8. ✅ Repoza Pro - Monthly (JPY) → `price_jpy_monthly`
9. ✅ Repoza Pro - Monthly (BRL) → `price_brl_monthly`
10. ✅ Repoza Pro - Monthly (MXN) → `price_mxn_monthly`

**Yearly Products:**
11. ✅ Repoza Pro - Yearly (USD) → `price_usd_yearly`
12. ✅ Repoza Pro - Yearly (EUR) → `price_eur_yearly`
13. ✅ Repoza Pro - Yearly (GBP) → `price_gbp_yearly`
14. ✅ Repoza Pro - Yearly (INR) → `price_inr_yearly`
15. ✅ Repoza Pro - Yearly (CAD) → `price_cad_yearly`
16. ✅ Repoza Pro - Yearly (AUD) → `price_aud_yearly`
17. ✅ Repoza Pro - Yearly (SGD) → `price_sgd_yearly`
18. ✅ Repoza Pro - Yearly (JPY) → `price_jpy_yearly`
19. ✅ Repoza Pro - Yearly (BRL) → `price_brl_yearly`
20. ✅ Repoza Pro - Yearly (MXN) → `price_mxn_yearly`

### Method 2: Bulk Creation via Stripe API (Advanced)

If you want to automate this, I can create a script for you. Let me know!

## Environment Variables Setup

After creating all products, update your `.env.local`:

```env
# Stripe Price IDs - Monthly
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

# Stripe Price IDs - Yearly
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

## Quick Copy-Paste Template

Use this template when creating each product:

### Product Name Template:
```
Repoza Pro - [Monthly/Yearly] ([CURRENCY])
```

### Description Template:
```
Unlimited access to all premium features including Code Converter, Learning Paths, Repository Q&A, Live Preview, and One-Click Deploy. Cancel anytime.
```

## Verification Checklist

After creating all products, verify:

- [ ] All 20 products created in Stripe Dashboard
- [ ] Each product has correct currency
- [ ] Each product has correct billing period (monthly/yearly)
- [ ] All Price IDs copied to `.env.local`
- [ ] Price IDs match the currency and billing cycle
- [ ] Test Mode products created first
- [ ] Products are set to "Active" status

## Testing

### Test Each Currency:

1. Go to your pricing page: `http://localhost:3000/pricing`
2. Select different currencies from dropdown
3. Click "Upgrade to Pro" for monthly plan
4. Verify correct price shows in Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete test payment
7. Verify subscription created in Stripe Dashboard
8. Repeat for yearly plan

### Test Cards by Region:

| Region | Test Card | Notes |
|--------|-----------|-------|
| US | 4242 4242 4242 4242 | Standard |
| EU | 4000 0025 0000 3155 | 3D Secure |
| UK | 4000 0082 6000 0000 | UK card |
| India | 4000 0035 6000 0008 | Indian card |

## Production Setup

Once testing is complete:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Repeat all 20 product creations** in Live Mode
3. **Update `.env.local`** with Live Mode Price IDs
4. **Test with real card** (small amount)
5. **Refund test transaction**
6. **Go live!** 🚀

## Time Estimate

- **Manual Creation**: ~5 minutes per product = ~100 minutes (~1.5 hours)
- **With Copy-Paste**: ~3 minutes per product = ~60 minutes (~1 hour)
- **API Script** (if I create one): ~5 minutes total

## Tips for Faster Setup

1. **Open Multiple Tabs**: Create products in parallel
2. **Use Browser Autofill**: Save time on repeated fields
3. **Copy-Paste Description**: Use the same description for all
4. **Organize Price IDs**: Keep a spreadsheet while creating
5. **Take Breaks**: Don't rush, accuracy is important

## Common Mistakes to Avoid

❌ **Wrong Currency**: Double-check currency before saving
❌ **Wrong Billing Period**: Monthly vs Yearly - easy to mix up
❌ **Typos in Price**: 9.99 vs 99.9 - big difference!
❌ **Missing Price IDs**: Copy each ID immediately after creation
❌ **Test vs Live Mode**: Don't mix Test and Live Price IDs

## Need Help?

If you want me to:
1. ✅ Create an automated script to generate all products via API
2. ✅ Create a spreadsheet template to track Price IDs
3. ✅ Help verify your setup
4. ✅ Troubleshoot any issues

Just let me know! I'm here to help make this process smooth.

## Next Steps

After completing product setup:
1. ✅ Update `.env.local` with all Price IDs
2. ✅ Test each currency on pricing page
3. ✅ Verify webhook handling
4. ✅ Test subscription flow end-to-end
5. ✅ Switch to Live Mode and repeat
6. ✅ Launch! 🎉
