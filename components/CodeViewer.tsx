import { useState, useEffect } from 'react';
import { X, Copy, Check, Download, ExternalLink, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

interface CodeViewerProps {
    owner: string;
    repo: string;
    filePath: string;
    onClose: () => void;
}

export default function CodeViewer({ owner, repo, filePath, onClose }: CodeViewerProps) {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const [explanation, setExplanation] = useState<any>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        const fetchFileContent = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(
                    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
                    {
                        headers: {
                            Accept: 'application/vnd.github.v3+json',
                        },
                    }
                );

                if (res.data.content) {
                    // Decode base64 content
                    const decoded = atob(res.data.content);
                    setContent(decoded);
                } else {
                    setError('File content not available');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load file');
            } finally {
                setLoading(false);
            }
        };

        fetchFileContent();
    }, [owner, repo, filePath]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop() || 'file.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const getLanguage = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        const languages: Record<string, string> = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            py: 'python',
            java: 'java',
            go: 'go',
            rs: 'rust',
            cpp: 'cpp',
            c: 'c',
            css: 'css',
            html: 'html',
            json: 'json',
            md: 'markdown',
            yml: 'yaml',
            yaml: 'yaml',
        };
        return languages[ext || ''] || 'text';
    };

    const handleExplainCode = async () => {
        if (!content) return;

        setExplaining(true);
        setShowExplanation(true);
        try {
            const res = await axios.post('/api/explain-code', {
                owner,
                repo,
                filePath,
                code: content,
                fileName: filePath.split('/').pop(),
                language: getLanguage(filePath),
            });

            setExplanation(res.data.explanation);
        } catch (err: any) {
            setExplanation({
                overview: 'Failed to generate explanation. Please try again.',
                keyFeatures: [],
                complexity: 'Unknown',
                howToUse: '',
                dependencies: [],
            });
        } finally {
            setExplaining(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white truncate">{filePath}</h3>
                        <p className="text-sm text-gray-400">
                            {owner}/{repo}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExplainCode}
                            disabled={explaining || !content}
                            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded transition-all flex items-center gap-2 text-sm font-medium"
                            title="Explain this code with AI"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>{explaining ? 'Explaining...' : 'Explain Code'}</span>
                        </button>
                        <div className="w-px h-6 bg-white/10"></div>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="Copy code"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="Download file"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <a
                            href={`https://github.com/${owner}/${repo}/blob/main/${filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="View on GitHub"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* AI Explanation Section */}
                {showExplanation && (
                    <div className="border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <span className="font-semibold text-white">AI Code Explanation</span>
                            </div>
                            {showExplanation ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {showExplanation && (
                            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                                {explaining ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-3"></div>
                                        <p className="text-gray-400">Analyzing code with AI...</p>
                                    </div>
                                ) : explanation ? (
                                    <>
                                        {/* Overview */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-purple-400 mb-2">📝 Overview</h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">{explanation.overview}</p>
                                        </div>

                                        {/* Key Features */}
                                        {explanation.keyFeatures && explanation.keyFeatures.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-purple-400 mb-2">✨ Key Features</h4>
                                                <ul className="space-y-1">
                                                    {explanation.keyFeatures.map((feature: string, idx: number) => (
                                                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                                            <span className="text-purple-400 mt-1">•</span>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Complexity */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-purple-400 mb-2">📊 Complexity</h4>
                                            <p className="text-gray-300 text-sm">{explanation.complexity}</p>
                                        </div>

                                        {/* How to Use */}
                                        {explanation.howToUse && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-purple-400 mb-2">🚀 How to Use</h4>
                                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{explanation.howToUse}</p>
                                            </div>
                                        )}

                                        {/* Dependencies */}
                                        {explanation.dependencies && explanation.dependencies.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-purple-400 mb-2">📦 Dependencies</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {explanation.dependencies.map((dep: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs border border-purple-500/30"
                                                        >
                                                            {dep}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {loading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-400">Loading file...</div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-red-400">{error}</div>
                        </div>
                    )}

                    {!loading && !error && content && (
                        <pre className="text-sm text-gray-300 font-mono bg-black/30 p-4 rounded overflow-x-auto">
                            <code className={`language-${getLanguage(filePath)}`}>{content}</code>
                        </pre>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        {content.split('\n').length} lines • {content.length} characters
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
