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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Repoza</h1>
          </div>
          <p className="text-gray-300 text-lg">Sign in to continue</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Choose your provider
          </h2>

          {/* Google Sign In */}
          <button
            onClick={() => handleSignIn('google')}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 mb-4 transition-colors"
          >
            <Chrome className="w-6 h-6" />
            Continue with Google
          </button>

          {/* GitHub Sign In */}
          <button
            onClick={() => handleSignIn('github')}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
          >
            <Github className="w-6 h-6" />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-400">
                Secure authentication
              </span>
            </div>
          </div>

          {/* Info */}
          <p className="text-center text-sm text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
