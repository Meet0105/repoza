import type { NextApiRequest, NextApiResponse } from 'next';
import { parseQuery, generateBoilerplate } from '../../backend/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: 'query required' });

  try {
    const parsedQuery = await parseQuery(query);
    const boilerplate = await generateBoilerplate(query, parsedQuery);

    return res.status(200).json({
      boilerplate,
      parsedQuery,
    });
  } catch (err: any) {
    console.error('Generation error:', err.message);
    return res.status(500).json({ 
      error: 'Failed to generate boilerplate',
      details: err.message 
    });
  }
}
