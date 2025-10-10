import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, GitFork, Eye, AlertCircle, Code2, Calendar, Sparkles, ExternalLink, Copy, ArrowLeft, Folder, File, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

// File tree node component
function FileTreeNode({ node, level = 0 }: { node: any; level?: number }) {
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
    const isFolder = node.type === 'tree';
    const hasChildren = node.children && node.children.length > 0;

    const getFileIcon = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        const colors: Record<string, string> = {
            js: 'text-yellow-400',
            jsx: 'text-yellow-400',
            ts: 'text-blue-400',
            tsx: 'text-blue-400',
            json: 'text-green-400',
            md: 'text-gray-400',
            css: 'text-pink-400',
            html: 'text-orange-400',
            py: 'text-blue-300',
            java: 'text-red-400',
            go: 'text-cyan-400',
        };
        return colors[ext || ''] || 'text-gray-400';
    };

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={() => isFolder && setIsOpen(!isOpen)}
            >
                {isFolder ? (
                    <>
                        {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        {isOpen ? (
                            <FolderOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        ) : (
                            <Folder className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        )}
                    </>
                ) : (
                    <>
                        <div className="w-4" />
                        <File className={`w-4 h-4 flex-shrink-0 ${getFileIcon(node.path)}`} />
                    </>
                )}
                <span className="text-sm text-gray-300 truncate">{node.name}</span>
            </div>
            {isFolder && isOpen && hasChildren && (
                <div>
                    {node.children.map((child: any, idx: number) => (
                        <FileTreeNode key={idx} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RepoDetails() {
    const router = useRouter();
    const { owner, repo } = router.query;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);
    const [boilerplate, setBoilerplate] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [fileTree, setFileTree] = useState<any>(null);
    const [showFileTree, setShowFileTree] = useState(false);

    useEffect(() => {
        if (owner && repo) {
            fetchRepoDetails();
        }
    }, [owner, repo]);

    const fetchRepoDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`/api/repo-details?owner=${owner}&repo=${repo}`);
            setData(res.data);
            
            // Process file tree into hierarchical structure
            if (res.data.fileTree) {
                const tree = buildFileTree(res.data.fileTree);
                setFileTree(tree);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load repository');
        } finally {
            setLoading(false);
        }
    };

    // Build hierarchical file tree from flat array
    const buildFileTree = (files: any[]) => {
        const root: any = { name: 'root', type: 'tree', children: [] };
        
        files.forEach((file: any) => {
            const parts = file.path.split('/');
            let current = root;
            
            parts.forEach((part: string, idx: number) => {
                const isLast = idx === parts.length - 1;
                let child = current.children?.find((c: any) => c.name === part);
                
                if (!child) {
                    child = {
                        name: part,
                        path: file.path,
                        type: isLast ? file.type : 'tree',
                        children: isLast && file.type === 'blob' ? undefined : [],
                    };
                    if (!current.children) current.children = [];
                    current.children.push(child);
                }
                
                current = child;
            });
        });
        
        return root.children || [];
    };

    const generateAISummary = async () => {
        if (!data?.readme) {
            alert('No README available to summarize');
            return;
        }
        setLoadingSummary(true);
        try {
            const res = await axios.post('/api/generate', {
                query: `Summarize this GitHub repository README in 3-4 lines for a developer:\n\n${data.readme.slice(0, 2000)}`,
            });
            setAiSummary(res.data.boilerplate);
        } catch (error) {
            setAiSummary('Failed to generate summary');
        } finally {
            setLoadingSummary(false);
        }
    };

    const generateBoilerplate = async () => {
        setGenerating(true);
        setBoilerplate('Generating boilerplate...');
        try {
            const res = await axios.post('/api/generate', {
                query: `${data.repository.name} - ${data.repository.description}`,
            });
            setBoilerplate(res.data.boilerplate);
        } catch (error) {
            setBoilerplate('Failed to generate boilerplate');
        } finally {
            setGenerating(false);
        }
    };

    const copyCloneCommand = () => {
        navigator.clipboard.writeText(`git clone ${data.repository.html_url}.git`);
        alert('Clone command copied!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading repository details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <div className="text-white text-xl mb-4">{error}</div>
                    <Link href="/" className="text-purple-400 hover:text-purple-300">
                        ← Back to search
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { repository, readme } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to search
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">{repository.name}</h1>
                            <p className="text-gray-400 text-lg mb-4">{repository.owner.login}</p>
                            {repository.description && (
                                <p className="text-gray-300 text-lg mb-4">{repository.description}</p>
                            )}
                        </div>
                        <a
                            href={repository.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ExternalLink className="w-5 h-5" />
                            View on GitHub
                        </a>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-yellow-400 mb-1">
                            <Star className="w-5 h-5" />
                            <span className="text-sm">Stars</span>
                        </div>
                        <div className="text-2xl font-bold">{repository.stargazers_count.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <GitFork className="w-5 h-5" />
                            <span className="text-sm">Forks</span>
                        </div>
                        <div className="text-2xl font-bold">{repository.forks_count.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                            <Eye className="w-5 h-5" />
                            <span className="text-sm">Watchers</span>
                        </div>
                        <div className="text-2xl font-bold">{repository.watchers_count.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-red-400 mb-1">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">Issues</span>
                        </div>
                        <div className="text-2xl font-bold">{repository.open_issues_count.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                            <Code2 className="w-5 h-5" />
                            <span className="text-sm">Language</span>
                        </div>
                        <div className="text-lg font-bold">{repository.language || 'N/A'}</div>
                    </div>
                </div>

                {/* Topics */}
                {repository.topics && repository.topics.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">Topics</h2>
                        <div className="flex flex-wrap gap-2">
                            {repository.topics.map((topic: string) => (
                                <span
                                    key={topic}
                                    className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm border border-purple-500/30"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Summary Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold">AI Summary</h2>
                        <button
                            onClick={generateAISummary}
                            disabled={loadingSummary || !readme}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 disabled:bg-gray-600/30 rounded-lg transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            {loadingSummary ? 'Generating...' : 'Generate Summary'}
                        </button>
                    </div>
                    {aiSummary && (
                        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                            <p className="text-gray-200">{aiSummary}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={copyCloneCommand}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <Copy className="w-5 h-5" />
                        Copy Clone Command
                    </button>
                    <button
                        onClick={generateBoilerplate}
                        disabled={generating}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors"
                    >
                        <Sparkles className="w-5 h-5" />
                        {generating ? 'Generating...' : 'Generate Boilerplate'}
                    </button>
                </div>

                {/* Boilerplate Output */}
                {boilerplate && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">Generated Boilerplate</h2>
                        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto">
                                {boilerplate}
                            </pre>
                        </div>
                    </div>
                )}

                {/* File Structure */}
                {fileTree && fileTree.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Folder className="w-5 h-5 text-purple-400" />
                                    File Structure
                                </h2>
                                {data.fileTree && (
                                    <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                                        {data.fileTree.length} files
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowFileTree(!showFileTree)}
                                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                {showFileTree ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {showFileTree && (
                            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 max-h-[500px] overflow-auto">
                                <div className="font-mono text-sm">
                                    {fileTree.map((node: any, idx: number) => (
                                        <FileTreeNode key={idx} node={node} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* README */}
                {readme && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">README</h2>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                            <div className="markdown-content">
                                <ReactMarkdown>{readme}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Created</span>
                        </div>
                        <div className="text-white">{new Date(repository.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Last Updated</span>
                        </div>
                        <div className="text-white">{new Date(repository.updated_at).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="text-gray-400 text-sm mb-2">License</div>
                        <div className="text-white">{repository.license?.name || 'No license'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}