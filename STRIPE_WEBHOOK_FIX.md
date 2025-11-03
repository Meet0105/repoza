# 🚨 Fix: Subscription Not Updating After Payment

## Problem
Payment completes successfully, but:
- Still shows "Upgrade to Pro" button
- Pro features not unlocked
- Database not updated

## Root Cause
**Stripe webhook is not configured or not working**, so your database doesn't get updated when payment succeeds.

---

## Quick Fix (10 Minutes)

### Step 1: Configure Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks
   - Make sure you're in **Test Mode**

2. **Click "Add endpoint"**

3. **Enter Endpoint URL:**
   ```
   https://your-site.vercel.app/api/webhooks/stripe
   ```
   Replace `your-site.vercel.app` with your actual Vercel domain

4. **Select Events to Listen:**
   Click "Select events" and choose these 4 events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.deleted`

5. **Click "Add endpoint"**

6. **Copy Webhook Secret:**
   - After creating, you'll see "Signing secret"
   - Click "Reveal" to show it
   - It looks like: `whsec_xxxxxxxxxxxxxxxxxxxxx`
   - **Copy this entire string!**

### Step 2: Add Webhook Secret to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Environment Variables**

3. **Add New Variable:**
   ```
   Name:  STRIPE_WEBHOOK_SECRET
   Value: whsec_xxxxxxxxxxxxxxxxxxxxx  (paste your secret)
   ```

4. **Click "Save"**

5. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Wait for deployment to complete

### Step 3: Test the Webhook

1. **Go back to Stripe Dashboard → Webhooks**
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Click "Send test webhook"
6. Should see "✅ Test webhook sent successfully"

### Step 4: Test Real Payment

1. **Go to your website `/pricing`**
2. **Click "Upgrade to Pro"**
3. **Complete payment** with test card: `4242 4242 4242 4242`
4. **Wait 2-3 seconds** for webhook to process
5. **Refresh the page**
6. **Should now show "Manage Subscription"** instead of "Upgrade to Pro" ✅

---

## Verification Checklist

After setup, verify:

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook URL is correct (https://your-site.vercel.app/api/webhooks/stripe)
- [ ] 4 events selected (checkout.session.completed, etc.)
- [ ] Webhook secret copied to Vercel env vars
- [ ] Application redeployed
- [ ] Test webhook sent successfully
- [ ] Real payment test completed
- [ ] Pricing page shows "Manage Subscription"

---

## Troubleshooting

### Issue 1: Webhook Shows "Failed" in Stripe

**Check Vercel Function Logs:**
1. Go to Vercel → Deployments
2. Click on latest deployment
3. Go to "Functions" tab
4. Look for `/api/webhooks/stripe`
5. Check for errors

**Common Errors:**

**Error: "Webhook signature verification failed"**
- **Cause:** Wrong webhook secret
- **Fix:** 
  1. Copy correct secret from Stripe Dashboard
  2. Update `STRIPE_WEBHOOK_SECRET` in Vercel
  3. Redeploy

**Error: "Database connection failed"**
- **Cause:** MongoDB connection issue
- **Fix:** Check `MONGODB_URI` in Vercel env vars

**Error: "No customer email found"**
- **Cause:** Email not passed in checkout session
- **Fix:** Already handled in code, should work

### Issue 2: Webhook Not Receiving Events

**Check Webhook URL:**
1. In Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Verify URL is exactly: `https://your-site.vercel.app/api/webhooks/stripe`
4. No trailing slash
5. Must be HTTPS (not HTTP)

**Check Events Selected:**
1. Click on webhook endpoint
2. Go to "Events to send" section
3. Should see 4 events listed
4. If not, click "Update endpoint" and add them

### Issue 3: Still Shows "Upgrade to Pro" After Payment

**Option A: Check Database Directly**

1. Go to MongoDB Atlas
2. Open your database
3. Go to "users" collection
4. Find your user by email
5. Check if `subscription` field exists:
   ```json
   {
     "email": "your@email.com",
     "subscription": {
       "plan": "pro",
       "status": "active",
       "stripeCustomerId": "cus_xxxxx",
       "stripeSubscriptionId": "sub_xxxxx"
     }
   }
   ```

