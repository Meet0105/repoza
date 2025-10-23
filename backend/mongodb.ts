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

export async function logApiCall(service: 'github' | 'gemini', endpoint?: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return;

    const db = client.db();
    await db.collection('api_logs').insertOne({
      service,
      endpoint,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log API call:', error);
  }
}

export async function saveBoilerplate(projectName: string, language: string, userId?: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return;

    const db = client.db();
    await db.collection('boilerplates').insertOne({
      projectName,
      language,
      userId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to save boilerplate:', error);
  }
}

export async function getApiKeys() {
  try {
    const client = await connectToDatabase();
    if (!client) return null;

    const db = client.db();
    const keys = await db.collection('api_keys').findOne({ type: 'credentials' });
    
    return keys;
  } catch (error) {
    console.error('Failed to get API keys:', error);
    return null;
  }
}

export async function getRankingWeights() {
  try {
    const client = await connectToDatabase();
    if (!client) return null;

    const db = client.db();
    const settings = await db.collection('settings').findOne({ type: 'admin' });
    
    return settings?.rankingWeights || {
      stars: 0.7,
      lastUpdated: 0.5,
      languageMatch: 0.3,
      forks: 0.4,
      issues: 0.2,
    };
  } catch (error) {
    console.error('Failed to get ranking weights:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return null;

    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    
    return user;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

export async function saveUserSearch(email: string, query: string, results: number) {
  try {
    const client = await connectToDatabase();
    if (!client) return;

    const db = client.db();
    await db.collection('user_searches').insertOne({
      email,
      query,
      results,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to save user search:', error);
  }
}

export async function getUserSearchHistory(email: string, limit = 20) {
  try {
    const client = await connectToDatabase();
    if (!client) return [];

    const db = client.db();
    const searches = await db
      .collection('user_searches')
      .find({ email })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    return searches;
  } catch (error) {
    console.error('Failed to get user search history:', error);
    return [];
  }
}

// Collections/Favorites Functions
export async function createCollection(email: string, name: string, description?: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return null;

    const db = client.db();
    const collection = {
      email,
      name,
      description: description || '',
      repos: [],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('collections').insertOne(collection);
    return { ...collection, _id: result.insertedId };
  } catch (error) {
    console.error('Failed to create collection:', error);
    return null;
  }
}

export async function getUserCollections(email: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return [];

    const db = client.db();
    const collections = await db
      .collection('collections')
      .find({ email })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return collections;
  } catch (error) {
    console.error('Failed to get user collections:', error);
    return [];
  }
}

export async function getCollectionById(collectionId: string, email: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return null;

    const { ObjectId } = require('mongodb');
    const db = client.db();
    const collection = await db.collection('collections').findOne({
      _id: new ObjectId(collectionId),
      email,
    });
    
    return collection;
  } catch (error) {
    console.error('Failed to get collection:', error);
    return null;
  }
}

export async function addRepoToCollection(collectionId: string, email: string, repo: any) {
  try {
    const client = await connectToDatabase();
    if (!client) return false;

    const { ObjectId } = require('mongodb');
    const db = client.db();
    
    const result = await db.collection('collections').updateOne(
      { _id: new ObjectId(collectionId), email },
      { 
        $addToSet: { repos: repo },
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to add repo to collection:', error);
    return false;
  }
}

export async function removeRepoFromCollection(collectionId: string, email: string, repoFullName: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return false;

    const { ObjectId } = require('mongodb');
    const db = client.db();
    
    const result = await db.collection('collections').updateOne(
      { _id: new ObjectId(collectionId), email },
      { 
        $pull: { repos: { full_name: repoFullName } } as any,
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to remove repo from collection:', error);
    return false;
  }
}

export async function updateCollection(collectionId: string, email: string, updates: any) {
  try {
    const client = await connectToDatabase();
    if (!client) return false;

    const { ObjectId } = require('mongodb');
    const db = client.db();
    
    const result = await db.collection('collections').updateOne(
      { _id: new ObjectId(collectionId), email },
      { 
        $set: { ...updates, updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to update collection:', error);
    return false;
  }
}

export async function deleteCollection(collectionId: string, email: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return false;

    const { ObjectId } = require('mongodb');
    const db = client.db();
    
    const result = await db.collection('collections').deleteOne({
      _id: new ObjectId(collectionId),
      email,
    });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Failed to delete collection:', error);
    return false;
  }
}

export async function isRepoInCollection(collectionId: string, email: string, repoFullName: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return false;

    const { ObjectId } = require('mongodb');
    const db = client.db();
    
    const collection = await db.collection('collections').findOne({
      _id: new ObjectId(collectionId),
      email,
      'repos.full_name': repoFullName,
    });
    
    return !!collection;
  } catch (error) {
    console.error('Failed to check repo in collection:', error);
    return false;
  }
}
