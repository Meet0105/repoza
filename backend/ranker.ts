import { ParsedQuery } from './gemini';

export type Repo = {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string;
  topics: string[];
  score?: number;
  aiRelevance?: number;
  open_issues_count?: number;
};

export type RankingWeights = {
  stars: number;
  lastUpdated: number;
  languageMatch: number;
  forks: number;
  issues: number;
  aiRelevance?: number;
};

const DEFAULT_WEIGHTS: RankingWeights = {
  stars: 0.7,
  lastUpdated: 0.5,
  languageMatch: 0.3,
  forks: 0.4,
  issues: 0.2,
  aiRelevance: 0.8,
};

export type SortOption = 'custom' | 'stars_asc' | 'stars_desc' | 'ai_relevance' | 'forks_desc' | 'updated_desc';

export function rankRepos(
  repos: Repo[], 
  parsedQuery: ParsedQuery, 
  weights: RankingWeights = DEFAULT_WEIGHTS,
  aiRelevanceScores?: Map<string, number>
): Repo[] {
  return repos
    .map((repo) => {
      let score = 0;

      // 1. Popularity Score (logarithmic to prevent huge repos dominating)
      score += Math.log10(repo.stargazers_count + 1) * 10 * weights.stars;
      score += Math.log10(repo.forks_count + 1) * 5 * weights.forks;

      // 2. Recency Score (updated within last year gets bonus)
      const daysSinceUpdate =
        (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 365) {
        score += (20 - (daysSinceUpdate / 365) * 20) * weights.lastUpdated;
      }

      // 3. Language Match (exact match gets big bonus)
      if (parsedQuery.language && repo.language) {
        if (repo.language.toLowerCase() === parsedQuery.language.toLowerCase()) {
          score += 25 * weights.languageMatch;
        }
      }
      if (parsedQuery.technologies?.some((tech) =>
        repo.language?.toLowerCase().includes(tech.toLowerCase())
      )) {
        score += 15 * weights.languageMatch;
      }

      // 4. Topic Match (GitHub topics)
      const topicMatches = repo.topics?.filter((topic) =>
        parsedQuery.keywords?.some((kw) =>
          topic.toLowerCase().includes(kw.toLowerCase())
        )
      ) || [];
      score += topicMatches.length * 8;

      // 5. Description Match
      const descMatches = parsedQuery.keywords?.filter((kw) =>
        repo.description?.toLowerCase().includes(kw.toLowerCase())
      ) || [];
      score += descMatches.length * 5;

      // 6. Name Match (repo name contains keywords)
      const nameMatches = parsedQuery.keywords?.filter((kw) =>
        repo.name?.toLowerCase().includes(kw.toLowerCase())
      ) || [];
      score += nameMatches.length * 10;

      // 7. AI Relevance Score (if available)
      const aiRelevance = aiRelevanceScores?.get(repo.full_name) || 0;
      if (aiRelevance > 0 && weights.aiRelevance) {
        score += aiRelevance * 100 * weights.aiRelevance;
      }

      // 8. Issues penalty (too many open issues might indicate problems)
      if (repo.open_issues_count && weights.issues) {
        const issuesPenalty = Math.min(10, repo.open_issues_count / 100);
        score -= issuesPenalty * weights.issues;
      }

      return { ...repo, score, aiRelevance };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

export function sortRepos(repos: Repo[], sortOption: SortOption): Repo[] {
  const sorted = [...repos];
  
  switch (sortOption) {
    case 'stars_desc':
      return sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
    
    case 'stars_asc':
      return sorted.sort((a, b) => a.stargazers_count - b.stargazers_count);
    
    case 'ai_relevance':
      return sorted.sort((a, b) => (b.aiRelevance || 0) - (a.aiRelevance || 0));
    
    case 'forks_desc':
      return sorted.sort((a, b) => b.forks_count - a.forks_count);
    
    case 'updated_desc':
      return sorted.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    
    case 'custom':
    default:
      return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}

export function filterRepos(repos: Repo[], filters: {
  minStars?: number;
  language?: string;
  maxAge?: number; // days
}): Repo[] {
  return repos.filter((repo) => {
    if (filters.minStars && repo.stargazers_count < filters.minStars) return false;
    if (filters.language && repo.language !== filters.language) return false;
    if (filters.maxAge) {
      const daysSinceUpdate =
        (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > filters.maxAge) return false;
    }
    return true;
  });
}
