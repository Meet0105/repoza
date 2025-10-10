import React, { useState } from 'react';
import { Star, GitFork, ExternalLink, Copy, Sparkles } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

type Props = { 
  repo: any;
  parsedQuery?: any;
};

export default function RepoCard({ repo, parsedQuery }: Props) {
  const [generating, setGenerating] = useState(false);
  const [showBoilerplate, setShowBoilerplate] = useState(false);
  const [boilerplate, setBoilerplate] = useState('');

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
    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link href={`/repo/${repo.full_name.split('/')[0]}/${repo.full_name.split('/')[1]}`}>
            <h3 className="font-semibold text-lg text-white mb-1 hover:text-purple-400 cursor-pointer transition-colors">{repo.full_name}</h3>
          </Link>
          {repo.language && (
            <span className="inline-block px-2 py-1 text-xs bg-purple-600/30 text-purple-300 rounded">
              {repo.language}
            </span>
          )}
        </div>
        {repo.score && (
          <div className="text-xs text-purple-400 font-mono bg-purple-900/30 px-2 py-1 rounded">
            Score: {repo.score.toFixed(0)}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-300 mb-4 line-clamp-2">
        {repo.description || 'No description available'}
      </p>

      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {repo.topics.slice(0, 5).map((topic: string) => (
            <span
              key={topic}
              className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded border border-white/10"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex gap-4 text-gray-400">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {repo.stargazers_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            {repo.forks_count.toLocaleString()}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyCloneCommand}
            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
            title="Copy clone command"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
            title="View on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <button
        onClick={generateBoilerplate}
        disabled={generating}
        className="w-full py-2 px-4 bg-purple-600/30 hover:bg-purple-600/50 disabled:bg-gray-600/30 text-purple-200 text-sm rounded transition-colors flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {generating ? 'Generating...' : 'Generate Boilerplate'}
      </button>

      {showBoilerplate && (
        <div className="mt-3 p-3 bg-black/30 rounded text-xs">
          <pre className="text-gray-300 whitespace-pre-wrap max-h-48 overflow-auto">
            {boilerplate}
          </pre>
        </div>
      )}
    </div>
  );
}