**If subscription field is missing:**
- Webhook didn't fire or failed
- Check Stripe Dashboard → Webhooks → Recent events
- Look for failed events

**Option B: Manually Update Database (Temporary Fix)**

If you need immediate access, you can manually update:

1. Go to MongoDB Atlas
2. Find your user in "users" collection
3. Click "Edit" (pencil icon)
4. Add this field:
   ```json
   "subscription": {
     "plan": "pro",
     "status": "active",
     "stripeCustomerId": "cus_xxxxx",
     "stripeSubscriptionId": "sub_xxxxx",
     "currentPeriodEnd": "2024-12-31T00:00:00.000Z"
   }
   ```
5. Replace `cus_xxxxx` and `sub_xxxxx` with actual IDs from Stripe
6. Save
7. Refresh your website

**To find Customer ID and Subscription ID:**
1. Go to Stripe Dashboard → Customers
2. Find your customer by email
3. Copy Customer ID (starts with `cus_`)
4. Click on the subscription
5. Copy Subscription ID (starts with `sub_`)

### Issue 4: Webhook Works But Database Not Updating

**Check MongoDB Connection:**

1. Verify `MONGODB_URI` in Vercel env vars
2. Make sure it includes:
   - Username and password
   - Database name
   - `retryWrites=true&w=majority`

**Test MongoDB Connection:**
- Try accessing admin panel: `/admin`
- If admin works, MongoDB is connected
- If admin fails, MongoDB connection issue

---

## Testing Webhook Locally (Optional)

If you want to test webhooks on localhost:

### Option 1: Use Stripe CLI

1. **Install Stripe CLI:**
   ```bash
   # Windows (with Scoop)
   scoop install stripe
   
   # Mac
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy webhook secret** shown in terminal

5. **Add to .env.local:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

6. **Test payment** on localhost

### Option 2: Use Webhook Testing Tool

1. Go to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Click "Send test webhook"
4. Select event type
5. Click "Send test webhook"

---

## Production Setup

Once testing is complete:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Create new webhook** for production:
   ```
   https://your-site.vercel.app/api/webhooks/stripe
   ```
3. **Select same 4 events**
4. **Copy Live webhook secret**
5. **Update Vercel env var** with Live secret
6. **Test with real card** (small amount)
7. **Refund test transaction**

---

## Webhook Events Explained

### `checkout.session.completed`
- **When:** User completes payment
- **What we do:** Create/update subscription in database
- **Most important event!**

### `invoice.payment_succeeded`
- **When:** Recurring payment succeeds
- **What we do:** Update subscription status to active
- **For monthly/yearly renewals**

### `invoice.payment_failed`
- **When:** Payment fails (expired card, etc.)
- **What we do:** Update status to "past_due"
- **User keeps access for grace period**

### `customer.subscription.deleted`
- **When:** Subscription cancelled
- **What we do:** Update plan to "free", status to "canceled"
- **User loses Pro access**

---

## Quick Debug Commands

### Check if webhook is configured:
```bash
# In Stripe Dashboard → Webhooks
# Should see your endpoint listed
```

### Check recent webhook events:
```bash
# In Stripe Dashboard → Webhooks → Your endpoint
# Click "Events" tab
# See all recent events and their status
```

### Check Vercel logs:
```bash
# In Vercel Dashboard → Deployments → Functions
# Look for /api/webhooks/stripe
# Check for errors or success logs
```

---

## Summary

**The fix:**
1. ✅ Create webhook endpoint in Stripe Dashboard
2. ✅ Add 4 events (checkout.session.completed, etc.)
3. ✅ Copy webhook secret
4. ✅ Add to Vercel as `STRIPE_WEBHOOK_SECRET`
5. ✅ Redeploy application
6. ✅ Test payment
7. ✅ Verify subscription updates

**After this, payments will automatically update your database and unlock Pro features!** 🎉

---

## Need Help?

If still not working, check:
1. Stripe Dashboard → Webhooks → Recent events (any failures?)
2. Vercel → Functions logs (any errors?)
3. MongoDB → users collection (subscription field added?)

Share any error messages and I can help debug further!
