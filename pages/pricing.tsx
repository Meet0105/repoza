import { useState } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Script from 'next/script';

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session) {
      signIn();
      return;
    }

    setLoading(true);
    try {
      // Create subscription on backend
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!data.subscriptionId) {
        alert('Failed to create subscription');
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'Repoza',
        description: `Repoza Pro - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        image: '/logo.png', // Add your logo
        handler: async function (response: any) {
          // Payment successful, verify on backend
          try {
            const verifyResponse = await fetch('/api/subscription/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Redirect to success page
              router.push('/subscription/success');
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          email: session.user?.email || '',
          name: session.user?.name || '',
        },
        theme: {
          color: '#06b6d4', // Cyan color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const monthlyPrice = 799;
  const yearlyPrice = 7999;
  const yearlyMonthlyPrice = Math.round(yearlyPrice / 12);

  return (
    <>
      {/* Load Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
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
                <div className="text-4xl font-bold text-white mb-2">₹0</div>
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
                  ₹{billingCycle === 'monthly' ? monthlyPrice : yearlyMonthlyPrice}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">
                  {billingCycle === 'yearly' && `Billed yearly (₹${yearlyPrice.toLocaleString()}/year)`}
                  {billingCycle === 'monthly' && 'Billed monthly'}
                </p>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full btn-ai mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Upgrade to Pro</span>
                  </>
                )}
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

          {/* Payment Methods */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Secure payments powered by Razorpay</p>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="text-gray-500">💳 Cards</span>
              <span className="text-gray-500">📱 UPI</span>
              <span className="text-gray-500">🏦 Net Banking</span>
              <span className="text-gray-500">👛 Wallets</span>
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
                answer="Yes! You can cancel your subscription at any time from your subscription page. You'll continue to have Pro access until the end of your billing period."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept all major payment methods through Razorpay including Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Wallets."
              />
              <FAQItem
                question="Do you offer refunds?"
                answer="Yes, we offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund."
              />
              <FAQItem
                question="Can I upgrade from Free to Pro anytime?"
                answer="Absolutely! You can upgrade to Pro at any time and start enjoying premium features immediately."
              />
              <FAQItem
                question="Is my payment information secure?"
                answer="Yes! All payments are processed securely through Razorpay, which is PCI DSS compliant. We never store your card details."
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
