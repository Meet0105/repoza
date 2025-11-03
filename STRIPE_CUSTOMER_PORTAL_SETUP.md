# Stripe Customer Portal Setup Guide

## Issue: "Manage Subscription" Shows 404 Error

### Why This Happens
The Customer Portal is a Stripe feature that needs to be **activated and configured** in your Stripe Dashboard before it can be used.

## Quick Fix (5 Minutes)

### Step 1: Access Customer Portal Settings

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)
3. Click on **Settings** (gear icon in top right)
4. In the left sidebar, find **Billing** section
5. Click on **Customer portal**

**Direct Link:** https://dashboard.stripe.com/test/settings/billing/portal

### Step 2: Activate Customer Portal

You'll see a page titled "Customer portal"

1. Click **Activate test link** button (if not already activated)
2. This enables the portal for Test Mode

### Step 3: Configure Portal Settings

#### **Business Information**
- **Business name:** `Repoza`
- **Support email:** Your support email (e.g., `support@repoza.com`)
- **Support phone:** (Optional)
- **Privacy policy URL:** Your privacy policy URL (optional)
- **Terms of service URL:** Your terms URL (optional)

#### **Functionality** (What customers can do)

Enable these options:

✅ **Cancel subscriptions**
- Allow customers to cancel their subscription
- Options:
  - ✅ Cancel immediately
  - ✅ Cancel at period end (recommended)

✅ **Update subscriptions**
- Allow customers to upgrade/downgrade plans
- ✅ Enable proration (recommended)

✅ **Update payment method**
- Allow customers to update their credit card

✅ **View invoice history**
- Allow customers to see past invoices

#### **Products** (What plans customers can switch to)

1. Click **Add products**
2. Select all your products:
   - Repoza Pro - Monthly (USD)
   - Repoza Pro - Yearly (USD)
   - (Add all other currencies as you create them)
3. Click **Add products**

### Step 4: Save Configuration

1. Scroll to bottom
2. Click **Save** button
3. You should see "Customer portal settings saved"

### Step 5: Test It

1. Go to your website
2. Sign in with a Pro account (or create test subscription)
3. Go to `/pricing` page
4. Click **"Manage Subscription"**
5. Should now redirect to Stripe Customer Portal ✅

## What Customers Can Do in Portal

Once configured, customers can:

- 📋 View subscription details
- 💳 Update payment method
- 📊 View invoice history
- 🔄 Switch between monthly/yearly
- 🔄 Change currency (if you enable it)
- ❌ Cancel subscription
- 📧 Update billing email

## Configuration Options Explained

### Cancel Subscriptions

**Cancel immediately:**
- Subscription ends right away
- Customer loses access immediately
- Gets prorated refund

**Cancel at period end (Recommended):**
- Subscription continues until end of billing period
- Customer keeps access until then
- No refund needed
- Better customer experience

### Update Subscriptions

**Proration:**
- When customer upgrades/downgrades
- Stripe calculates the difference
- Charges or credits accordingly
- Example: Upgrade from monthly to yearly → charges difference

### Invoice History

**What customers see:**
- All past invoices
- Payment dates
- Amounts paid
- Download PDF invoices

## Advanced Configuration

### Custom Branding

1. In Customer Portal settings
2. Go to **Branding** section
3. Upload your logo
4. Set brand colors
5. Customize button colors

### Email Notifications

Configure what emails customers receive:
- Payment successful
- Payment failed
- Subscription cancelled
- Subscription renewed

## For Production (Live Mode)

Once testing is complete:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Repeat all configuration steps** for Live Mode
3. Go to Settings → Billing → Customer portal
4. Click **Activate live link**
5. Configure same settings as Test Mode
6. Save

**Important:** Test and Live modes have separate configurations!

## Troubleshooting

### Still Getting 404?

**Check 1: Is Customer Portal Activated?**
- Go to Settings → Billing → Customer portal
- Should see "Activated" status
- If not, click "Activate test link"

**Check 2: Does User Have Subscription?**
- Customer Portal only works for users with active subscriptions
- Check Stripe Dashboard → Customers
- Verify customer has subscription

**Check 3: Is Customer ID Saved?**
- When user subscribes, we save `stripeCustomerId` in database
- Check MongoDB → users collection
- User should have `subscription.stripeCustomerId` field

**Check 4: Check Browser Console**
- Open DevTools (F12)
- Look for errors
- Common error: "No customer found"

**Check 5: Check Vercel Logs**
- Go to Vercel → Deployments → Functions
- Look for `/api/subscription/portal` logs
- Check for errors

### Error: "No subscription found"

**Cause:** User doesn't have `stripeCustomerId` in database

**Solution:**
1. User needs to complete a payment first
2. Webhook should save customer ID
3. Check webhook is configured correctly

### Error: "Invalid customer ID"

**Cause:** Customer ID is wrong or from different mode (Test vs Live)

**Solution:**
1. Verify you're in correct mode (Test/Live)
2. Check customer ID in database matches Stripe
3. Customer ID should start with `cus_`

## Testing the Portal

### Test Scenario 1: View Subscription

1. Create test subscription
2. Click "Manage Subscription"
3. Should see subscription details
4. Verify plan name, price, next billing date

### Test Scenario 2: Update Payment Method

1. In Customer Portal
2. Click "Update payment method"
3. Enter new test card: `4242 4242 4242 4242`
4. Save
5. Should see "Payment method updated"

### Test Scenario 3: Cancel Subscription

1. In Customer Portal
2. Click "Cancel subscription"
3. Choose "Cancel at period end"
4. Confirm cancellation
5. Should see "Subscription will cancel on [date]"

### Test Scenario 4: Switch Plans

1. In Customer Portal
2. Click "Update plan"
3. Select different plan (e.g., monthly to yearly)
4. Confirm
5. Should see updated plan

## Environment Variables Needed

Make sure these are in Vercel:

```env
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXTAUTH_URL=https://your-site.vercel.app
```

The portal uses these to:
- Authenticate requests
- Create portal sessions
- Redirect back to your site

## Return URL

After customer finishes in portal, they're redirected to:
```
https://your-site.vercel.app/subscription
```

You can create this page to show subscription status, or redirect to `/pricing`.

### Optional: Create Subscription Page

Create `pages/subscription.tsx`:

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SubscriptionPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to pricing page after portal
    router.push('/pricing');
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
```

## Security Notes

- Portal sessions expire after 1 hour
- Each session is unique and one-time use
- Customer must be authenticated to access portal
- Portal URL cannot be shared or reused

## Summary

**To fix 404 error:**

1. ✅ Go to Stripe Dashboard → Settings → Billing → Customer portal
2. ✅ Click "Activate test link"
3. ✅ Configure portal settings (enable cancel, update, etc.)
4. ✅ Add your products
5. ✅ Save configuration
6. ✅ Test with a subscription

**That's it!** The "Manage Subscription" button should now work perfectly. 🎉

## Need Help?

If still not working, check:
- [ ] Customer Portal is activated in Stripe
- [ ] User has completed a payment
- [ ] User has `stripeCustomerId` in database
- [ ] Webhook is working correctly
- [ ] You're in correct mode (Test/Live)

Share any error messages and I can help debug further!
