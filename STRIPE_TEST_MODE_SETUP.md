# 🧪 Stripe Test Mode Setup Plan

## 📋 Overview
This guide will help you set up Stripe in **test mode** so you can test payments without using real money.

---

## 🎯 Step-by-Step Plan

### **Phase 1: Stripe Account Setup** (15 minutes)

#### Step 1.1: Create Stripe Account
1. Go to https://stripe.com
2. Click "Sign up" (or "Sign in" if you have an account)
3. Complete registration
4. **Important:** You'll automatically be in TEST mode (toggle in top-left corner)

#### Step 1.2: Get Test API Keys
1. Go to **Developers** → **API keys**
2. Make sure you're in **TEST mode** (toggle should show "Test mode")
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

---

### **Phase 2: Create Test Products** (30 minutes)

We need to create products for each currency. For testing, let's start with **just 3 currencies** to keep it simple:

#### Step 2.1: Create USD Products

**Monthly Product:**
1. Go to **Products** → **Add product**
2. Fill in:
   - Name: `Repoza Pro - Monthly (USD)`
   - Description: `Monthly subscription to Repoza Pro`
   - Pricing model: `Standard pricing`
   - Price: `$9.99`
   - Billing period: `Monthly`
   - Currency: `USD`
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_`) - You'll need this!

**Yearly Product:**
1. Click **Add another price** on the same product
2. Fill in:
   - Price: `$99.99`
   - Billing period: `Yearly`
   - Currency: `USD`
3. Click **Save**
4. **Copy the Price ID**

#### Step 2.2: Create INR Products (for India)

**Monthly Product:**
1. Go to **Products** → **Add product**
2. Fill in:
   - Name: `Repoza Pro - Monthly (INR)`
   - Price: `₹799`
   - Billing period: `Monthly`
   - Currency: `INR`
3. **Copy the Price ID**

**Yearly Product:**
1. Add another price: `₹7999` yearly
2. **Copy the Price ID**

#### Step 2.3: Create EUR Products (for Europe)

**Monthly Product:**
1. Name: `Repoza Pro - Monthly (EUR)`
2. Price: `€9.49` monthly
3. **Copy the Price ID**

**Yearly Product:**
1. Price: `€94.99` yearly
2. **Copy the Price ID**

---

### **Phase 3: Set Up Webhook** (10 minutes)

#### Step 3.1: Create Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
   - Replace `your-vercel-domain` with your actual Vercel URL
4. Description: `Repoza subscription events`
5. **Select events to listen to:**
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`
6. Click **Add endpoint**
7. **Copy the Signing secret** (starts with `whsec_`)

---

### **Phase 4: Update Environment Variables** (5 minutes)

#### Step 4.1: Update Local .env.local

Add these to your `.env.local` file:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Test Price IDs - USD
STRIPE_PRICE_USD_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_USD_YEARLY=price_YOUR_USD_YEARLY_ID

# Test Price IDs - INR
STRIPE_PRICE_INR_MONTHLY=price_YOUR_INR_MONTHLY_ID
STRIPE_PRICE_INR_YEARLY=price_YOUR_INR_YEARLY_ID

# Test Price IDs - EUR
STRIPE_PRICE_EUR_MONTHLY=price_YOUR_EUR_MONTHLY_ID
STRIPE_PRICE_EUR_YEARLY=price_YOUR_EUR_YEARLY_ID

# For other currencies, use USD as fallback for now
STRIPE_PRICE_GBP_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_GBP_YEARLY=price_YOUR_USD_YEARLY_ID
STRIPE_PRICE_CAD_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_CAD_YEARLY=price_YOUR_USD_YEARLY_ID
STRIPE_PRICE_AUD_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_AUD_YEARLY=price_YOUR_USD_YEARLY_ID
STRIPE_PRICE_JPY_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_JPY_YEARLY=price_YOUR_USD_YEARLY_ID
STRIPE_PRICE_BRL_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_BRL_YEARLY=price_YOUR_USD_YEARLY_ID
STRIPE_PRICE_MXN_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_MXN_YEARLY=price_YOUR_USD_YEARLY_ID
STRIPE_PRICE_SGD_MONTHLY=price_YOUR_USD_MONTHLY_ID
STRIPE_PRICE_SGD_YEARLY=price_YOUR_USD_YEARLY_ID
```

#### Step 4.2: Update Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project (repoza)
3. Go to **Settings** → **Environment Variables**
4. Add all the same variables from above
5. Make sure to select **Production**, **Preview**, and **Development**
6. Click **Save**

---

### **Phase 5: Test the Payment Flow** (15 minutes)

#### Step 5.1: Test Locally First

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Sign in with your account

4. Go to `/pricing` page

5. Click "Upgrade to Pro"

6. You should be redirected to Stripe Checkout

#### Step 5.2: Use Test Card

On the Stripe checkout page, use these **test card numbers**:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other Test Cards:**
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`
- Insufficient funds: `4000 0000 0000 9995`

