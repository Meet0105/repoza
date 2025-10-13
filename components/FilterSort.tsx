import { Filter, ArrowUpDown, Sparkles } from 'lucide-react';

export type SortOption = 'custom' | 'stars_asc' | 'stars_desc' | 'ai_relevance' | 'forks_desc' | 'updated_desc';

interface FilterSortProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  languageFilter: string;
  onLanguageChange: (language: string) => void;
  availableLanguages: string[];
  useAI: boolean;
  onUseAIChange: (use: boolean) => void;
  resultsCount?: number;
}

export default function FilterSort({
  sortOption,
  onSortChange,
  languageFilter,
  onLanguageChange,
  availableLanguages,
  useAI,
  onUseAIChange,
  resultsCount
}: FilterSortProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Left side - Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <select
              value={languageFilter}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Languages</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-purple-400" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="custom">🎯 Custom Score</option>
              <option value="ai_relevance">🤖 AI Relevance</option>
              <option value="stars_desc">⭐ Stars (High to Low)</option>
              <option value="stars_asc">⭐ Stars (Low to High)</option>
              <option value="forks_desc">🍴 Forks (High to Low)</option>
              <option value="updated_desc">🕒 Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Right side - AI Toggle & Results Count */}
        <div className="flex items-center gap-4">
          {/* AI Toggle */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => onUseAIChange(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              useAI ? 'bg-purple-600' : 'bg-gray-600'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                useAI ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </div>
            <span className="flex items-center gap-1 text-sm text-white">
              <Sparkles className={`w-4 h-4 ${useAI ? 'text-purple-400' : 'text-gray-400'}`} />
              AI Ranking
            </span>
          </label>

          {/* Results Count */}
          {resultsCount !== undefined && (
            <div className="text-sm text-gray-400">
              {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(languageFilter !== 'all' || sortOption !== 'custom' || useAI) && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400">Active:</span>
            
            {languageFilter !== 'all' && (
              <span className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-300">
                Language: {languageFilter}
              </span>
            )}
            
            {sortOption !== 'custom' && (
              <span className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs text-blue-300">
                Sort: {getSortLabel(sortOption)}
              </span>
            )}
            
            {useAI && (
              <span className="px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-xs text-green-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Enhanced
              </span>
            )}
            
            <button
              onClick={() => {
                onLanguageChange('all');
                onSortChange('custom');
                onUseAIChange(true);
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getSortLabel(option: SortOption): string {
  const labels: Record<SortOption, string> = {
    custom: 'Custom Score',
    ai_relevance: 'AI Relevance',
    stars_desc: 'Stars ↓',
    stars_asc: 'Stars ↑',
    forks_desc: 'Forks ↓',
    updated_desc: 'Recently Updated'
  };
  return labels[option] || option;
}
