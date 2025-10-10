import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { parseQuery } from '../../backend/gemini';
import { rankRepos, filterRepos } from '../../backend/ranker';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { query, filters, page = 1 } = req.body || {};
  if (!query) return res.status(400).json({ error: 'query required' });

  try {
    // Step 1: Parse query using Gemini
    const parsedQuery = await parseQuery(query);
    console.log('Parsed query:', parsedQuery);

    // Step 2: Build GitHub search query
    const searchTerms = parsedQuery.keywords.join(' ');
    const languageFilter = parsedQuery.language ? ` language:${parsedQuery.language}` : '';
    const q = encodeURIComponent(searchTerms + languageFilter);

    const perPage = 12;
    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;

    const ghRes = await axios.get(url, {
      headers: {
        Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let repos = ghRes.data.items || [];

    // Step 3: Apply filters if provided
    if (filters) {
      repos = filterRepos(repos, filters);
    }

    // Step 4: Rank repositories using smart algorithm
    const rankedRepos = rankRepos(repos, parsedQuery);

    // Step 5: Return results with pagination info
    return res.status(200).json({
      repositories: rankedRepos,
      parsedQuery,
      total: ghRes.data.total_count,
      page,
      perPage,
      hasMore: repos.length === perPage,
    });
  } catch (err: any) {
    console.error('Search error:', err?.response?.data || err.message);
    return res.status(500).json({
      error: 'Failed to search repositories',
      details: err.message
    });
  }
}
