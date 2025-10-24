import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import {
    getCollectionById,
    updateCollection,
    deleteCollection
} from '../../../backend/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const email = session.user.email;
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid collection ID' });
    }

    if (req.method === 'GET') {
        // Get single collection
        const collection = await getCollectionById(id, email);

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        return res.status(200).json({ collection });
    }

    if (req.method === 'PUT') {
        // Update collection
        const { name, description, isPublic } = req.body;

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (isPublic !== undefined) updates.isPublic = isPublic;

        const success = await updateCollection(id, email, updates);

        if (!success) {
            return res.status(500).json({ error: 'Failed to update collection' });
        }

        return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
        // Delete collection
        const success = await deleteCollection(id, email);

        if (!success) {
            return res.status(500).json({ error: 'Failed to delete collection' });
        }

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
