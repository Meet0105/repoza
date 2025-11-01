# 🚀 Razorpay Setup Guide - Quick Start

## ✅ Migration Complete!

I've successfully migrated from Stripe to Razorpay! Here's what changed:

### 📦 What Was Done:

1. ✅ Installed Razorpay package
2. ✅ Created `utils/razorpay.ts` with all helper functions
3. ✅ Updated checkout API to use Razorpay
4. ✅ Created payment verification API
5. ✅ Updated subscription portal API
6. ✅ Created Razorpay webhook handler
7. ✅ Simplified pricing page (INR only)
8. ✅ Removed all Stripe code
9. ✅ Updated environment variables template

---

## 🔑 Step 1: Add Your Razorpay Keys

You already have your Razorpay account! Now add these to your `.env.local`:

```env
# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# Razorpay Plan IDs
RAZORPAY_PLAN_MONTHLY=plan_YOUR_MONTHLY_PLAN_ID
RAZORPAY_PLAN_YEARLY=plan_YOUR_YEARLY_PLAN_ID
```

### Where to Find These:

**API Keys:**
1. Login to https://dashboard.razorpay.com
2. Make sure you're in **Test Mode**
3. Go to **Settings** → **API Keys**
4. Click **"Generate Test Key"**
5. Copy **Key ID** and **Key Secret**

**Webhook Secret:**
1. Go to **Settings** → **Webhooks**
2. Click **"+ Add New Webhook"**
3. Webhook URL: `https://your-vercel-url.vercel.app/api/webhooks/razorpay`
4. Secret: Enter any random string (e.g., `repoza_webhook_123`)
5. Select events:
   - ✅ subscription.activated
   - ✅ subscription.charged
   - ✅ subscription.cancelled
   - ✅ subscription.completed
   - ✅ subscription.halted
   - ✅ payment.failed
6. Click **Create**
7. Copy the secret you entered

**Plan IDs:**
1. Go to **Subscriptions** → **Plans**
2. Click **"Create Plan"**

**Monthly Plan:**
- Name: `Repoza Pro Monthly`
- Interval: `1 Month`
- Amount: `79900` (₹799 in paise)
- Currency: `INR`
- Click **Create**
- Copy the **Plan ID**

**Yearly Plan:**
- Name: `Repoza Pro Yearly`
- Interval: `12 Months`
- Amount: `799900` (₹7999 in paise)
- Currency: `INR`
- Click **Create**
- Copy the **Plan ID**

---

## 🧪 Step 2: Test Locally

1. Add all keys to `.env.local`
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Go to http://localhost:3000/pricing
4. Click "Upgrade to Pro"
5. Razorpay modal should open
6. Use test payment:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: `123`
   - OTP: `1234`
7. Complete payment
8. Should redirect to success page

---

## 🌐 Step 3: Deploy to Vercel

1. Add environment variables to Vercel:
   - Go to Vercel Dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add all Razorpay variables
   - Select **Production**, **Preview**, **Development**

2. Update webhook URL:
   - After deployment, get your Vercel URL
   - Go to Razorpay Dashboard → **Settings** → **Webhooks**
   - Update webhook URL to: `https://your-vercel-url.vercel.app/api/webhooks/razorpay`

3. Deploy:
   ```bash
   git add .
   git commit -m "feat: Migrate from Stripe to Razorpay"
   git push origin main
   ```

---

## 💳 Step 4: Test on Production

1. Go to your live site
2. Sign in
3. Go to `/pricing`
4. Click "Upgrade to Pro"
5. Complete test payment
6. Verify:
   - Success page shows
   - Database updated (check MongoDB)
   - Webhook received (check Razorpay dashboard)

---

## 🎯 How It Works Now

### User Flow:

1. **User clicks "Upgrade to Pro"**
   - Frontend calls `/api/subscription/create-checkout`
   - Backend creates Razorpay subscription
   - Returns subscription ID

2. **Razorpay modal opens**
   - User sees payment options (UPI, Cards, Net Banking, Wallets)
   - User completes payment
   - Razorpay verifies payment

3. **Payment successful**
   - Frontend calls `/api/subscription/verify-payment`
   - Backend verifies signature
   - Updates database
   - Redirects to success page

4. **Webhook notification**
   - Razorpay sends webhook to `/api/webhooks/razorpay`
   - Backend updates subscription status
   - User gets Pro access

---

## 🔍 Testing Checklist

- [ ] Keys added to `.env.local`
- [ ] Plans created in Razorpay
- [ ] Webhook configured
- [ ] Local test successful
- [ ] Keys added to Vercel
- [ ] Deployed to production
- [ ] Production test successful
- [ ] Webhook events received
- [ ] Database updated correctly
- [ ] Success page works

---

## 🎨 What Changed for Users

### Before (Stripe):
- Redirected to Stripe page
- Only card payments
- USD/multi-currency

### After (Razorpay):
- Modal opens on same page
- Multiple payment methods (UPI, Cards, Net Banking, Wallets)
- INR only (₹799/month, ₹7999/year)
- Better for Indian users

---

## 📊 Pricing

- **Monthly**: ₹799/month
- **Yearly**: ₹7999/year (Save 17%)

---

## 🐛 Troubleshooting

### Issue: Razorpay modal doesn't open
- **Solution**: Check if Razorpay script is loaded
- **Solution**: Check browser console for errors
- **Solution**: Verify RAZORPAY_KEY_ID is correct

### Issue: Payment successful but database not updated
- **Solution**: Check webhook is configured
- **Solution**: Verify webhook secret matches
- **Solution**: Check Vercel logs for errors

### Issue: Signature verification failed
- **Solution**: Verify RAZORPAY_KEY_SECRET is correct
- **Solution**: Check webhook secret matches

---

## 🚀 Going Live (When Ready)

1. Complete KYC in Razorpay:
   - Submit PAN card
   - Add bank details
   - Verify business address

2. Switch to Live Mode:
   - Toggle to "Live Mode" in Razorpay dashboard
   - Generate Live API keys
   - Create Live subscription plans
   - Update webhook URL

3. Update Environment Variables:
   - Replace test keys with live keys
   - Update plan IDs
   - Deploy

4. Test with Real Payment:
   - Use small amount first
   - Verify everything works
   - Go live!

---

## 📞 Support

- Razorpay Docs: https://razorpay.com/docs/
- Subscriptions: https://razorpay.com/docs/payments/subscriptions/
- Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com

---

**You're all set! 🎉**

Just add your keys and test it out!
