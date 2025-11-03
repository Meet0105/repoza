import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Give webhook time to process
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6">
              <svg className="animate-spin text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-white text-xl font-semibold">Processing your subscription...</div>
            <div className="text-gray-400 mt-2">This will take just a moment</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Repoza Pro! 🎉
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your subscription is now active. Enjoy unlimited access to all premium features!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                What's Unlocked
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Unlimited Search & Boilerplate Generation
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Code Converter (All Languages)
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  AI Learning Paths
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Repo Q&A (Chat with Repositories)
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Live Preview & One-Click Deploy
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Unlimited Collections & 30-day History
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Priority AI Processing
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
              <div className="space-y-4">
                <Link href="/" className="block p-4 glass-light rounded-lg hover:glass transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyan-400">Start Searching</h3>
                      <p className="text-sm text-gray-400">Discover repositories with unlimited searches</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
                  </div>
                </Link>

                <Link href="/learn" className="block p-4 glass-light rounded-lg hover:glass transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyan-400">Create Learning Path</h3>
                      <p className="text-sm text-gray-400">Generate AI-powered learning journeys</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
                  </div>
                </Link>

                <Link href="/generator" className="block p-4 glass-light rounded-lg hover:glass transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyan-400">Generate Boilerplate</h3>
                      <p className="text-sm text-gray-400">Create unlimited project templates</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <span>Start Exploring</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
