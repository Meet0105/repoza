# 🇮🇳 Razorpay Migration Plan - From Stripe to Razorpay

## 📋 Overview
This plan outlines how to replace Stripe with Razorpay for subscription payments. Razorpay is perfect for India and supports all Indian payment methods.

---

## 🎯 Why Razorpay?

### ✅ Advantages
- **Made for India** - No signup issues
- **All Indian Payment Methods** - UPI, Cards, Net Banking, Wallets
- **Easy KYC** - Just need PAN card and bank details
- **Better Conversion** - Indian customers trust it more
- **Lower Fees** - 2% vs Stripe's 2.9% + international fees
- **INR Native** - No currency conversion issues
- **Test Mode** - Easy testing without real money
- **Great Support** - Indian customer support

### 📊 Comparison

| Feature | Stripe | Razorpay |
|---------|--------|----------|
| Signup Difficulty (India) | ❌ Hard | ✅ Easy |
| Payment Methods | Cards only | UPI, Cards, Net Banking, Wallets |
| Fees | 2.9% + $0.30 | 2% (no fixed fee) |
| Currency | USD primary | INR primary |
| Indian Support | Limited | Excellent |
| Test Mode | ✅ Yes | ✅ Yes |
| Subscriptions | ✅ Yes | ✅ Yes |

---

## 📝 Migration Plan

### **Phase 1: Razorpay Account Setup** (15 minutes)

#### Step 1.1: Create Razorpay Account
1. Go to https://razorpay.com
2. Click "Sign Up"
3. Enter your details:
   - Email (any email works!)
   - Phone number
   - Business name: "Repoza"
4. Verify email and phone
5. You're in! (No work email needed!)

#### Step 1.2: Get Test API Keys
1. Dashboard will open in **Test Mode** by default
2. Go to **Settings** → **API Keys**
3. Click "Generate Test Keys"
4. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (click "Show" to reveal)

#### Step 1.3: Complete KYC (Later, for Live Mode)
- You'll need:
  - PAN Card
  - Bank Account Details
  - Business Address
- Can be done later when going live

---

### **Phase 2: Code Changes** (45 minutes)

#### What We'll Change:

**Files to Modify:**
1. ✏️ `utils/stripe.ts` → Rename to `utils/razorpay.ts`
2. ✏️ `pages/api/subscription/create-checkout.ts`
3. ✏️ `pages/api/subscription/portal.ts`
4. ✏️ `pages/api/subscription/status.ts`
5. ✏️ `pages/api/webhooks/stripe.ts` → Rename to `pages/api/webhooks/razorpay.ts`
6. ✏️ `pages/pricing.tsx` (minor changes)
7. ✏️ `package.json` (add razorpay package)
8. ✏️ `.env.example` and `.env.local`

**New Files to Create:**
1. 📄 `utils/razorpay.ts` - Razorpay helper functions
2. 📄 `pages/api/webhooks/razorpay.ts` - Webhook handler

---

### **Phase 3: Razorpay Subscription Plans** (20 minutes)

#### Step 3.1: Create Subscription Plans

In Razorpay Dashboard:

1. Go to **Subscriptions** → **Plans**
2. Click **Create Plan**

**Plan 1: Monthly (INR)**
- Plan Name: `Repoza Pro - Monthly`
- Billing Cycle: `Monthly`
- Amount: `₹799`
- Currency: `INR`
- Click **Create**
- **Copy Plan ID** (starts with `plan_`)

**Plan 2: Yearly (INR)**
- Plan Name: `Repoza Pro - Yearly`
- Billing Cycle: `Yearly`
- Amount: `₹7999`
- Currency: `INR`
- Click **Create**
- **Copy Plan ID**

**Note:** Razorpay primarily works with INR. For international customers, you can:
- Use Razorpay International (requires additional KYC)
- Or keep Stripe for international, Razorpay for India
- Or convert all prices to INR

---

### **Phase 4: Implementation Details**

#### 4.1: Package Installation
```bash
npm install razorpay
```

#### 4.2: Environment Variables

**New variables needed:**
```env
# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Razorpay Plan IDs
RAZORPAY_PLAN_MONTHLY=plan_monthly_id
RAZORPAY_PLAN_YEARLY=plan_yearly_id
```

#### 4.3: Key Differences from Stripe

**Stripe:**
```javascript
// Stripe creates checkout session on server
const session = await stripe.checkout.sessions.create({...});
// Redirect to Stripe hosted page
window.location.href = session.url;
```

