import React, { useState, useEffect } from 'react';
import { Terminal, Download, Copy, CheckCircle, AlertCircle, Laptop, Monitor, Apple } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

type Props = {
  owner: string;
  repo: string;
  readme?: string;
};

type OS = 'Windows' | 'macOS' | 'Linux';

export default function SetupGuide({ owner, repo, readme }: Props) {
  const [loading, setLoading] = useState(false);
  const [setupGuide, setSetupGuide] = useState('');
  const [error, setError] = useState('');
  const [selectedOS, setSelectedOS] = useState<OS>('Windows');
  const [language, setLanguage] = useState('');
  const [framework, setFramework] = useState('');
  const [copied, setCopied] = useState(false);

  // Detect user's OS
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setSelectedOS('macOS');
    } else if (userAgent.includes('linux')) {
      setSelectedOS('Linux');
    } else {
      setSelectedOS('Windows');
    }
  }, []);

  const generateGuide = async () => {
    setLoading(true);
    setError('');
    setSetupGuide('');

    try {
      const res = await axios.post('/api/generate-setup-guide', {
        owner,
        repo,
        os: selectedOS,
        readme: readme || '',
      });

      setSetupGuide(res.data.setupGuide);
      setLanguage(res.data.language);
      setFramework(res.data.framework);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate setup guide');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupGuide);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOSIcon = (os: OS) => {
    switch (os) {
      case 'Windows':
        return <Monitor className="w-5 h-5" />;
      case 'macOS':
        return <Apple className="w-5 h-5" />;
      case 'Linux':
        return <Laptop className="w-5 h-5" />;
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text-primary">Setup Guide</h2>
            <p className="text-gray-400 text-sm">AI-generated step-by-step instructions</p>
          </div>
        </div>
      </div>

      {/* OS Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Your Operating System
        </label>
        <div className="flex gap-3">
          {(['Windows', 'macOS', 'Linux'] as OS[]).map((os) => (
            <button
              key={os}
              onClick={() => setSelectedOS(os)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                selectedOS === os
                  ? 'glass-strong border border-cyan-500/50 text-white'
                  : 'glass-light border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/30'
              }`}
            >
              {getOSIcon(os)}
              <span>{os}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      {!setupGuide && (
        <button
          onClick={generateGuide}
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 mb-4"
        >
          <Terminal className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
          <span>{loading ? 'Generating Guide...' : 'Generate Setup Guide'}</span>
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="glass-light border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-gray-400">Analyzing repository and generating personalized setup guide...</p>
          <p className="text-sm text-gray-500 mt-2">This may take 10-20 seconds</p>
        </div>
      )}

      {/* Setup Guide Content */}
      {setupGuide && !loading && (
        <div className="space-y-4">
          {/* Info Bar */}
          <div className="flex items-center justify-between glass-light rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getOSIcon(selectedOS)}
                <span className="text-sm font-medium text-gray-300">{selectedOS}</span>
              </div>
              {language && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-sm text-gray-400">{language}</span>
                </div>
              )}
              {framework && framework !== 'Unknown' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-sm text-gray-400">{framework}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="btn-secondary text-sm"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={generateGuide}
                className="btn-secondary text-sm"
                title="Regenerate"
              >
                <Terminal className="w-4 h-4" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Guide Content */}
          <div className="glass-light rounded-lg p-6 border border-white/10">
            <div className="prose prose-invert prose-cyan max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold gradient-text-primary mb-4" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold text-white mt-6 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-gray-300 mb-3 leading-relaxed" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="bg-black/40 text-cyan-400 px-2 py-0.5 rounded text-sm font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-black/60 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-white/10"
                        {...props}
                      />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className="bg-black/60 rounded-lg overflow-x-auto mb-4" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-gray-300 ml-4" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="text-white font-semibold" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-cyan-500 pl-4 italic text-gray-400 my-4"
                      {...props}
                    />
                  ),
                }}
              >
                {setupGuide}
              </ReactMarkdown>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-light rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Clone Command</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/60 text-cyan-400 px-4 py-2 rounded font-mono text-sm">
                git clone https://github.com/{owner}/{repo}.git
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`git clone https://github.com/${owner}/${repo}.git`);
                  alert('Clone command copied!');
                }}
                className="p-2 glass hover:glass-strong rounded transition-colors"
                title="Copy clone command"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!setupGuide && !loading && !error && (
        <div className="text-center py-12">
          <Terminal className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
          <p className="text-gray-400 mb-2">Get personalized setup instructions</p>
          <p className="text-sm text-gray-500">
            AI will generate step-by-step guide based on your OS and the repository
          </p>
        </div>
      )}
    </div>
  );
}
