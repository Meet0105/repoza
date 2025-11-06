import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Crown, Loader2, ExternalLink, CreditCard, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

export default function SubscriptionPage() {
    return (
        <ProtectedRoute>
            <SubscriptionContent />
        </ProtectedRoute>
    );
}

function SubscriptionContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            const response = await fetch('/api/subscription/status');
            const data = await response.json();
            setSubscriptionData(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/subscription/portal');
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error: any) {
            console.error('Error opening portal:', error);
            alert(error.response?.data?.error || 'Failed to open subscription portal');
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-20">
                <Navbar />
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                </div>
            </div>
        );
    }

    const isPro = subscriptionData?.isPro || false;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold gradient-text-primary mb-2">
                            Subscription Management
                        </h1>
                        <p className="text-gray-300">
                            Manage your subscription, billing, and payment methods
                        </p>
                    </div>

                    {/* Subscription Status Card */}
                    <div className="glass-strong rounded-2xl p-8 border border-white/10 mb-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {isPro ? 'Pro Plan' : 'Free Plan'}
                                </h2>
                                <p className="text-gray-400">
                                    {isPro
                                        ? 'You have access to all premium features'
                                        : 'Upgrade to unlock all premium features'
                                    }
                                </p>
                            </div>
                            {isPro && (
                                <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50">
                                    <span className="text-green-400 font-semibold">Active</span>
                                </div>
                            )}
                        </div>

                        {isPro ? (
                            <>
                                {/* Pro Features */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="glass rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CreditCard className="w-5 h-5 text-cyan-400" />
                                            <span className="font-semibold text-white">Billing</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            Manage payment methods and billing details
                                        </p>
                                    </div>

                                    <div className="glass rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="w-5 h-5 text-purple-400" />
                                            <span className="font-semibold text-white">Invoices</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            View and download past invoices
                                        </p>
                                    </div>

                                    <div className="glass rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                            <span className="font-semibold text-white">Plans</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            Switch between monthly and yearly billing
                                        </p>
                                    </div>

                                    <div className="glass rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ExternalLink className="w-5 h-5 text-pink-400" />
                                            <span className="font-semibold text-white">Cancel</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            Cancel your subscription anytime
                                        </p>
                                    </div>
                                </div>

                                {/* Manage Button */}
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={loading}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Opening Portal...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="w-5 h-5" />
                                            <span>Open Billing Portal</span>
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-gray-400 text-sm mt-4">
                                    You'll be redirected to Stripe's secure billing portal
                                </p>
                            </>
                        ) : (
                            <>
                                {/* Free Plan - Upgrade CTA */}
                                <div className="text-center py-8">
                                    <p className="text-gray-300 mb-6">
                                        Upgrade to Pro to unlock all premium features
                                    </p>
                                    <button
                                        onClick={() => router.push('/pricing')}
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        <Crown className="w-5 h-5" />
                                        <span>View Pro Plans</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pro Features List */}
                    {isPro && (
                        <div className="glass-strong rounded-2xl p-8 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4">Your Pro Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    'Unlimited Code Conversions',
                                    'AI-Powered Learning Paths',
                                    'Repository Q&A',
                                    'Live Preview in StackBlitz',
                                    'One-Click Deploy to Vercel',
                                    'Priority Support',
                                    'No Usage Limits',
                                    'Advanced Analytics'
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="text-center mt-8">
                        <button
                            onClick={() => router.push('/pricing')}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Pricing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
