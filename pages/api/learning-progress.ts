import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { connectToDatabase } from '../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = session.user.email;

  if (req.method === 'GET') {
    // Get user's learning progress
    try {
      const client = await connectToDatabase();
      if (!client) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const db = client.db();
      const progress = await db
        .collection('learning_progress')
        .find({ email })
        .sort({ updatedAt: -1 })
        .toArray();

      return res.status(200).json({ progress });
    } catch (error) {
      console.error('Failed to get learning progress:', error);
      return res.status(500).json({ error: 'Failed to get progress' });
    }
  }

  if (req.method === 'POST') {
    // Save/update learning progress
    const { topic, pathId, completedSteps, currentStep, totalSteps } = req.body;

    try {
      const client = await connectToDatabase();
      if (!client) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const db = client.db();
      
      const progressData = {
        email,
        topic,
        pathId,
        completedSteps: completedSteps || [],
        currentStep: currentStep || 0,
        totalSteps: totalSteps || 0,
        progress: totalSteps > 0 ? Math.round((completedSteps?.length || 0) / totalSteps * 100) : 0,
        updatedAt: new Date(),
      };

      await db.collection('learning_progress').updateOne(
        { email, topic },
        { 
          $set: progressData,
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      return res.status(200).json({ success: true, progress: progressData });
    } catch (error) {
      console.error('Failed to save learning progress:', error);
      return res.status(500).json({ error: 'Failed to save progress' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete learning progress
    const { topic } = req.body;

    try {
      const client = await connectToDatabase();
      if (!client) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const db = client.db();
      await db.collection('learning_progress').deleteOne({ email, topic });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to delete learning progress:', error);
      return res.status(500).json({ error: 'Failed to delete progress' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
