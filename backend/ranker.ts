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
};

export function rankRepos(repos: Repo[], parsedQuery: ParsedQuery): Repo[] {
  return repos
    .map((repo) => {
      let score = 0;

      // 1. Popularity Score (logarithmic to prevent huge repos dominating)
      score += Math.log10(repo.stargazers_count + 1) * 10;
      score += Math.log10(repo.forks_count + 1) * 5;

      // 2. Recency Score (updated within last year gets bonus)
      const daysSinceUpdate =
        (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 365) {
        score += 20 - (daysSinceUpdate / 365) * 20;
      }

      // 3. Language Match (exact match gets big bonus)
      if (parsedQuery.language && repo.language) {
        if (repo.language.toLowerCase() === parsedQuery.language.toLowerCase()) {
          score += 25;
        }
      }
      if (parsedQuery.technologies?.some((tech) =>
        repo.language?.toLowerCase().includes(tech.toLowerCase())
      )) {
        score += 15;
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

      return { ...repo, score };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
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
