# Fix 308 Webhook Error

## Problem
Webhook shows 308 error: `{"redirect": "/api/webhooks/stripe","status": "308"}`

## What 308 Means
HTTP 308 = Permanent Redirect. Vercel is redirecting the webhook request, so it never reaches your API handler.

## Quick Fix

### Step 1: Update Webhook URL in Stripe

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click "..." menu → "Update details"
4. Try **WITHOUT** trailing slash:
   ```
   https://repoza.vercel.app/api/webhooks/stripe
   ```
5. Click "Update endpoint"
6. Test again

If still 308, try **WITH** trailing slash:
```
https://repoza.vercel.app/api/webhooks/stripe/
```

### Step 2: Verify Webhook Secret

Make sure `STRIPE_WEBHOOK_SECRET` in Vercel matches the webhook secret in Stripe Dashboard.

### Step 3: Test Webhook

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click "Send test webhook"
3. Select `checkout.session.completed`
4. Click "Send test webhook"
5. Should see "200 OK" instead of "308"

## Manual Fix for Current Payment

Since your payment already completed, you can manually update the database:

### Get Your IDs from Webhook Data:
```
Customer Email: meetparmar.codage@gmail.com
Customer ID: cus_TM2iXgtULbQ0Dx
Subscription ID: sub_1SPKdOI6RsdEgiXHJHhUmm6k
```

### Update MongoDB:

1. Go to MongoDB Atlas
2. Open "users" collection
3. Find user with email: `meetparmar.codage@gmail.com`
4. Click "Edit"
5. Add/Update this field:
   ```json
   "subscription": {
     "plan": "pro",
     "status": "active",
     "stripeCustomerId": "cus_TM2iXgtULbQ0Dx",
     "stripeSubscriptionId": "sub_1SPKdOI6RsdEgiXHJHhUmm6k",
     "currentPeriodEnd": "2025-02-03T00:00:00.000Z"
   }
   ```
6. Click "Update"
7. Refresh your website
8. Should now show "Manage Subscription" ✅

## Alternative: Create Vercel Rewrite

If the 308 persists, add this to `next.config.js`:

```javascript
export default {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/webhooks/stripe',
        destination: '/api/webhooks/stripe',
      },
    ];
  },
};
```

Then redeploy.

## Verify Fix

After updating webhook URL:

1. Complete a new test payment
2. Check Stripe Dashboard → Webhooks → Recent events
3. Should see "200 OK" instead of "308"
4. Check MongoDB → users collection
5. Subscription should be updated automatically
6. Refresh pricing page
7. Should show "Manage Subscription"

## Why This Happens

Common causes of 308:
- Trailing slash mismatch (URL with/without `/`)
- Vercel automatic HTTPS redirect
- Next.js middleware interfering
- Vercel edge config redirects

## Need Help?

If still getting 308:
1. Share your exact webhook URL
2. Check Vercel deployment logs
3. Try accessing the webhook URL directly in browser
4. Should see "Method not allowed" (not 308)
