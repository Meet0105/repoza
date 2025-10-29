import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Sparkles, TrendingUp, Code2, Github, Clock, Link as LinkIcon, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import RepoCard from '../components/RepoCard';
import { saveSearchHistory } from '../utils/history';
import Navbar from '../components/Navbar';
import FilterSort, { SortOption } from '../components/FilterSort';

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
  
  // Filter and Sort states
  const [sortOption, setSortOption] = useState<SortOption>('custom');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const search = async (pageNum = 1, customSort?: SortOption, customLang?: string, customAI?: boolean) => {
    if (!q.trim()) return;
    setLoading(true);
    setShowBoilerplate(false);

    if (pageNum === 1) {
      setResults([]);
      setPage(1);
    }

    try {
      const res = await axios.post('/api/search', { 
        query: q, 
        page: pageNum,
        sortOption: customSort || sortOption,
        languageFilter: customLang || languageFilter,
        useAI: customAI !== undefined ? customAI : useAI
      });
      const newRepos = res.data.repositories || [];

      if (pageNum === 1) {
        setResults(newRepos);
      } else {
        setResults(prev => [...prev, ...newRepos]);
      }

      setParsedQuery(res.data.parsedQuery);
      setTotalCount(res.data.total || 0);
      setAvailableLanguages(res.data.availableLanguages || []);
      setHasMore(newRepos.length === 12 && results.length + newRepos.length < res.data.total);

      if (pageNum === 1) {
        const newHistory = [q, ...history.filter(h => h !== q)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        
        // Save to history utility
        saveSearchHistory(q, res.data.total);
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

  // Filter and Sort handlers
  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
    search(1, newSort, languageFilter, useAI);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguageFilter(newLang);
    search(1, sortOption, newLang, useAI);
  };

  const handleUseAIChange = (newUseAI: boolean) => {
    setUseAI(newUseAI);
    search(1, sortOption, languageFilter, newUseAI);
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
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
            {/* Navbar with Auth */}
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    {/* Icon + Title */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl gradient-ai flex items-center justify-center shadow-lg animate-pulse-glow">
                            <Code2 className="w-9 h-9 text-white" />
                        </div>
                        <h1 className="text-6xl font-bold">
                            <span className="gradient-text-primary">Repoza</span>
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="text-xl text-gray-300 mb-3 max-w-3xl mx-auto">
                        AI-Powered Repository Discovery & Code Generation Platform
                    </p>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Describe your project in plain language. Get the best GitHub repos instantly with AI-powered search, live preview, and code conversion.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/generator')}
                            className="btn-ai flex items-center gap-2 hover-lift"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Boilerplate</span>
                        </button>
                        <button
                            onClick={() => router.push('/history')}
                            className="btn-outline flex items-center gap-2"
                        >
                            <History className="w-5 h-5" />
                            <span>View History</span>
                        </button>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                        <span className="badge-cyan">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI-Powered
                        </span>
                        <span className="badge-purple">
                            <Code2 className="w-3 h-3 mr-1" />
                            Code Converter
                        </span>
                        <span className="badge-pink">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Live Preview
                        </span>
                        <span className="badge-green">
                            <Github className="w-3 h-3 mr-1" />
                            10M+ Repos
                        </span>
                    </div>
                </motion.div>

                {/* Search Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    {/* Search by Keyword */}
                    <div className="glass rounded-xl p-6 shadow-lg hover-lift mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                                <Search className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-semibold text-lg">Search by Keyword</span>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && search(1)}
                                placeholder="e.g., MERN stack blog with authentication..."
                                className="input flex-1"
                            />
                            <button
                                onClick={() => search()}
                                disabled={loading}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                <span>{loading ? 'Searching...' : 'Search'}</span>
                            </button>
                        </div>
                    </div>

                    {/* OR Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-6 py-2 glass-light rounded-full text-gray-300 font-semibold">OR</span>
                        </div>
                    </div>

                    {/* Paste GitHub URL Section */}
                    <div className="glass rounded-xl p-6 shadow-lg hover-lift">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg gradient-code flex items-center justify-center">
                                <LinkIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-semibold text-lg">Paste GitHub Repository URL</span>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePasteRepoUrl()}
                                placeholder="https://github.com/vercel/next.js"
                                className="input flex-1"
                            />
                            <button
                                onClick={handlePasteRepoUrl}
                                className="btn-primary flex items-center gap-2"
                            >
                                <LinkIcon className="w-5 h-5" />
                                <span>View Repo</span>
                            </button>
                        </div>
                    </div>

                    {/* Example Queries */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {examples.map((ex) => (
                            <button
                                key={ex}
                                onClick={() => setQ(ex)}
                                className="badge-cyan hover:bg-cyan-500/30 transition-all duration-300 cursor-pointer"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>

                    {/* Search History */}
                    {history.length > 0 && (
                        <div className="mt-6">
                            <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
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
            {/* Filter and Sort UI */}
            <FilterSort
              sortOption={sortOption}
              onSortChange={handleSortChange}
              languageFilter={languageFilter}
              onLanguageChange={handleLanguageChange}
              availableLanguages={availableLanguages}
              useAI={useAI}
              onUseAIChange={handleUseAIChange}
              resultsCount={results.length}
            />

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">
                  Top {results.length} Repositories
                </h2>
              </div>
              {totalCount > 0 && (
                <p className="text-gray-400 text-xs">
                  {results.length} of {totalCount.toLocaleString()}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
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
