import React, { useState, useEffect } from 'react';
import { X, Plus, FolderPlus, Check } from 'lucide-react';
import axios from 'axios';

type Props = {
  repo: any;
  onClose: () => void;
};

export default function AddToCollectionModal({ repo, onClose }: Props) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const res = await axios.get('/api/collections');
      setCollections(res.data.collections);
      
      // Check which collections already have this repo
      const alreadyAdded = new Set<string>();
      res.data.collections.forEach((col: any) => {
        if (col.repos.some((r: any) => r.full_name === repo.full_name)) {
          alreadyAdded.add(col._id);
        }
      });
      setAddedTo(alreadyAdded);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      const res = await axios.post('/api/collections', {
        name: newCollectionName.trim(),
      });

      const newCollection = res.data.collection;
      setCollections([newCollection, ...collections]);
      setNewCollectionName('');
      setShowCreateForm(false);

      // Automatically add repo to new collection
      await addToCollection(newCollection._id);
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const addToCollection = async (collectionId: string) => {
    try {
      await axios.post(`/api/collections/${collectionId}/repos`, { repo });
      setAddedTo(new Set(addedTo).add(collectionId));
    } catch (error) {
      console.error('Failed to add to collection:', error);
      alert('Failed to add to collection');
    }
  };

  const removeFromCollection = async (collectionId: string) => {
    try {
      await axios.delete(`/api/collections/${collectionId}/repos`, {
        data: { repoFullName: repo.full_name },
      });
      const newSet = new Set(addedTo);
      newSet.delete(collectionId);
      setAddedTo(newSet);
    } catch (error) {
      console.error('Failed to remove from collection:', error);
      alert('Failed to remove from collection');
    }
  };

  const toggleCollection = (collectionId: string) => {
    if (addedTo.has(collectionId)) {
      removeFromCollection(collectionId);
    } else {
      addToCollection(collectionId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold gradient-text-primary">Add to Collection</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">{repo.full_name}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Create New Collection */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full btn-secondary mb-4 justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Collection</span>
            </button>
          ) : (
            <div className="mb-4 p-4 glass-light rounded-lg">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 mb-3"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && createCollection()}
              />
              <div className="flex gap-2">
                <button
                  onClick={createCollection}
                  disabled={creating || !newCollectionName.trim()}
                  className="flex-1 btn-primary text-sm disabled:opacity-50"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{creating ? 'Creating...' : 'Create'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCollectionName('');
                  }}
                  className="flex-1 btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Collections List */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FolderPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No collections yet</p>
              <p className="text-sm mt-1">Create your first collection above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => {
                const isAdded = addedTo.has(collection._id);
                return (
                  <button
                    key={collection._id}
                    onClick={() => toggleCollection(collection._id)}
                    className={`w-full p-4 rounded-lg transition-all text-left ${
                      isAdded
                        ? 'glass border border-cyan-500/50 bg-cyan-500/10'
                        : 'glass-light hover:glass'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{collection.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {collection.repos.length} {collection.repos.length === 1 ? 'repo' : 'repos'}
                        </p>
                      </div>
                      {isAdded && (
                        <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
