import { Crown, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Feature, FEATURE_CONFIG } from '../utils/featureGates';

interface UpgradePromptProps {
  feature: Feature;
  onClose?: () => void;
  inline?: boolean;
}

export default function UpgradePrompt({ feature, onClose, inline = false }: UpgradePromptProps) {
  const config = FEATURE_CONFIG[feature];

  if (inline) {
    return (
      <div className="glass-strong border border-purple-500/30 rounded-xl p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Unlock {config.name}
        </h3>
        <p className="text-gray-300 mb-4">
          {config.description}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-purple-300 mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Available with Pro subscription</span>
        </div>
        <Link 
          href="/pricing"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade to Pro</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-strong border border-purple-500/30 rounded-xl p-8 max-w-md w-full relative animate-scale-up">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Upgrade to Pro
          </h2>
          
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-purple-300">{config.name}</span> is a premium feature
          </p>
          
          <p className="text-gray-400 text-sm mb-6">
            {config.description}
          </p>
          
          <div className="glass border border-purple-500/20 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Pro Features Include:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Code Converter</li>
                  <li>• Learning Path Generator</li>
                  <li>• Repository Q&A</li>
                  <li>• Live Preview</li>
                  <li>• One-Click Deploy</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            )}
            <Link 
              href="/pricing"
              className="flex-1 btn-primary inline-flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>View Plans</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
