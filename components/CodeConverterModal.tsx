import { useState } from 'react';
import { X, Zap, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface CodeConverterModalProps {
  owner: string;
  repo: string;
  onClose: () => void;
}

export default function CodeConverterModal({ owner, repo, onClose }: CodeConverterModalProps) {
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [targetFramework, setTargetFramework] = useState('');
  const [scope, setScope] = useState<'full' | 'selected'>('full');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(false);

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-xl font-semibold text-white">AI Code Converter</h3>
              <p className="text-sm text-gray-400">
                Transform {owner}/{repo} to another language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <strong>AI-Powered Conversion:</strong> The converted code may require manual
              adjustments. Always review and test before production use.
            </div>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Target Language & Framework
            </label>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setTargetLanguage(lang.id);
                    setTargetFramework(lang.framework);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    targetLanguage === lang.id
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{lang.icon}</span>
                    <span className="font-semibold text-white">{lang.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">{lang.framework}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Conversion Scope</label>
            <div className="flex gap-3">
              <button
                onClick={() => setScope('full')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  scope === 'full'
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="font-semibold text-white mb-1">Full Repository</div>
                <div className="text-xs text-gray-400">Convert all code files (max 50)</div>
              </button>
              <button
                onClick={() => setScope('selected')}
                disabled
                className="flex-1 p-4 rounded-lg border-2 border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
              >
                <div className="font-semibold text-white mb-1">Selected Files</div>
                <div className="text-xs text-gray-400">Coming soon</div>
              </button>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {converting && !success && (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                )}
                {success && <CheckCircle className="w-5 h-5 text-green-400" />}
                <span className="text-white">{progress}</span>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-400 space-y-2">
            <p>✨ What will be converted:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All code files (.ts, .tsx, .js, .jsx, etc.)</li>
              <li>Dependencies (package.json → requirements.txt, etc.)</li>
              <li>File structure and organization</li>
              <li>Comments and documentation</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={converting}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            {converting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Convert & Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
