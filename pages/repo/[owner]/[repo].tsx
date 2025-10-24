import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, GitFork, Eye, AlertCircle, Code2, Calendar, Sparkles, ExternalLink, Copy, ArrowLeft, Folder, File, ChevronRight, ChevronDown, FolderOpen, Zap, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { saveRepoHistory } from '../../../utils/history';
import RepoQA from '../../../components/RepoQA';
import DeployButton from '../../../components/DeployButton';
import CodeViewer from '../../../components/CodeViewer';
import CodeConverterModal from '../../../components/CodeConverterModal';
import LivePreviewButton from '../../../components/LivePreviewButton';
import LivePreviewModal from '../../../components/LivePreviewModal';
import AddToCollectionModal from '../../../components/AddToCollectionModal';
import { useSession } from 'next-auth/react';

// File tree node component
function FileTreeNode({ node, level = 0, onFileClick }: { node: any; level?: number; onFileClick?: (path: string) => void }) {
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

    const handleClick = () => {
        if (isFolder) {
            setIsOpen(!isOpen);
        } else if (onFileClick) {
            onFileClick(node.path);
        }
    };

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors ${!isFolder ? 'hover:bg-purple-900/20' : ''}`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={handleClick}
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
                        <FileTreeNode key={idx} node={child} level={level + 1} onFileClick={onFileClick} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RepoDetails() {
    const router = useRouter();
    const { owner, repo } = router.query;
    const { data: session } = useSession();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);
    const [boilerplate, setBoilerplate] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [fileTree, setFileTree] = useState<any>(null);
    const [showFileTree, setShowFileTree] = useState(false);
    const [isIndexed, setIsIndexed] = useState(false);
    const [indexing, setIndexing] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [showConverter, setShowConverter] = useState(false);
    const [showLivePreview, setShowLivePreview] = useState(false);

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

            // Save to history
            if (res.data.repository) {
                saveRepoHistory({
                    owner: res.data.repository.owner.login,
                    repo: res.data.repository.name,
                    url: res.data.repository.html_url,
                    description: res.data.repository.description || 'No description',
                    language: res.data.repository.language || 'Unknown',
                    stars: res.data.repository.stargazers_count,
                });
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

    const handleIndexRepo = async () => {
        if (!owner || !repo) return;

        setIndexing(true);
        try {
            const res = await axios.post('/api/repo-index', {
                owner,
                repo,
                forceReindex: false,
            });

            if (res.data.alreadyIndexed) {
                alert('Repository is already indexed!');
            } else {
                alert(`Repository indexed successfully! ${res.data.chunksCreated} chunks created.`);
            }

            setIsIndexed(true);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to index repository');
        } finally {
            setIndexing(false);
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
            <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6">
                        <svg className="animate-spin text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <div className="text-white text-xl font-semibold">Loading repository details...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center">
                <div className="text-center glass rounded-2xl p-12 max-w-md animate-slide-up">
                    <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
                    <div className="text-white text-2xl font-bold mb-4">Oops!</div>
                    <div className="text-gray-300 text-lg mb-6">{error}</div>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to search</span>
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { repository, readme } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 animate-slide-up">
                    <Link href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to search</span>
                    </Link>

                    <div className="glass rounded-2xl p-8 shadow-xl">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-5xl font-bold gradient-text-primary mb-3">{repository.name}</h1>
                                <p className="text-cyan-400 text-xl mb-4 font-semibold">{repository.owner.login}</p>
                                {repository.description && (
                                    <p className="text-gray-300 text-lg leading-relaxed">{repository.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-wrap mt-6 pt-6 border-t border-white/10">
                            {session && (
                                <button
                                    onClick={() => setShowCollectionModal(true)}
                                    className="btn-outline flex items-center gap-2 hover:text-cyan-400 hover:border-cyan-400"
                                >
                                    <Heart className="w-5 h-5" />
                                    <span>Add to Collection</span>
                                </button>
                            )}
                            <a
                                href={repository.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-outline flex items-center gap-2"
                            >
                                <ExternalLink className="w-5 h-5" />
                                <span>View on GitHub</span>
                            </a>
                            <LivePreviewButton
                                owner={owner as string}
                                repo={repo as string}
                                onPreviewReady={() => setShowLivePreview(true)}
                                onError={(error) => alert(`Preview Error: ${error}`)}
                            />
                            <button
                                onClick={() => setShowConverter(true)}
                                className="btn-ai flex items-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                <span>Convert Code</span>
                            </button>
                            <div className="w-48">
                                <DeployButton
                                    type="existing"
                                    repoUrl={repository.html_url}
                                />
                            </div>
                        </div>
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
                                <p className="text-xs text-gray-400 mb-3">
                                    💡 Click on any file to view its code
                                </p>
                                <div className="font-mono text-sm">
                                    {fileTree.map((node: any, idx: number) => (
                                        <FileTreeNode
                                            key={idx}
                                            node={node}
                                            onFileClick={(path) => setSelectedFile(path)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Code Viewer Modal */}
                {selectedFile && owner && repo && (
                    <CodeViewer
                        owner={owner as string}
                        repo={repo as string}
                        filePath={selectedFile}
                        onClose={() => setSelectedFile(null)}
                    />
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

                {/* AI Q&A Section */}
                <div className="mb-8">
                    <RepoQA
                        repoId={`${owner}/${repo}`}
                        isIndexed={isIndexed}
                        onIndexRequest={handleIndexRepo}
                    />
                    {indexing && (
                        <div className="mt-4 p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                            <p className="text-purple-300 text-sm">
                                🔄 Indexing repository... This may take a minute.
                            </p>
                        </div>
                    )}
                </div>

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

                {/* Code Converter Modal */}
                {showConverter && owner && repo && (
                    <CodeConverterModal
                        owner={owner as string}
                        repo={repo as string}
                        onClose={() => setShowConverter(false)}
                    />
                )}

                {/* Live Preview Modal */}
                {showLivePreview && owner && repo && (
                    <LivePreviewModal
                        owner={owner as string}
                        repo={repo as string}
                        onClose={() => setShowLivePreview(false)}
                    />
                )}

                {/* Add to Collection Modal */}
                {showCollectionModal && (
                    <AddToCollectionModal
                        repo={repository}
                        onClose={() => setShowCollectionModal(false)}
                    />
                )}
            </div>
        </div>
    );
}
