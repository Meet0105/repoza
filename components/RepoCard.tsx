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
      {/* Title and Score */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link href={`/repo/${repo.full_name.split('/')[0]}/${repo.full_name.split('/')[1]}`}>
            <h3 className="font-semibold text-sm text-white hover:text-cyan-400 cursor-pointer transition-colors group-hover:gradient-text-primary leading-none">
              {repo.full_name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-0.5">
            {repo.language && (
              <span className="badge-cyan text-xs px-1 py-0">
                {repo.language}
              </span>
            )}
            {repo.aiRelevance !== undefined && repo.aiRelevance > 0 && (
              <span className="badge-purple text-xs inline-flex items-center gap-0.5 px-1 py-0">
                <Sparkles className="w-2.5 h-2.5" />
                {(repo.aiRelevance * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        {repo.score && (
          <div className="glass-light px-1 py-0 rounded text-xs text-cyan-400 font-mono font-semibold">
            {repo.score.toFixed(0)}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-300 line-clamp-2 leading-tight mt-0.5">
        {repo.description || 'No description available'}
      </p>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          {repo.topics.slice(0, 5).map((topic: string) => (
            <span
              key={topic}
              className="px-1 py-0 text-xs glass-light text-gray-300 rounded hover:text-cyan-400 transition-colors cursor-default"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}

      {/* Stats and Actions */}
      <div className="flex items-center justify-between text-xs mt-0.5 pt-0.5 border-t border-white/10">
        <div className="flex gap-1.5 text-gray-400">
          <span className="flex items-center gap-0.5 hover:text-yellow-400 transition-colors">
            <Star className="w-3 h-3" />
            <span className="font-semibold text-xs">{repo.stargazers_count.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-0.5 hover:text-cyan-400 transition-colors">
            <GitFork className="w-3 h-3" />
            <span className="font-semibold text-xs">{repo.forks_count.toLocaleString()}</span>
          </span>
        </div>

        <div className="flex gap-0.5">
          {session && (
            <button
              onClick={() => setShowCollectionModal(true)}
              className="p-0.5 glass-light hover:glass rounded transition-all text-gray-400 hover:text-cyan-400"
              title="Add to collection"
            >
              <Heart className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={copyCloneCommand}
            className="p-0.5 glass-light hover:glass rounded transition-all text-gray-400 hover:text-cyan-400"
            title="Copy clone command"
          >
            <Copy className="w-3 h-3" />
          </button>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="p-0.5 glass-light hover:glass rounded transition-all text-gray-400 hover:text-cyan-400"
            title="View on GitHub"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateBoilerplate}
        disabled={generating}
        className="w-full btn-ai text-xs py-0.5 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-2.5 h-2.5" />
        <span>{generating ? 'Generating...' : 'Generate'}</span>
      </button>

      {/* Boilerplate Output */}
      {showBoilerplate && (
        <div className="mt-0.5 glass-strong rounded p-1 animate-slide-up">
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
