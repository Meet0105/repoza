import { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Crown, Globe } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

// Currency configurations with regional pricing
const CURRENCIES = {
  USD: { symbol: '$', price: 9.99, yearlyPrice: 99.99, name: 'US Dollar', region: 'United States', code: 'usd' },
  EUR: { symbol: '€', price: 9.49, yearlyPrice: 94.99, name: 'Euro', region: 'Europe', code: 'eur' },
  GBP: { symbol: '£', price: 7.99, yearlyPrice: 79.99, name: 'British Pound', region: 'United Kingdom', code: 'gbp' },
  INR: { symbol: '₹', price: 799, yearlyPrice: 7999, name: 'Indian Rupee', region: 'India', code: 'inr' },
  CAD: { symbol: 'C$', price: 13.49, yearlyPrice: 134.99, name: 'Canadian Dollar', region: 'Canada', code: 'cad' },
  AUD: { symbol: 'A$', price: 14.99, yearlyPrice: 149.99, name: 'Australian Dollar', region: 'Australia', code: 'aud' },
  JPY: { symbol: '¥', price: 1499, yearlyPrice: 14999, name: 'Japanese Yen', region: 'Japan', code: 'jpy' },
  BRL: { symbol: 'R$', price: 49.99, yearlyPrice: 499.99, name: 'Brazilian Real', region: 'Brazil', code: 'brl' },
  MXN: { symbol: 'MX$', price: 179.99, yearlyPrice: 1799.99, name: 'Mexican Peso', region: 'Mexico', code: 'mxn' },
  SGD: { symbol: 'S$', price: 13.49, yearlyPrice: 134.99, name: 'Singapore Dollar', region: 'Singapore', code: 'sgd' },
};

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState<keyof typeof CURRENCIES>('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Auto-detect user's region on mount
  useEffect(() => {
    detectUserRegion();
  }, []);

  const detectUserRegion = async () => {
    try {
      // Try to detect user's country from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Simple timezone to currency mapping
      if (timezone.includes('India') || timezone.includes('Kolkata') || timezone.includes('Mumbai') || timezone.includes('Delhi')) {
        setSelectedCurrency('INR');
      } else if (timezone.includes('London') || timezone.includes('UK')) {
        setSelectedCurrency('GBP');
      } else if (timezone.includes('Europe') || timezone.includes('Paris') || timezone.includes('Berlin') || timezone.includes('Madrid')) {
        setSelectedCurrency('EUR');
      } else if (timezone.includes('Tokyo') || timezone.includes('Japan')) {
        setSelectedCurrency('JPY');
      } else if (timezone.includes('Australia') || timezone.includes('Sydney') || timezone.includes('Melbourne')) {
        setSelectedCurrency('AUD');
      } else if (timezone.includes('Toronto') || timezone.includes('Vancouver') || timezone.includes('Canada')) {
        setSelectedCurrency('CAD');
      } else if (timezone.includes('Sao_Paulo') || timezone.includes('Brazil')) {
        setSelectedCurrency('BRL');
      } else if (timezone.includes('Mexico')) {
        setSelectedCurrency('MXN');
      } else if (timezone.includes('Singapore')) {
        setSelectedCurrency('SGD');
      }
    } catch (error) {
      console.log('Could not detect region, defaulting to USD');
    }
  };

  const currentCurrency = CURRENCIES[selectedCurrency];
  const monthlyPrice = currentCurrency.price;
  const yearlyPrice = currentCurrency.yearlyPrice;
  const yearlyMonthlyPrice = (yearlyPrice / 12).toFixed(2);

  const handleUpgrade = async () => {
    if (!session) {
      signIn();
      return;
    }

    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: selectedCurrency,
          billingCycle: billingCycle,
        }),
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="text-5xl font-bold gradient-text-primary mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Choose the plan that fits your needs
            </p>

            {/* Currency Selector */}
            <div className="flex justify-center items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">Select your region:</span>
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="glass px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:glass-light transition-all"
                >
                  <span>{currentCurrency.symbol}</span>
                  <span>{selectedCurrency}</span>
                  <span className="text-gray-400 text-sm">- {currentCurrency.region}</span>
                  <svg className={`w-4 h-4 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCurrencyDropdown && (
                  <div className="absolute top-full mt-2 left-0 right-0 min-w-[300px] glass rounded-lg overflow-hidden z-50 max-h-96 overflow-y-auto shadow-2xl">
                    {Object.entries(CURRENCIES).map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setSelectedCurrency(code as keyof typeof CURRENCIES);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-all flex items-center justify-between ${
                          selectedCurrency === code ? 'bg-white/10 text-cyan-400' : 'text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">{info.symbol}</span>
                          <span>{code}</span>
                        </span>
                        <span className="text-gray-400 text-sm">{info.region}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 glass rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'gradient-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'gradient-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs badge-green">Save 17%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="glass rounded-2xl p-8 border border-white/10 hover-lift animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Free</h3>
                  <p className="text-gray-400">Get started for free</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <p className="text-gray-400">Forever free</p>
              </div>

              <button
                onClick={() => !session && signIn()}
                className="w-full btn-outline mb-8"
              >
                {session ? 'Current Plan' : 'Get Started'}
              </button>

              <div className="space-y-4">
                <Feature text="10 searches per day" />
                <Feature text="3 boilerplates per day" />
                <Feature text="3 collections max" />
                <Feature text="5 dependency scans per day" />
                <Feature text="3 setup guides per day" />
                <Feature text="7-day history" />
                <Feature text="Basic support" />
              </div>
            </div>

            {/* Pro Tier */}
            <div className="glass-strong rounded-2xl p-8 border-2 border-cyan-500/50 hover-lift animate-slide-up relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-4 right-4">
                <span className="badge-cyan flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Popular
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-ai flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold gradient-text-primary">Pro</h3>
                  <p className="text-gray-400">For power users</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold gradient-text-primary mb-2">
                  {currentCurrency.symbol}{billingCycle === 'monthly' ? monthlyPrice.toLocaleString() : yearlyMonthlyPrice}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">
                  {billingCycle === 'yearly' && `Billed yearly (${currentCurrency.symbol}${yearlyPrice.toLocaleString()}/year)`}
                  {billingCycle === 'monthly' && 'Billed monthly'}
                </p>
                {selectedCurrency !== 'USD' && (
                  <p className="text-gray-500 text-sm mt-1">
                    ≈ ${CURRENCIES.USD.price} USD/month
                  </p>
                )}
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full btn-ai mb-8"
              >
                <Zap className="w-5 h-5" />
                <span>Upgrade to Pro</span>
              </button>

              <div className="space-y-4">
                <Feature text="Unlimited searches" highlight />
                <Feature text="Unlimited boilerplates" highlight />
                <Feature text="Unlimited collections" highlight />
                <Feature text="Code Converter (Unlimited)" highlight />
                <Feature text="Learning Paths (Unlimited)" highlight />
                <Feature text="Repo Q&A (Chat with repos)" highlight />
                <Feature text="Live Preview (StackBlitz)" highlight />
                <Feature text="One-Click Deploy (Vercel)" highlight />
                <Feature text="Unlimited dependency scans" highlight />
                <Feature text="Unlimited setup guides" highlight />
                <Feature text="30-day history" highlight />
                <Feature text="Priority AI processing" highlight />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center gradient-text-primary mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <FAQItem
                question="Can I cancel anytime?"
                answer="Yes! You can cancel your subscription at any time. You'll continue to have Pro access until the end of your billing period."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards (Visa, Mastercard, American Express) through Stripe, our secure payment processor."
              />
              <FAQItem
                question="Do you offer refunds?"
                answer="Yes, we offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund."
              />
              <FAQItem
                question="Can I upgrade from Free to Pro anytime?"
                answer="Absolutely! You can upgrade to Pro at any time and start enjoying premium features immediately."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Feature({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        highlight ? 'gradient-primary' : 'bg-white/10'
      }`}>
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className={highlight ? 'text-white font-medium' : 'text-gray-300'}>
        {text}
      </span>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-white">{question}</h3>
        <span className="text-cyan-400 text-2xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <p className="mt-4 text-gray-300 leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}
