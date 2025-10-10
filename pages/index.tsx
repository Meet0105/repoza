import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Sparkles, TrendingUp, Code2, Github, Clock, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import RepoCard from '../components/RepoCard';

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [parsedQuery, setParsedQuery] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showBoilerplate, setShowBoilerplate] = useState(false);
  const [boilerplate, setBoilerplate] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const search = async (pageNum = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setShowBoilerplate(false);

    if (pageNum === 1) {
      setResults([]);
      setPage(1);
    }

    try {
      const res = await axios.post('/api/search', { query: q, page: pageNum });
      const newRepos = res.data.repositories || [];

      if (pageNum === 1) {
        setResults(newRepos);
      } else {
        setResults(prev => [...prev, ...newRepos]);
      }

      setParsedQuery(res.data.parsedQuery);
      setTotalCount(res.data.total || 0);
      setHasMore(newRepos.length === 12 && results.length + newRepos.length < res.data.total);

      if (pageNum === 1) {
        const newHistory = [q, ...history.filter(h => h !== q)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    search(nextPage);
  };

  const generateBoilerplate = async () => {
    setShowBoilerplate(true);
    setBoilerplate('Generating...');
    try {
      const res = await axios.post('/api/generate', { query: q });
      setBoilerplate(res.data.boilerplate);
    } catch (error) {
      setBoilerplate('Failed to generate boilerplate');
    }
  };

  const handlePasteRepoUrl = () => {
    if (!repoUrl.trim()) {
      alert('Please paste a GitHub repository URL');
      return;
    }

    // Parse GitHub URL to extract owner and repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);

    if (!match) {
      alert('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
      return;
    }

    let owner = match[1];
    let repo = match[2];

    // Remove .git suffix if present
    repo = repo.replace(/\.git$/, '');

    // Navigate to repo details page
    router.push(`/repo/${owner}/${repo}`);
  };

  const examples = [
    'MERN stack blog with authentication',
    'Next.js SaaS starter with Stripe',
    'Python ML pipeline with FastAPI',
    'React Native app with Firebase',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">
              AI Codebase Recommender
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Describe your project idea in plain language. Get the best GitHub repos instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Search by Keyword */}
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Search by keyword</span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search(1)}
                placeholder="e.g., MERN stack blog with authentication..."
                className="flex-1 px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => search()}
                disabled={loading}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-gray-400 font-semibold">OR</span>
            </div>
          </div>

          {/* Paste GitHub URL Section */}
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Or paste a GitHub repository URL</span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasteRepoUrl()}
                placeholder="https://github.com/vercel/next.js"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handlePasteRepoUrl}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                View Repo
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setQ(ex)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-full border border-white/10 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <button
                    key={h}
                    onClick={() => setQ(h)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/10 transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {parsedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">AI Parsed Query</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Technologies:</strong> {parsedQuery.technologies?.join(', ') || 'N/A'}</p>
              <p><strong>Purpose:</strong> {parsedQuery.purpose}</p>
              <p><strong>Language:</strong> {parsedQuery.language || 'Any'}</p>
            </div>
            <button
              onClick={generateBoilerplate}
              className="mt-3 px-4 py-2 bg-purple-600/50 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Boilerplate
            </button>
          </motion.div>
        )}

        {showBoilerplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
          >
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              Generated Boilerplate
            </h3>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-black/30 p-4 rounded overflow-auto max-h-96">
              {boilerplate}
            </pre>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">
                  Top {results.length} Repositories
                </h2>
              </div>
              {totalCount > 0 && (
                <p className="text-gray-400 text-sm">
                  Showing {results.length} of {totalCount.toLocaleString()} results
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((repo, idx) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <RepoCard repo={repo} parsedQuery={parsedQuery} />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {!loading && results.length === 0 && q && (
          <div className="text-center text-gray-400 py-12">
            <Github className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No results found. Try a different query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
