import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const INDEX_NAME = 'repoza-repos';

export async function getIndex() {
  try {
    return pinecone.index(INDEX_NAME);
  } catch (error) {
    console.error('Failed to get Pinecone index:', error);
    throw error;
  }
}

export interface RepoChunk {
  id: string;
  repoId: string;
  content: string;
  file: string;
  chunkIndex: number;
  metadata?: Record<string, any>;
}

export async function storeRepoEmbeddings(
  repoId: string,
  chunks: Array<{ content: string; file: string; embedding: number[] }>,
  clearExisting = true
) {
  try {
    const index = await getIndex();

    // Clear existing embeddings for this repo if requested
    if (clearExisting) {
      await deleteRepoEmbeddings(repoId);
    }

    // Prepare vectors for upsert
    const vectors = chunks.map((chunk, idx) => ({
      id: `${repoId}::${chunk.file}::${idx}`,
      values: chunk.embedding,
      metadata: {
        repoId,
        content: chunk.content,
        file: chunk.file,
        chunkIndex: idx,
      },
    }));

    // Upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    console.log(`Stored ${vectors.length} embeddings for ${repoId}`);
    return vectors.length;
  } catch (error) {
    console.error('Failed to store embeddings:', error);
    throw error;
  }
}

export async function queryRepoEmbeddings(
  repoId: string,
  questionEmbedding: number[],
  topK = 5
): Promise<Array<{ content: string; file: string; score: number }>> {
  try {
    const index = await getIndex();

    const queryResponse = await index.query({
      vector: questionEmbedding,
      topK,
      includeMetadata: true,
      filter: {
        repoId: { $eq: repoId },
      },
    });

    return (
      queryResponse.matches?.map((match) => ({
        content: (match.metadata?.content as string) || '',
        file: (match.metadata?.file as string) || '',
        score: match.score || 0,
      })) || []
    );
  } catch (error) {
    console.error('Failed to query embeddings:', error);
    throw error;
  }
}

export async function deleteRepoEmbeddings(repoId: string) {
  try {
    const index = await getIndex();

    // Delete all vectors with this repoId
    await index.deleteMany({
      filter: {
        repoId: { $eq: repoId },
      },
    });

    console.log(`Deleted embeddings for ${repoId}`);
  } catch (error) {
    console.error('Failed to delete embeddings:', error);
    throw error;
  }
}

export async function checkRepoExists(repoId: string): Promise<boolean> {
  try {
    const index = await getIndex();

    const queryResponse = await index.query({
      vector: new Array(768).fill(0), // Dummy vector
      topK: 1,
      includeMetadata: false,
      filter: {
        repoId: { $eq: repoId },
      },
    });

    return (queryResponse.matches?.length || 0) > 0;
  } catch (error) {
    console.error('Failed to check repo existence:', error);
    return false;
  }
}
