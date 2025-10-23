import React, { useState } from 'react';
import { Star, GitFork, ExternalLink, Copy, Sparkles, Heart } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AddToCollectionModal from './AddToCollectionModal';

type Props = { 
  repo: any;
  parsedQuery?: any;
};

export default function RepoCard({ repo, parsedQuery }: Props) {
  const { data: session } = useSession();
  const [generating, setGenerating] = useState(false);
  const [showBoilerplate, setShowBoilerplate] = useState(false);
  const [boilerplate, setBoilerplate] = useState('');
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const copyCloneCommand = () => {
    navigator.clipboard.writeText(`git clone ${repo.html_url}.git`);
    alert('Clone command copied!');
  };

  const generateBoilerplate = async () => {
    setGenerating(true);
    setShowBoilerplate(true);
    setBoilerplate('Generating boilerplate...');
    
    try {
      const query = `${repo.name} - ${repo.description || 'repository'}`;
      const res = await axios.post('/api/generate', { 
        query,
        parsedQuery: parsedQuery || { technologies: [repo.language], purpose: repo.description }
      });
      setBoilerplate(res.data.boilerplate);
    } catch (error) {
      setBoilerplate('Failed to generate boilerplate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

    return (
        <div className="card-hover group animate-slide-up">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Link href={`/repo/${repo.full_name.split('/')[0]}/${repo.full_name.split('/')[1]}`}>
                        <h3 className="font-semibold text-xl text-white mb-2 hover:text-cyan-400 cursor-pointer transition-colors group-hover:gradient-text-primary">
                            {repo.full_name}
                        </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {repo.language && (
                            <span className="badge-cyan text-xs">
                                {repo.language}
                            </span>
                        )}
                        {repo.aiRelevance !== undefined && repo.aiRelevance > 0 && (
                            <span className="badge-purple text-xs inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {(repo.aiRelevance * 100).toFixed(0)}% AI Match
                            </span>
                        )}
                    </div>
                </div>
                {repo.score && (
                    <div className="glass-light px-3 py-1.5 rounded-lg">
                        <span className="text-xs text-cyan-400 font-mono font-semibold">
                            Score: {repo.score.toFixed(0)}
                        </span>
                    </div>
                )}
            </div>

            <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                {repo.description || 'No description available'}
            </p>

            {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {repo.topics.slice(0, 5).map((topic: string) => (
                        <span
                            key={topic}
                            className="px-2.5 py-1 text-xs glass-light text-gray-300 rounded-md hover:text-cyan-400 transition-colors cursor-default"
                        >
                            #{topic}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats and Actions */}
            <div className="flex items-center justify-between text-sm mb-4 pt-4 border-t border-white/10">
                <div className="flex gap-6 text-gray-400">
                    <span className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                        <Star className="w-4 h-4" />
                        <span className="font-semibold">{repo.stargazers_count.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                        <GitFork className="w-4 h-4" />
                        <span className="font-semibold">{repo.forks_count.toLocaleString()}</span>
                    </span>
                </div>

                <div className="flex gap-2">
                    {session && (
                        <button
                            onClick={() => setShowCollectionModal(true)}
                            className="p-2 glass-light hover:glass rounded-lg transition-all duration-300 text-gray-400 hover:text-pink-400 hover-lift"
                            title="Add to collection"
                        >
                            <Heart className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={copyCloneCommand}
                        className="p-2 glass-light hover:glass rounded-lg transition-all duration-300 text-gray-400 hover:text-cyan-400 hover-lift"
                        title="Copy clone command"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 glass-light hover:glass rounded-lg transition-all duration-300 text-gray-400 hover:text-cyan-400 hover-lift"
                        title="View on GitHub"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Generate Boilerplate Button */}
            <button
                onClick={generateBoilerplate}
                disabled={generating}
                className="w-full btn-ai text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Generating...' : 'Generate Boilerplate'}</span>
            </button>

            {/* Boilerplate Output */}
            {showBoilerplate && (
                <div className="mt-4 glass-strong rounded-lg p-4 animate-slide-up">
                    <pre className="text-gray-300 text-xs whitespace-pre-wrap max-h-48 overflow-auto font-mono">
                        {boilerplate}
                    </pre>
                </div>
            )}

            {/* Add to Collection Modal */}
            {showCollectionModal && (
                <AddToCollectionModal
                    repo={repo}
                    onClose={() => setShowCollectionModal(false)}
                />
            )}
        </div>
    );
}
