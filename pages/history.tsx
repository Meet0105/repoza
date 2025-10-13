import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Clock, Search, Folder, Code2, Trash2, Download, ArrowLeft, Star, GitFork } from 'lucide-react';
import {
  getSearchHistory,
  getRepoHistory,
  getBoilerplateHistory,
  clearSearchHistory,
  clearRepoHistory,
  clearBoilerplateHistory,
  clearAllHistory,
  SearchHistoryItem,
  RepoHistoryItem,
  BoilerplateHistoryItem,
} from '../utils/history';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';

function HistoryContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'search' | 'repo' | 'boilerplate'>('search');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [repoHistory, setRepoHistory] = useState<RepoHistoryItem[]>([]);
  const [boilerplateHistory, setBoilerplateHistory] = useState<BoilerplateHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setSearchHistory(getSearchHistory());
    setRepoHistory(getRepoHistory());
    setBoilerplateHistory(getBoilerplateHistory());
  };

  const handleClearSection = () => {
    if (activeTab === 'search') {
      clearSearchHistory();
    } else if (activeTab === 'repo') {
      clearRepoHistory();
    } else {
      clearBoilerplateHistory();
    }
    loadHistory();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearAllHistory();
      loadHistory();
    }
  };

  const handleSearchClick = (query: string) => {
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  const handleRedownload = async (item: BoilerplateHistoryItem) => {
    try {
      const config = {
        framework: item.framework,
        language: item.language,
        features: item.features,
      };

      const res = await axios.post('/api/generate-boilerplate', config, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to regenerate boilerplate');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold">History</h1>
                <p className="text-gray-300 text-lg">Your searches, repos, and generated projects</p>
              </div>
            </div>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'search'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            Searches ({searchHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('repo')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'repo'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Folder className="w-5 h-5" />
            Repos ({repoHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('boilerplate')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'boilerplate'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code2 className="w-5 h-5" />
            Boilerplates ({boilerplateHistory.length})
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {activeTab !== 'search' && (
            <button
              onClick={handleClearSection}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm mb-4"
            >
              <Trash2 className="w-4 h-4" />
              Clear {activeTab === 'repo' ? 'Repos' : 'Boilerplates'}
            </button>
          )}
        </div>

        {/* Search History */}
        {activeTab === 'search' && (
          <div className="space-y-3">
            {searchHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No search history yet</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-400">{searchHistory.length} searches</p>
                  <button
                    onClick={handleClearSection}
                    className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded text-sm transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>
                {searchHistory.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchClick(item.query)}
                    className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Search className="w-4 h-4 text-purple-400" />
                          <span className="font-semibold">{item.query}</span>
                        </div>
                        {item.resultsCount !== undefined && (
                          <p className="text-sm text-gray-400">{item.resultsCount} results</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Repo History */}
        {activeTab === 'repo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repoHistory.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No repos visited yet</p>
              </div>
            ) : (
              repoHistory.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/repo/${item.owner}/${item.repo}`}
                  className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white mb-1">
                        {item.owner}/{item.repo}
                      </h3>
                      {item.language && (
                        <span className="inline-block px-2 py-1 text-xs bg-purple-600/30 text-purple-300 rounded">
                          {item.language}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {item.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {item.stars.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Boilerplate History */}
        {activeTab === 'boilerplate' && (
          <div className="space-y-4">
            {boilerplateHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Code2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No boilerplates generated yet</p>
              </div>
            ) : (
              boilerplateHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Code2 className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-lg">
                          {item.framework.charAt(0).toUpperCase() + item.framework.slice(1)} Project
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 text-xs bg-blue-600/30 text-blue-300 rounded">
                          {item.language}
                        </span>
                        {item.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 text-xs bg-purple-600/30 text-purple-300 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400">{item.fileName}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                  </div>

                  <button
                    onClick={() => handleRedownload(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Again
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default function History() {
  return (
    <ProtectedRoute>
      <Navbar />
      <HistoryContent />
    </ProtectedRoute>
  );
}
