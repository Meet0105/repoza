import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { owner, repo } = req.query;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo are required' });
  }

  try {
    const headers = {
      Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
      Accept: 'application/vnd.github.v3+json',
    };

    // Fetch repository details
    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    // Fetch README
    let readme = null;
    try {
      const readmeRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        { headers }
      );
      // Decode Base64 content
      readme = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
    } catch (error) {
      console.log('No README found');
    }

    // Fetch file tree structure (optional)
    let fileTree = null;
    try {
      const treeRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoRes.data.default_branch}?recursive=1`,
        { headers }
      );
      fileTree = treeRes.data.tree;
    } catch (error) {
      console.log('Could not fetch file tree');
    }

    return res.status(200).json({
      repository: {
        id: repoRes.data.id,
        name: repoRes.data.name,
        full_name: repoRes.data.full_name,
        owner: repoRes.data.owner,
        description: repoRes.data.description,
        html_url: repoRes.data.html_url,
        homepage: repoRes.data.homepage,
        stargazers_count: repoRes.data.stargazers_count,
        forks_count: repoRes.data.forks_count,
        open_issues_count: repoRes.data.open_issues_count,
        watchers_count: repoRes.data.watchers_count,
        language: repoRes.data.language,
        topics: repoRes.data.topics,
        created_at: repoRes.data.created_at,
        updated_at: repoRes.data.updated_at,
        pushed_at: repoRes.data.pushed_at,
        size: repoRes.data.size,
        default_branch: repoRes.data.default_branch,
        license: repoRes.data.license,
      },
      readme,
      fileTree,
    });
  } catch (err: any) {
    console.error('Repo details error:', err?.response?.data || err.message);
    return res.status(500).json({
      error: 'Failed to fetch repository details',
      details: err.message,
    });
  }
}