**Razorpay:**
```javascript
// Razorpay creates subscription on server
const subscription = await razorpay.subscriptions.create({...});
// Open Razorpay modal on client side
const options = {
  key: 'rzp_test_xxx',
  subscription_id: subscription.id,
  name: 'Repoza',
  handler: function(response) {
    // Payment successful
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

---

### **Phase 5: Testing** (30 minutes)

#### Test Payment Flow:

1. **Test Mode** - No real money
2. **Test Cards:**
   - Success: Any card number (e.g., `4111 1111 1111 1111`)
   - OTP: `1234` (for 3D Secure)
3. **Test UPI:**
   - UPI ID: `success@razorpay`
   - Auto-approves payment
4. **Test Net Banking:**
   - Select any bank
   - Auto-approves

#### Webhook Testing:
1. Use Razorpay webhook simulator
2. Or use ngrok for local testing
3. Verify events are received

---

## 🔄 Migration Strategy

### Option A: Complete Replacement (Recommended)
- Remove all Stripe code
- Replace with Razorpay
- Simpler, cleaner codebase
- **Best for India-focused app**

### Option B: Dual Gateway (Advanced)
- Keep both Stripe and Razorpay
- Use Razorpay for India
- Use Stripe for international
- More complex but supports global users

**For your case, I recommend Option A** since you're primarily targeting India.

---

## 📦 What Will Change

### User Experience:

**Before (Stripe):**
1. Click "Upgrade to Pro"
2. Redirect to Stripe checkout page
3. Enter card details
4. Redirect back to success page

**After (Razorpay):**
1. Click "Upgrade to Pro"
2. Razorpay modal opens (stays on same page)
3. Choose payment method (UPI/Card/Net Banking/Wallet)
4. Complete payment
5. Success message shows immediately

### Payment Methods Available:

**Stripe:** 
- 💳 Credit/Debit Cards only

**Razorpay:**
- 💳 Credit/Debit Cards
- 📱 UPI (Google Pay, PhonePe, Paytm)
- 🏦 Net Banking (All Indian banks)
- 👛 Wallets (Paytm, PhonePe, etc.)
- 💰 EMI options

---

## 💰 Pricing Strategy

### Current Multi-Currency Pricing:
You have 10 currencies (USD, EUR, GBP, INR, etc.)

### Razorpay Options:

**Option 1: INR Only (Simplest)**
- ₹799/month
- ₹7999/year
- Remove currency selector
- Show "Prices in INR"

**Option 2: Display Multiple Currencies, Charge in INR**
- Show: $9.99, ₹799, €9.49, etc.
- But charge everything in INR
- Razorpay converts automatically
- Keep currency selector for display only

**Option 3: Razorpay International (Requires KYC)**
- Support actual multi-currency
- Requires additional verification
- Can do later

**I recommend Option 2** - Show multiple currencies but charge in INR. This gives international feel while keeping it simple.

---

## ⚠️ Important Considerations

### 1. **Existing Stripe Subscriptions**
- If you already have Stripe customers (you don't yet)
- Need to migrate them manually
- Or keep Stripe running alongside

### 2. **Webhook URLs**
- Razorpay webhook: `/api/webhooks/razorpay`
- Different from Stripe: `/api/webhooks/stripe`

### 3. **Customer Portal**
- Stripe has built-in customer portal
- Razorpay doesn't have this
- We'll build a simple one in your app

### 4. **Refunds**
- Both support refunds
- Razorpay: Through dashboard or API
- Instant refunds for most payment methods

### 5. **Settlement**
- Razorpay: T+2 days (2 days after payment)
- Stripe: T+7 days for India
- Razorpay is faster!

---

## 📋 Implementation Checklist

### Pre-Implementation:
- [ ] Create Razorpay account
- [ ] Get test API keys
- [ ] Create subscription plans
- [ ] Copy plan IDs
- [ ] Review this plan with team

### Implementation:
- [ ] Install razorpay package
- [ ] Create `utils/razorpay.ts`
- [ ] Update checkout API
- [ ] Update webhook handler
- [ ] Update pricing page
- [ ] Update environment variables
- [ ] Remove/rename Stripe files

### Testing:
- [ ] Test monthly subscription
- [ ] Test yearly subscription
- [ ] Test with card payment
- [ ] Test with UPI payment
- [ ] Test webhook events
- [ ] Test subscription cancellation
- [ ] Verify database updates

### Deployment:
- [ ] Update Vercel environment variables
- [ ] Deploy to production
- [ ] Test on live site
- [ ] Monitor for errors

### Go Live (Later):
- [ ] Complete KYC verification
- [ ] Switch to live mode
- [ ] Get live API keys
- [ ] Create live subscription plans
- [ ] Update environment variables
- [ ] Test with real payment (small amount)
- [ ] Launch! 🚀

---

## 🕐 Time Estimates

| Phase | Time | Difficulty |
|-------|------|------------|
| Account Setup | 15 min | Easy |
| Code Changes | 45 min | Medium |
| Create Plans | 20 min | Easy |
| Testing | 30 min | Easy |
| Deployment | 15 min | Easy |
| **Total** | **~2 hours** | **Medium** |

---

## 💡 Pros & Cons

### ✅ Pros of Migration:
- Easy signup (no work email needed)
- Better for Indian customers
- More payment methods
- Lower fees
- Faster settlements
- Better support
- Easier testing

### ⚠️ Cons:
- Need to rewrite some code (~2 hours)
- Primarily INR focused
- Less global reach than Stripe
- No built-in customer portal

---

## 🎯 Recommendation

**I recommend proceeding with Razorpay migration because:**

1. ✅ You're facing Stripe signup issues
2. ✅ Your primary market is India
3. ✅ Better user experience for Indian customers
4. ✅ More payment methods = better conversion
5. ✅ Lower fees = more profit
6. ✅ Easier to test and go live

**The migration is straightforward and will take ~2 hours of work.**

---

## 🚀 Next Steps

If you approve this plan, I will:

1. **Install Razorpay package**
2. **Create new Razorpay utility files**
3. **Update all API endpoints**
4. **Update pricing page**
5. **Update environment variables**
6. **Test everything**
7. **Deploy**

**Total implementation time: ~2 hours**

---

## 📞 Support Resources

- Razorpay Docs: https://razorpay.com/docs/
- Subscriptions Guide: https://razorpay.com/docs/payments/subscriptions/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: support@razorpay.com

---

## ❓ Questions to Consider

Before we proceed, please confirm:

1. **Are you okay with INR as primary currency?** (Can show others but charge in INR)
2. **Do you want to completely remove Stripe?** (Recommended: Yes)
3. **Are you ready to create Razorpay account now?** (Takes 5 minutes)
4. **Should we proceed with implementation?** (Takes ~2 hours)

---

**Ready to proceed? Let me know and I'll start the implementation!** 🚀
