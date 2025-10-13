import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRepoContent } from '../../backend/repoFetcher';
import { chunkText, generateEmbeddings } from '../../backend/gemini';
import { storeRepoEmbeddings, checkRepoExists } from '../../backend/pinecone';
import { logApiCall } from '../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { owner, repo, forceReindex = false } = req.body;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Owner and repo are required' });
  }

  const repoId = `${owner}/${repo}`;

  try {
    // Check if repo is already indexed
    if (!forceReindex) {
      const exists = await checkRepoExists(repoId);
      if (exists) {
        return res.status(200).json({
          message: 'Repository already indexed',
          repoId,
          alreadyIndexed: true,
        });
      }
    }

    // Step 1: Fetch repo content
    console.log(`Fetching content for ${repoId}...`);
    const files = await fetchRepoContent(owner, repo);

    if (files.length === 0) {
      return res.status(404).json({
        error: 'No content found for repository',
        repoId,
      });
    }

    // Step 2: Chunk all files
    console.log(`Chunking ${files.length} files...`);
    const allChunks: Array<{ content: string; file: string }> = [];

    for (const file of files) {
      const chunks = chunkText(file.content, 500);
      chunks.forEach((chunk) => {
        allChunks.push({
          content: chunk,
          file: file.path,
        });
      });
    }

    console.log(`Created ${allChunks.length} chunks`);

    // Step 3: Generate embeddings for all chunks
    console.log('Generating embeddings...');
    const texts = allChunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);

    // Log Gemini API call
    await logApiCall('gemini', 'generateEmbeddings');

    // Step 4: Store in Pinecone
    console.log('Storing embeddings in Pinecone...');
    const chunksWithEmbeddings = allChunks.map((chunk, idx) => ({
      ...chunk,
      embedding: embeddings[idx],
    }));

    await storeRepoEmbeddings(repoId, chunksWithEmbeddings, forceReindex);

    return res.status(200).json({
      message: 'Repository indexed successfully',
      repoId,
      filesProcessed: files.length,
      chunksCreated: allChunks.length,
      embeddingsStored: embeddings.length,
    });
  } catch (error: any) {
    console.error('Indexing error:', error);
    return res.status(500).json({
      error: 'Failed to index repository',
      details: error.message,
      repoId,
    });
  }
}
