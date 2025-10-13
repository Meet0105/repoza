import type { NextApiRequest, NextApiResponse } from 'next';
import { generateEmbedding, answerQuestionWithContext } from '../../backend/gemini';
import { queryRepoEmbeddings } from '../../backend/pinecone';
import { logApiCall } from '../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repoId, question } = req.body;

  if (!repoId || !question) {
    return res.status(400).json({ error: 'repoId and question are required' });
  }

  try {
    // Step 1: Generate embedding for the question
    console.log(`Generating embedding for question: "${question}"`);
    const questionEmbedding = await generateEmbedding(question);

    // Log Gemini API call
    await logApiCall('gemini', 'generateEmbedding');

    // Step 2: Query Pinecone for relevant chunks
    console.log(`Querying Pinecone for ${repoId}...`);
    const relevantChunks = await queryRepoEmbeddings(repoId, questionEmbedding, 5);

    if (relevantChunks.length === 0) {
      return res.status(404).json({
        error: 'No context found for this repository. It may not be indexed yet.',
        repoId,
        suggestion: 'Try indexing the repository first.',
      });
    }

    console.log(`Found ${relevantChunks.length} relevant chunks`);

    // Step 3: Generate answer using Gemini with context
    console.log('Generating answer...');
    const answer = await answerQuestionWithContext(question, relevantChunks);

    // Log Gemini API call
    await logApiCall('gemini', 'answerQuestion');

    // Step 4: Return answer with sources
    return res.status(200).json({
      answer,
      sources: relevantChunks.map((chunk) => ({
        file: chunk.file,
        score: chunk.score,
        preview: chunk.content.substring(0, 150) + '...',
      })),
      repoId,
      question,
    });
  } catch (error: any) {
    console.error('Q&A error:', error);
    return res.status(500).json({
      error: 'Failed to answer question',
      details: error.message,
      repoId,
    });
  }
}