#### Step 5.3: Verify Success

After successful payment:
1. You should be redirected to `/subscription/success`
2. Check your MongoDB `users` collection - subscription should be updated
3. Go to `/subscription` page - should show "Pro" plan
4. Check Stripe Dashboard → **Payments** - should see the test payment

---

### **Phase 6: Test Webhook Events** (10 minutes)

#### Step 6.1: Test Webhook Locally (Optional)

For local testing, use Stripe CLI:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret and update `.env.local`

#### Step 6.2: Test on Vercel

1. Deploy to Vercel (already done)
2. Make a test payment
3. Check Stripe Dashboard → **Developers** → **Webhooks**
4. Click on your endpoint
5. View recent events - should see successful deliveries

---

## 🧪 Test Scenarios

### Scenario 1: New Subscription
1. User clicks "Upgrade to Pro"
2. Completes payment with test card
3. Redirected to success page
4. Subscription status = "active" in database
5. User can access Pro features

### Scenario 2: Failed Payment
1. Use declined test card
2. Payment fails
3. User stays on free plan
4. No subscription created

### Scenario 3: Subscription Management
1. User goes to `/subscription`
2. Clicks "Manage Subscription"
3. Opens Stripe Customer Portal
4. Can cancel subscription
5. Webhook updates database

---

## 📊 Monitoring & Debugging

### Check Stripe Dashboard
- **Payments**: See all test payments
- **Customers**: See test customers
- **Subscriptions**: See active subscriptions
- **Webhooks**: Check webhook delivery status
- **Logs**: View API request logs

### Check Your Database
```javascript
// In MongoDB, check users collection
{
  email: "user@example.com",
  subscription: {
    plan: "pro",
    status: "active",
    stripeCustomerId: "cus_xxx",
    stripeSubscriptionId: "sub_xxx",
    currentPeriodEnd: ISODate("2024-12-01")
  }
}
```

### Common Issues & Solutions

**Issue 1: Webhook not receiving events**
- Solution: Check webhook URL is correct
- Solution: Verify webhook secret in env vars
- Solution: Check Vercel logs for errors

**Issue 2: Payment succeeds but subscription not updated**
- Solution: Check webhook events in Stripe dashboard
- Solution: Check MongoDB connection
- Solution: Verify webhook handler code

**Issue 3: Redirect fails after payment**
- Solution: Check NEXTAUTH_URL is set correctly
- Solution: Verify success URL in checkout session

---

## ✅ Checklist

Before going live, verify:

- [ ] Stripe account created
- [ ] Test mode enabled
- [ ] Test API keys copied
- [ ] Products created (at least USD, INR, EUR)
- [ ] Price IDs copied
- [ ] Webhook endpoint created
- [ ] Webhook secret copied
- [ ] Environment variables updated (local)
- [ ] Environment variables updated (Vercel)
- [ ] Test payment successful
- [ ] Webhook events received
- [ ] Database updated correctly
- [ ] Success page works
- [ ] Subscription page shows correct status
- [ ] Customer portal works

---

## 🚀 Next Steps After Testing

Once everything works in test mode:

1. **Create remaining currency products** (GBP, CAD, AUD, JPY, BRL, MXN, SGD)
2. **Update all price IDs** in environment variables
3. **Test each currency** with test cards
4. **When ready for production:**
   - Switch to Live mode in Stripe
   - Get Live API keys
   - Create Live products
   - Update environment variables with Live keys
   - Test with real card (small amount)
   - Go live! 🎉

---

## 📞 Support

If you encounter issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing

---

**Estimated Total Time: ~1.5 hours**

Good luck! 🍀
