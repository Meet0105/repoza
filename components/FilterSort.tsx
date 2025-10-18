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
        <div className="glass rounded-xl p-6 mb-8 shadow-lg animate-slide-up">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Left side - Filters */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                    {/* Language Filter */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                            <Filter className="w-4 h-4 text-white" />
                        </div>
                        <select
                            value={languageFilter}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="input text-sm flex-1 sm:flex-initial"
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
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-code flex items-center justify-center flex-shrink-0">
                            <ArrowUpDown className="w-4 h-4 text-white" />
                        </div>
                        <select
                            value={sortOption}
                            onChange={(e) => onSortChange(e.target.value as SortOption)}
                            className="input text-sm flex-1 sm:flex-initial"
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
                <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                    {/* AI Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={useAI}
                            onChange={(e) => onUseAIChange(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${useAI ? 'bg-purple-600 shadow-lg shadow-purple-500/50' : 'bg-gray-600'
                            }`}>
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${useAI ? 'translate-x-6' : 'translate-x-0'
                                }`}></div>
                        </div>
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Sparkles className={`w-4 h-4 transition-colors ${useAI ? 'text-purple-400' : 'text-gray-400'}`} />
                            <span>AI Ranking</span>
                        </span>
                    </label>

                    {/* Results Count */}
                    {resultsCount !== undefined && (
                        <div className="badge-cyan text-sm font-semibold">
                            {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
                        </div>
                    )}
                </div>
            </div>

            {/* Active Filters Display */}
            {(languageFilter !== 'all' || sortOption !== 'custom' || useAI) && (
                <div className="mt-4 pt-4 border-t border-white/10">
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
