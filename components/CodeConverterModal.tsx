import { useState } from 'react';
import { X, Zap, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useFeatureAccess } from '../utils/useFeatureAccess';
import UpgradePrompt from './UpgradePrompt';

interface CodeConverterModalProps {
  owner: string;
  repo: string;
  onClose: () => void;
}

export default function CodeConverterModal({ owner, repo, onClose }: CodeConverterModalProps) {
  const { hasAccess, loading: checkingAccess } = useFeatureAccess('code-converter');
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [targetFramework, setTargetFramework] = useState('');
  const [scope, setScope] = useState<'full' | 'selected'>('full');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(false);

  // Show upgrade prompt if no access
  if (!checkingAccess && !hasAccess) {
    return <UpgradePrompt feature="code-converter" onClose={onClose} />;
  }

  const languages = [
    { id: 'python', name: 'Python', framework: 'Django/Flask', icon: '🐍' },
    { id: 'java', name: 'Java', framework: 'Spring Boot', icon: '☕' },
    { id: 'csharp', name: 'C#', framework: 'ASP.NET', icon: '🔷' },
    { id: 'go', name: 'Go', framework: 'Gin/Echo', icon: '🔵' },
    { id: 'rust', name: 'Rust', framework: 'Actix/Rocket', icon: '🦀' },
    { id: 'php', name: 'PHP', framework: 'Laravel', icon: '🐘' },
    { id: 'ruby', name: 'Ruby', framework: 'Rails', icon: '💎' },
    { id: 'typescript', name: 'TypeScript', framework: 'Node.js/Express', icon: '📘' },
  ];

  const handleConvert = async () => {
    setConverting(true);
    setProgress('🔍 Analyzing repository...');
    setSuccess(false);

    try {
      setTimeout(() => setProgress('📥 Fetching code files...'), 1000);
      setTimeout(() => setProgress('🤖 Converting with AI...'), 3000);
      setTimeout(() => setProgress('📦 Packaging converted code...'), 8000);

      const res = await axios.post(
        '/api/convert-code',
        {
          owner,
          repo,
          targetLanguage,
          targetFramework,
          scope,
        },
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const fileName = `${repo}-${targetLanguage}.zip`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setProgress('✅ Conversion complete! Download started.');
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Conversion failed:', error);
      setProgress('❌ Conversion failed. Please try again.');
    } finally {
      setTimeout(() => {
        setConverting(false);
        setProgress('');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-strong rounded-2xl border border-white/20 w-full max-w-3xl shadow-2xl animate-slide-up">
        {/* Header with AI Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-ai opacity-20"></div>
          <div className="relative flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-ai flex items-center justify-center shadow-lg animate-pulse-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text-ai">AI Code Converter</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Transform <span className="text-cyan-400 font-semibold">{owner}/{repo}</span> to another language
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 glass-light hover:glass rounded-lg transition-all duration-300 text-gray-400 hover:text-white hover-lift"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Warning */}
        <div className="glass-light border border-orange-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-200">
            <strong className="text-orange-300">AI-Powered Conversion:</strong> The converted code may require manual
            adjustments. Always review and test before production use.
          </div>
        </div>

        {/* Target Language */}
        <div>
          <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="gradient-text-ai">Target Language & Framework</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  setTargetLanguage(lang.id);
                  setTargetFramework(lang.framework);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover-lift ${targetLanguage === lang.id
                  ? 'border-purple-500 glass-strong shadow-lg shadow-purple-500/20'
                  : 'glass-light border-white/10 hover:border-purple-500/50'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{lang.icon}</span>
                  <span className="font-semibold text-white text-lg">{lang.name}</span>
                </div>
                <div className="text-xs text-gray-400">{lang.framework}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-semibold text-white mb-4">Conversion Scope</label>
          <div className="flex gap-3">
            <button
              onClick={() => setScope('full')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 hover-lift ${scope === 'full'
                ? 'border-purple-500 glass-strong shadow-lg shadow-purple-500/20'
                : 'glass-light border-white/10 hover:border-purple-500/50'
                }`}
            >
              <div className="font-semibold text-white mb-1">Full Repository</div>
              <div className="text-xs text-gray-400">Convert all code files (max 50)</div>
            </button>
            <button
              onClick={() => setScope('selected')}
              disabled
              className="flex-1 p-4 rounded-xl border-2 glass-light border-white/10 opacity-50 cursor-not-allowed"
            >
              <div className="font-semibold text-white mb-1">Selected Files</div>
              <div className="text-xs text-gray-400">Coming soon</div>
            </button>
          </div>
        </div>

        {/* Progress */}
        {progress && (
          <div className="glass-strong border border-purple-500/30 rounded-xl p-4 animate-slide-up">
            <div className="flex items-center gap-3">
              {converting && !success && (
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              )}
              {success && <CheckCircle className="w-5 h-5 text-green-400" />}
              <span className="text-white font-medium">{progress}</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="glass-light rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            What will be converted:
          </p>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>All code files (.ts, .tsx, .js, .jsx, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Dependencies (package.json → requirements.txt, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>File structure and organization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Comments and documentation</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/10 to-pink-900/10">
        <button
          onClick={onClose}
          className="btn-ghost"
        >
          Cancel
        </button>
        <button
          onClick={handleConvert}
          disabled={converting}
          className="btn-ai disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {converting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Converting...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Convert & Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
