import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Github, Chrome, Code2 } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const { callbackUrl } = router.query;

  const handleSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: (callbackUrl as string) || '/' });
  };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full animate-slide-up">
                {/* Logo & Title */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg animate-pulse-glow">
                            <Code2 className="w-9 h-9 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold gradient-text-primary">Repoza</h1>
                    </div>
                    <p className="text-gray-300 text-xl">Sign in to continue</p>
                </div>

                {/* Sign In Card */}
                <div className="glass rounded-2xl p-10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Choose your provider
                    </h2>

                    {/* Google Sign In */}
                    <button
                        onClick={() => handleSignIn('google')}
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 mb-4 transition-all duration-300 hover-lift shadow-lg"
                    >
                        <Chrome className="w-6 h-6" />
                        <span>Continue with Google</span>
                    </button>

                    {/* GitHub Sign In */}
                    <button
                        onClick={() => handleSignIn('github')}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover-lift shadow-lg"
                    >
                        <Github className="w-6 h-6" />
                        <span>Continue with GitHub</span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-6 py-2 glass-light rounded-full text-gray-300 font-medium">
                                Secure authentication
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <p className="text-center text-sm text-gray-400 leading-relaxed">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => router.push('/')}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
