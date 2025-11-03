# Stripe Products Tracker

Use this to track your product creation progress and organize Price IDs.

## Progress Tracker

### Monthly Products (10/10)

| # | Currency | Price | Status | Product ID | Price ID | Notes |
|---|----------|-------|--------|------------|----------|-------|
| 1 | USD | $9.99 | ⬜ Not Created | | | |
| 2 | EUR | €8.99 | ⬜ Not Created | | | |
| 3 | GBP | £7.99 | ⬜ Not Created | | | |
| 4 | INR | ₹799 | ⬜ Not Created | | | |
| 5 | CAD | C$12.99 | ⬜ Not Created | | | |
| 6 | AUD | A$14.99 | ⬜ Not Created | | | |
| 7 | SGD | S$13.99 | ⬜ Not Created | | | |
| 8 | JPY | ¥1,299 | ⬜ Not Created | | | |
| 9 | BRL | R$49.99 | ⬜ Not Created | | | |
| 10 | MXN | MX$199 | ⬜ Not Created | | | |

### Yearly Products (10/10)

| # | Currency | Price | Status | Product ID | Price ID | Notes |
|---|----------|-------|--------|------------|----------|-------|
| 11 | USD | $99.99 | ⬜ Not Created | | | |
| 12 | EUR | €89.99 | ⬜ Not Created | | | |
| 13 | GBP | £79.99 | ⬜ Not Created | | | |
| 14 | INR | ₹7,999 | ⬜ Not Created | | | |
| 15 | CAD | C$129.99 | ⬜ Not Created | | | |
| 16 | AUD | A$149.99 | ⬜ Not Created | | | |
| 17 | SGD | S$139.99 | ⬜ Not Created | | | |
| 18 | JPY | ¥12,999 | ⬜ Not Created | | | |
| 19 | BRL | R$499.99 | ⬜ Not Created | | | |
| 20 | MXN | MX$1,999 | ⬜ Not Created | | | |

**Status Legend:**
- ⬜ Not Created
- 🟡 In Progress
- ✅ Completed
- ❌ Error

## Environment Variables Template

Copy this template and fill in your Price IDs:

```env
# ==============================================
# STRIPE PRICE IDs - TEST MODE
# ==============================================

# Monthly Plans
STRIPE_PRICE_USD_MONTHLY=price_
STRIPE_PRICE_EUR_MONTHLY=price_
STRIPE_PRICE_GBP_MONTHLY=price_
STRIPE_PRICE_INR_MONTHLY=price_
STRIPE_PRICE_CAD_MONTHLY=price_
STRIPE_PRICE_AUD_MONTHLY=price_
STRIPE_PRICE_SGD_MONTHLY=price_
STRIPE_PRICE_JPY_MONTHLY=price_
STRIPE_PRICE_BRL_MONTHLY=price_
STRIPE_PRICE_MXN_MONTHLY=price_

# Yearly Plans
STRIPE_PRICE_USD_YEARLY=price_
STRIPE_PRICE_EUR_YEARLY=price_
STRIPE_PRICE_GBP_YEARLY=price_
STRIPE_PRICE_INR_YEARLY=price_
STRIPE_PRICE_CAD_YEARLY=price_
STRIPE_PRICE_AUD_YEARLY=price_
STRIPE_PRICE_SGD_YEARLY=price_
STRIPE_PRICE_JPY_YEARLY=price_
STRIPE_PRICE_BRL_YEARLY=price_
STRIPE_PRICE_MXN_YEARLY=price_
```

## Quick Reference

### Stripe Dashboard Links

**Test Mode:**
- Products: https://dashboard.stripe.com/test/products
- Prices: https://dashboard.stripe.com/test/prices
- Subscriptions: https://dashboard.stripe.com/test/subscriptions

**Live Mode:**
- Products: https://dashboard.stripe.com/products
- Prices: https://dashboard.stripe.com/prices
- Subscriptions: https://dashboard.stripe.com/subscriptions

### Test Cards

| Purpose | Card Number | Notes |
|---------|-------------|-------|
| Success | 4242 4242 4242 4242 | Standard test card |
| 3D Secure | 4000 0025 0000 3155 | Requires authentication |
| Decline | 4000 0000 0000 0002 | Card declined |
| Insufficient Funds | 4000 0000 0000 9995 | Insufficient funds |

### Currency Codes

| Currency | Code | Symbol | Decimal Places |
|----------|------|--------|----------------|
| US Dollar | USD | $ | 2 |
| Euro | EUR | € | 2 |
| British Pound | GBP | £ | 2 |
| Indian Rupee | INR | ₹ | 2 |
| Canadian Dollar | CAD | C$ | 2 |
| Australian Dollar | AUD | A$ | 2 |
| Singapore Dollar | SGD | S$ | 2 |
| Japanese Yen | JPY | ¥ | 0 |
| Brazilian Real | BRL | R$ | 2 |
| Mexican Peso | MXN | MX$ | 2 |

## Verification Checklist

### Before Going Live

- [ ] All 20 products created in Test Mode
- [ ] All Price IDs added to `.env.local`
- [ ] Tested checkout for each currency
- [ ] Tested monthly and yearly billing
- [ ] Webhook receiving subscription events
- [ ] Subscription status updating in database
- [ ] Feature gates working correctly
- [ ] Cancel/refund flow tested
- [ ] Customer portal tested

### Production Launch

- [ ] All 20 products created in Live Mode
- [ ] Live Price IDs added to production `.env`
- [ ] Webhook endpoint verified in Live Mode
- [ ] Test transaction completed and refunded
- [ ] Monitoring/alerts set up
- [ ] Customer support ready
- [ ] Pricing page reviewed
- [ ] Terms of Service updated
- [ ] Privacy Policy updated
- [ ] Refund policy documented

## Notes & Issues

Use this section to track any issues or notes during setup:

```
Date: ___________
Issue: 
Solution: 

Date: ___________
Issue: 
Solution: 

Date: ___________
Issue: 
Solution: 
```

## Time Log

Track how long each phase takes:

| Phase | Start Time | End Time | Duration | Notes |
|-------|------------|----------|----------|-------|
| Test Mode Setup | | | | |
| Testing | | | | |
| Live Mode Setup | | | | |
| Final Testing | | | | |
| Launch | | | | |

## Contact Information

**Stripe Support:**
- Email: support@stripe.com
- Dashboard: https://dashboard.stripe.com/support
- Docs: https://stripe.com/docs

**Your Team:**
- Developer: ___________
- Email: ___________
- Phone: ___________
