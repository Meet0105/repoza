import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { parseQuery, batchCalculateRelevance } from '../../backend/gemini';
import { rankRepos, filterRepos, sortRepos, SortOption } from '../../backend/ranker';
import { logApiCall, getApiKeys, getRankingWeights, saveSearch } from '../../backend/mongodb';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    query,
    filters,
    page = 1,
    sortOption = 'custom',
    languageFilter,
    useAI = true
  } = req.body || {};

  if (!query) return res.status(400).json({ error: 'query required' });

  try {
    // Get dynamic API keys from database if available
    const dbKeys = await getApiKeys();
    const githubToken = dbKeys?.githubToken || GITHUB_TOKEN;

    // Step 1: Parse query using Gemini
    const parsedQuery = await parseQuery(query);
    console.log('Parsed query:', parsedQuery);

    // Log Gemini API call
    await logApiCall('gemini', 'parseQuery');

    // Step 2: Build GitHub search query
    const searchTerms = parsedQuery.keywords.join(' ');
    let languageFilterStr = '';

    if (languageFilter && languageFilter !== 'all') {
      languageFilterStr = ` language:${languageFilter}`;
    } else if (parsedQuery.language) {
      languageFilterStr = ` language:${parsedQuery.language}`;
    }

    const q = encodeURIComponent(searchTerms + languageFilterStr);

    const perPage = 20; // Increased for better AI relevance calculation
    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;

    const ghRes = await axios.get(url, {
      headers: {
        Authorization: githubToken ? `token ${githubToken}` : undefined,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // Log GitHub API call
    await logApiCall('github', 'search/repositories');

    let repos = ghRes.data.items || [];

    // Step 3: Apply additional filters if provided
    if (filters) {
      repos = filterRepos(repos, filters);
    }

    // Step 4: Calculate AI relevance scores (if enabled)
    let aiRelevanceScores: Map<string, number> | undefined;

    if (useAI && repos.length > 0) {
      console.log('Calculating AI relevance scores...');

      const reposForAI = repos.map((repo: any) => ({
        name: repo.full_name,
        description: repo.description || '',
        topics: repo.topics || []
      }));

      aiRelevanceScores = await batchCalculateRelevance(query, reposForAI);

      // Log Gemini API calls for relevance
      await logApiCall('gemini', 'calculateRelevance');

      console.log('AI relevance scores calculated:', aiRelevanceScores.size);
    }

    // Step 5: Get dynamic ranking weights from database
    const weights = await getRankingWeights();

    // Step 6: Rank repositories using smart algorithm with AI relevance
    let rankedRepos = rankRepos(repos, parsedQuery, weights, aiRelevanceScores);

    // Step 7: Apply sorting based on user selection
    if (sortOption && sortOption !== 'custom') {
      rankedRepos = sortRepos(rankedRepos, sortOption as SortOption);
    }

    // Step 8: Extract unique languages from results for filter options
    const availableLanguages = Array.from(
      new Set(repos.map((r: any) => r.language).filter(Boolean))
    ).sort();

    // Step 9: Save search to database
    if (page === 1) {
      await saveSearch(query, ghRes.data.total_count);
    }

    // Step 10: Return results with pagination and filter info
    return res.status(200).json({
      repositories: rankedRepos.slice(0, 12), // Limit to 12 for display
      parsedQuery,
      total: ghRes.data.total_count,
      page,
      perPage: 12,
      hasMore: repos.length === perPage,
      availableLanguages,
      appliedFilters: {
        language: languageFilter || 'all',
        sort: sortOption
      }
    });
  } catch (err: any) {
    console.error('Search error:', err?.response?.data || err.message);
    return res.status(500).json({
      error: 'Failed to search repositories',
      details: err.message
    });
  }
}
