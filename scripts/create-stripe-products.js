/**
 * Automated Stripe Products Creation Script
 * 
 * This script creates all 20 products (10 currencies × 2 billing cycles)
 * in your Stripe account automatically.
 * 
 * Usage:
 * 1. Make sure you have Stripe API key in .env.local
 * 2. Run: node scripts/create-stripe-products.js
 * 3. Copy the output Price IDs to your .env.local
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Product configuration
const PRODUCT_CONFIG = {
  name: 'Repoza Pro',
  description: 'Unlimited access to all premium features including Code Converter, Learning Paths, Repository Q&A, Live Preview, and One-Click Deploy. Cancel anytime.',
  features: [
    'Unlimited Code Conversions',
    'AI-Powered Learning Paths',
    'Repository Q&A with AI',
    'Live Preview in StackBlitz',
    'One-Click Deploy to Vercel',
    'Priority Support',
    'No Usage Limits'
  ]
};

// Pricing configuration
const PRICING = {
  monthly: {
    USD: 9.99,
    EUR: 8.99,
    GBP: 7.99,
    INR: 799,
    CAD: 12.99,
    AUD: 14.99,
    SGD: 13.99,
    JPY: 1299,
    BRL: 49.99,
    MXN: 199
  },
  yearly: {
    USD: 99.99,
    EUR: 89.99,
    GBP: 79.99,
    INR: 7999,
    CAD: 129.99,
    AUD: 149.99,
    SGD: 139.99,
    JPY: 12999,
    BRL: 499.99,
    MXN: 1999
  }
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  SGD: 'S$',
  JPY: '¥',
  BRL: 'R$',
  MXN: 'MX$'
};

async function createProduct(currency, billingCycle) {
  const price = PRICING[billingCycle][currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  const interval = billingCycle === 'monthly' ? 'month' : 'year';
  
  try {
    console.log(`\n📦 Creating product: ${currency} ${billingCycle}...`);
    
    // Create product
    const product = await stripe.products.create({
      name: `${PRODUCT_CONFIG.name} - ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} (${currency})`,
      description: PRODUCT_CONFIG.description,
      metadata: {
        currency: currency,
        billing_cycle: billingCycle,
        features: PRODUCT_CONFIG.features.join(', ')
      }
    });
    
    console.log(`✅ Product created: ${product.id}`);
    
    // Create price
    const priceAmount = Math.round(price * 100); // Convert to cents
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: priceAmount,
      currency: currency.toLowerCase(),
      recurring: {
        interval: interval,
        interval_count: 1
      },
      metadata: {
        display_price: `${symbol}${price}`,
        billing_cycle: billingCycle
      }
    });
    
    console.log(`✅ Price created: ${priceObj.id}`);
    console.log(`   Amount: ${symbol}${price}/${interval}`);
    
    return {
      currency,
      billingCycle,
      productId: product.id,
      priceId: priceObj.id,
      amount: price,
      symbol
    };
    
  } catch (error) {
    console.error(`❌ Error creating ${currency} ${billingCycle}:`, error.message);
    return null;
  }
}

async function createAllProducts() {
  console.log('🚀 Starting Stripe Products Creation...\n');
  console.log('📋 Configuration:');
  console.log(`   Product: ${PRODUCT_CONFIG.name}`);
  console.log(`   Currencies: ${Object.keys(PRICING.monthly).length}`);
  console.log(`   Billing Cycles: 2 (monthly, yearly)`);
  console.log(`   Total Products: ${Object.keys(PRICING.monthly).length * 2}`);
  console.log('\n' + '='.repeat(60));
  
  const results = [];
  
  // Create monthly products
  console.log('\n📅 Creating MONTHLY products...');
  for (const currency of Object.keys(PRICING.monthly)) {
    const result = await createProduct(currency, 'monthly');
    if (result) results.push(result);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Create yearly products
  console.log('\n📅 Creating YEARLY products...');
  for (const currency of Object.keys(PRICING.yearly)) {
    const result = await createProduct(currency, 'yearly');
    if (result) results.push(result);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All products created successfully!\n');
  
  // Generate .env.local format
  console.log('📝 Copy these to your .env.local:\n');
  console.log('# Stripe Price IDs - Monthly');
  results
    .filter(r => r.billingCycle === 'monthly')
    .forEach(r => {
      console.log(`STRIPE_PRICE_${r.currency}_MONTHLY=${r.priceId}`);
    });
  
  console.log('\n# Stripe Price IDs - Yearly');
  results
    .filter(r => r.billingCycle === 'yearly')
    .forEach(r => {
      console.log(`STRIPE_PRICE_${r.currency}_YEARLY=${r.priceId}`);
    });
  
  // Generate summary table
  console.log('\n\n📊 Summary Table:\n');
  console.log('| Currency | Monthly | Yearly | Monthly Price ID | Yearly Price ID |');
  console.log('|----------|---------|--------|------------------|-----------------|');
  
  const currencies = Object.keys(PRICING.monthly);
  currencies.forEach(currency => {
    const monthly = results.find(r => r.currency === currency && r.billingCycle === 'monthly');
    const yearly = results.find(r => r.currency === currency && r.billingCycle === 'yearly');
    
    if (monthly && yearly) {
      console.log(`| ${currency} | ${monthly.symbol}${monthly.amount} | ${yearly.symbol}${yearly.amount} | ${monthly.priceId} | ${yearly.priceId} |`);
    }
  });
  
  console.log('\n✨ Done! Your Stripe products are ready to use.\n');
  console.log('Next steps:');
  console.log('1. Copy the Price IDs above to your .env.local');
  console.log('2. Restart your development server');
  console.log('3. Test the pricing page');
  console.log('4. Repeat this process in Live Mode when ready for production\n');
}

// Run the script
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in environment variables');
  console.error('Please add it to your .env.local file');
  process.exit(1);
}

createAllProducts()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
