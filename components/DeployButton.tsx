import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Rocket, Loader2, ExternalLink, Github, Crown } from 'lucide-react';
import axios from 'axios';
import { useFeatureAccess } from '../utils/useFeatureAccess';
import UpgradePrompt from './UpgradePrompt';

interface DeployButtonProps {
  type: 'boilerplate' | 'existing';
  repoUrl?: string;
  boilerplateData?: {
    name: string;
    description: string;
    files: Record<string, string>;
    framework: string;
  };
  onSuccess?: (data: any) => void;
}

export default function DeployButton({
  type,
  repoUrl,
  boilerplateData,
  onSuccess,
}: DeployButtonProps) {
  const { data: session } = useSession();
  const { hasAccess, loading: checkingAccess } = useFeatureAccess('one-click-deploy');
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const handleDeploy = async () => {
    if (!session) {
      alert('Please sign in to deploy');
      return;
    }

    // Check feature access
    if (!hasAccess) {
      setShowUpgradePrompt(true);
      return;
    }

    setDeploying(true);
    setError('');

    try {
      if (type === 'boilerplate' && boilerplateData) {
        // Deploy generated boilerplate
        const res = await axios.post('/api/deploy-boilerplate', {
          repoName: boilerplateData.name,
          description: boilerplateData.description,
          files: boilerplateData.files,
          framework: boilerplateData.framework,
        });

        if (res.data.success) {
          // Redirect to Vercel
          window.open(res.data.vercelDeployUrl, '_blank');
          onSuccess?.(res.data);
        }
      } else if (type === 'existing' && repoUrl) {
        // Deploy existing repo
        const res = await axios.post('/api/deploy-repo', {
          repoUrl,
          framework: 'nextjs', // Can be made dynamic
        });

        if (res.data.success) {
          // Redirect to Vercel
          window.open(res.data.vercelDeployUrl, '_blank');
          onSuccess?.(res.data);
        }
      }
    } catch (err: any) {
      console.error('Deploy error:', err);
      setError(err.response?.data?.error || 'Failed to deploy');
      alert(err.response?.data?.error || 'Failed to deploy. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <>
      {showUpgradePrompt && (
        <UpgradePrompt feature="one-click-deploy" onClose={() => setShowUpgradePrompt(false)} />
      )}
      
      <div>
        <button
          onClick={handleDeploy}
          disabled={deploying || !session || checkingAccess}
          className={`w-full px-6 py-3 ${
            !hasAccess && session
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              : 'bg-black hover:bg-gray-900'
          } disabled:bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors border border-white/20`}
          title={!session ? 'Sign in to deploy' : !hasAccess ? 'Pro feature' : 'Deploy to Vercel'}
        >
          {deploying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {type === 'boilerplate' ? 'Creating repo & deploying...' : 'Preparing deployment...'}
            </>
          ) : !hasAccess && session ? (
            <>
              <Crown className="w-5 h-5" />
              Upgrade to Deploy
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Deploy to Vercel
            </>
          )}
        </button>

        {!session && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Sign in with GitHub to deploy
          </p>
        )}

        {!hasAccess && session && (
          <p className="text-xs text-purple-300 mt-2 text-center">
            <Crown className="w-3 h-3 inline mr-1" />
            Pro feature - Upgrade to unlock
          </p>
        )}

        {type === 'boilerplate' && session && hasAccess && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            <Github className="w-3 h-3 inline mr-1" />
            Will create a new GitHub repo in your account
          </p>
        )}

        {error && (
          <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
        )}
      </div>
    </>
  );
}
