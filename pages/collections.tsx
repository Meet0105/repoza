import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { FolderPlus, Folder, Trash2, Edit2, Download, X, Check, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import RepoCard from '../components/RepoCard';

export default function Collections() {
  return (
    <ProtectedRoute>
      <CollectionsContent />
    </ProtectedRoute>
  );
}

function CollectionsContent() {
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const res = await axios.get('/api/collections');
      setCollections(res.data.collections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const res = await axios.post('/api/collections', {
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim(),
      });

      setCollections([res.data.collection, ...collections]);
      setNewCollectionName('');
      setNewCollectionDesc('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection');
    }
  };

  const updateCollection = async () => {
    if (!selectedCollection || !newCollectionName.trim()) return;

    try {
      await axios.put(`/api/collections/${selectedCollection._id}`, {
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim(),
      });

      setCollections(
        collections.map((c) =>
          c._id === selectedCollection._id
            ? { ...c, name: newCollectionName.trim(), description: newCollectionDesc.trim() }
            : c
        )
      );

      if (selectedCollection._id === selectedCollection._id) {
        setSelectedCollection({
          ...selectedCollection,
          name: newCollectionName.trim(),
          description: newCollectionDesc.trim(),
        });
      }

      setNewCollectionName('');
      setNewCollectionDesc('');
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update collection:', error);
      alert('Failed to update collection');
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      await axios.delete(`/api/collections/${collectionId}`);
      setCollections(collections.filter((c) => c._id !== collectionId));
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection(null);
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      alert('Failed to delete collection');
    }
  };

  const exportCollections = async () => {
    try {
      const res = await axios.get('/api/collections/export');
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `repoza-collections-${Date.now()}.json`;
      link.click();
    } catch (error) {
      console.error('Failed to export collections:', error);
      alert('Failed to export collections');
    }
  };

  const openEditModal = (collection: any) => {
    setSelectedCollection(collection);
    setNewCollectionName(collection.name);
    setNewCollectionDesc(collection.description || '');
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to home</span>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <Folder className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold gradient-text-primary">Collections</h1>
                <p className="text-gray-300 text-lg mt-2">Organize and manage your favorite repositories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <FolderPlus className="w-5 h-5" />
            <span>New Collection</span>
          </button>
          {collections.length > 0 && (
            <button onClick={exportCollections} className="btn-secondary">
              <Download className="w-5 h-5" />
              <span>Export All</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="text-gray-400 mt-4">Loading collections...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Collections List */}
            <div className="lg:col-span-1">
              <div className="glass-strong rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Collections ({collections.length})
                </h2>

                {collections.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-600" />
                    <p className="text-gray-400 mb-4">No collections yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary text-sm"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>Create First Collection</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collections.map((collection) => (
                      <div
                        key={collection._id}
                        className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedCollection?._id === collection._id
                          ? 'glass-strong border-purple-500/50 shadow-lg'
                          : 'glass-light border-white/10 hover:border-purple-500/50 hover:glass'
                          }`}
                        onClick={() => setSelectedCollection(collection)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{collection.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {collection.repos.length}{' '}
                              {collection.repos.length === 1 ? 'repo' : 'repos'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(collection);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-gray-400 hover:text-purple-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCollection(collection._id);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Collection Details */}
            <div className="lg:col-span-2">
              {selectedCollection ? (
                <div className="glass-strong rounded-2xl p-6 border border-white/10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold gradient-text-primary">
                      {selectedCollection.name}
                    </h2>
                    {selectedCollection.description && (
                      <p className="text-gray-300 mt-2">{selectedCollection.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Created {new Date(selectedCollection.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedCollection.repos.length === 0 ? (
                    <div className="text-center py-12">
                      <Folder className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-600" />
                      <p className="text-gray-400">No repositories in this collection yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Add repos by clicking the heart icon on any repository card
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedCollection.repos.map((repo: any) => (
                        <RepoCard key={repo.full_name} repo={repo} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-strong rounded-2xl p-6 text-center py-20 border border-white/10">
                  <Folder className="w-20 h-20 mx-auto mb-4 opacity-50 text-gray-600" />
                  <p className="text-gray-400 text-lg">Select a collection to view its contents</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold gradient-text-primary">Create Collection</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionName('');
                  setNewCollectionDesc('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., React Dashboards"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="What's this collection for?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderPlus className="w-5 h-5" />
                <span>Create Collection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold gradient-text-primary">Edit Collection</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setNewCollectionName('');
                  setNewCollectionDesc('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., React Dashboards"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="What's this collection for?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={updateCollection}
                disabled={!newCollectionName.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
