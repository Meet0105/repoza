import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn('MongoDB URI not configured');
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;
  return client;
}

export async function saveSearch(query: string, results: number) {
  try {
    const client = await connectToDatabase();
    if (!client) return;

    const db = client.db();
    await db.collection('searches').insertOne({
      query,
      results,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to save search:', error);
  }
}

export async function getTrendingSearches(limit = 10) {
  try {
    const client = await connectToDatabase();
    if (!client) return [];

    const db = client.db();
    const trending = await db
      .collection('searches')
      .aggregate([
        {
          $group: {
            _id: '$query',
            count: { $sum: 1 },
            lastSearched: { $max: '$timestamp' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();

    return trending;
  } catch (error) {
    console.error('Failed to get trending searches:', error);
    return [];
  }
}
