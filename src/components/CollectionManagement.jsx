import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { isAdmin, isAdminOrCurator } from '../utils/roles';

const CollectionManagement = () => {
  const { token, user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [allArtworks, setAllArtworks] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', theme: '' });

  const [expandedId, setExpandedId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedArtworkToAdd, setSelectedArtworkToAdd] = useState('');
  const [selectedCuratorToAdd, setSelectedCuratorToAdd] = useState('');

  const canCreateCollections = isAdminOrCurator(user);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [collectionsRes, artworksRes, membersRes] = await Promise.all([
        apiClient.get('/collections', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get('/artworks', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get('/members/eligible-collaborators', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { members: [] } }))
      ]);
      setCollections(collectionsRes.data.collections);
      setAllArtworks(artworksRes.data.artworks);
      setAllMembers(membersRes.data.members);
      setError(null);
    } catch (err) {
      console.error('Error fetching collections data:', err);
      setError('Failed to load collections');
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --- Permission helpers, mirroring the backend's rules exactly ---

  const isCoCurator = (collection) =>
    (collection.curators || []).some((c) => c.id === user?.id && !c.is_creator);

  const canManage = (collection) =>
    user && (isAdmin(user) || collection.curator_id === user.id || isCoCurator(collection));

  const canDelete = (collection) =>
    user && (isAdmin(user) || collection.curator_id === user.id);

  const canAddCoCurator = (collection) =>
    user && (isAdmin(user) || collection.curator_id === user.id);

  const canRemoveCoCurator = (collection, targetId) =>
    user && (isAdmin(user) || collection.curator_id === user.id || targetId === user.id);

  // --- Create ---

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/collections', newCollection, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      setNewCollection({ name: '', description: '', theme: '' });
      setShowCreateForm(false);
      fetchAll();
    } catch (err) {
      console.error('Error creating collection:', err);
      toast.error(err.response?.data?.message || 'Failed to create collection');
    }
  };

  // --- Expand / edit ---

  const toggleExpand = (collection) => {
    if (expandedId === collection.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(collection.id);
    setEditData({ name: collection.name, description: collection.description || '', theme: collection.theme || '' });
    setSelectedArtworkToAdd('');
    setSelectedCuratorToAdd('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      fetchAll();
    } catch (err) {
      console.error('Error updating collection:', err);
      toast.error(err.response?.data?.message || 'Failed to update collection');
    }
  };

  const handleDelete = async (collectionId) => {
    if (!window.confirm('Delete this collection? This cannot be undone.')) return;
    try {
      const response = await apiClient.delete(`/collections/${collectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      if (expandedId === collectionId) setExpandedId(null);
      fetchAll();
    } catch (err) {
      console.error('Error deleting collection:', err);
      toast.error(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  // --- Artworks ---

  const handleAddArtwork = async (collectionId) => {
    if (!selectedArtworkToAdd) return;
    try {
      const response = await apiClient.post(
        `/collections/${collectionId}/artworks`,
        { artwork_id: Number(selectedArtworkToAdd) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setSelectedArtworkToAdd('');
      fetchAll();
    } catch (err) {
      console.error('Error adding artwork to collection:', err);
      toast.error(err.response?.data?.message || 'Failed to add artwork');
    }
  };

  const handleRemoveArtwork = async (collectionId, artworkId) => {
    try {
      const response = await apiClient.delete(`/collections/${collectionId}/artworks/${artworkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      fetchAll();
    } catch (err) {
      console.error('Error removing artwork from collection:', err);
      toast.error(err.response?.data?.message || 'Failed to remove artwork');
    }
  };

  const getArtworksNotInCollection = (collection) => {
    const currentIds = (collection.artworks || []).map((a) => a.id);
    return allArtworks.filter((a) => !currentIds.includes(a.id));
  };

  // --- Co-curators ---

  const handleAddCoCurator = async (collectionId) => {
    if (!selectedCuratorToAdd) return;
    try {
      const response = await apiClient.post(
        `/collections/${collectionId}/curators`,
        { member_id: Number(selectedCuratorToAdd) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setSelectedCuratorToAdd('');
      fetchAll();
    } catch (err) {
      console.error('Error adding co-curator:', err);
      toast.error(err.response?.data?.message || 'Failed to add co-curator');
    }
  };

  const handleRemoveCoCurator = async (collectionId, memberId) => {
    try {
      const response = await apiClient.delete(`/collections/${collectionId}/curators/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      fetchAll();
    } catch (err) {
      console.error('Error removing co-curator:', err);
      toast.error(err.response?.data?.message || 'Failed to remove co-curator');
    }
  };

  const getEligibleCoCurators = (collection) => {
    const currentIds = (collection.curators || []).map((c) => c.id);
    return allMembers.filter((m) => !currentIds.includes(m.id));
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="display-4 mb-0">Collections</h1>
        {canCreateCollections && (
          <button className="btn btn-primary" onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? 'Cancel' : 'New Collection'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="card p-4 mb-4">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={newCollection.name}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="theme" className="form-label">Theme</label>
            <input
              type="text"
              className="form-control"
              id="theme"
              value={newCollection.theme}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, theme: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={newCollection.description}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-success">Create Collection</button>
        </form>
      )}

      {collections.length === 0 ? (
        <p className="text-center mt-5">No collections yet.</p>
      ) : (
        collections.map((collection) => (
          <div key={collection.id} className="card p-4 mb-3">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h4 className="mb-1">{collection.name}</h4>
                {collection.theme && <p className="text-muted small mb-1">Theme: {collection.theme}</p>}
                <p className="mb-1">{collection.description}</p>
                <p className="small text-muted mb-0">
                  Curators: {(collection.curators || []).map((c) => c.name).join(', ') || 'None'}
                  {' · '}
                  {(collection.artworks || []).length} artwork{(collection.artworks || []).length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="d-flex gap-2">
                {canManage(collection) && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleExpand(collection)}>
                    {expandedId === collection.id ? 'Close' : 'Manage'}
                  </button>
                )}
                {canDelete(collection) && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(collection.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>

            {expandedId === collection.id && canManage(collection) && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                {/* Edit details */}
                <h6>Edit Details</h6>
                <div className="row g-2 mb-2">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      name="name"
                      value={editData.name || ''}
                      onChange={handleEditChange}
                      placeholder="Name"
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      name="theme"
                      value={editData.theme || ''}
                      onChange={handleEditChange}
                      placeholder="Theme"
                    />
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-sm btn-primary w-100" onClick={() => handleSaveEdit(collection.id)}>
                      Save
                    </button>
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control form-control-sm"
                      name="description"
                      rows="2"
                      value={editData.description || ''}
                      onChange={handleEditChange}
                      placeholder="Description"
                    />
                  </div>
                </div>

                {/* Artworks */}
                <h6 className="mt-4">Artworks</h6>
                <ul className="list-unstyled mb-2">
                  {(collection.artworks || []).length === 0 ? (
                    <li className="small text-muted">No artworks in this collection yet.</li>
                  ) : (
                    collection.artworks.map((artwork) => (
                      <li key={artwork.id} className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small">{artwork.title} — {artwork.artist}</span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveArtwork(collection.id, artwork.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))
                  )}
                </ul>
                <div className="d-flex gap-2 mb-3">
                  <select
                    className="form-select form-select-sm"
                    value={selectedArtworkToAdd}
                    onChange={(e) => setSelectedArtworkToAdd(e.target.value)}
                  >
                    <option value="">Select an artwork...</option>
                    {getArtworksNotInCollection(collection).map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={!selectedArtworkToAdd}
                    onClick={() => handleAddArtwork(collection.id)}
                  >
                    Add
                  </button>
                </div>

                {/* Co-curators */}
                <h6 className="mt-4">Curators</h6>
                <ul className="list-unstyled mb-2">
                  {(collection.curators || []).map((c) => (
                    <li key={c.id} className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small">
                        {c.name} {c.is_creator && <span className="text-muted">(creator)</span>}
                      </span>
                      {!c.is_creator && canRemoveCoCurator(collection, c.id) && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveCoCurator(collection.id, c.id)}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {canAddCoCurator(collection) && (
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={selectedCuratorToAdd}
                      onChange={(e) => setSelectedCuratorToAdd(e.target.value)}
                    >
                      <option value="">Select a curator or admin...</option>
                      {getEligibleCoCurators(collection).map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={!selectedCuratorToAdd}
                      onClick={() => handleAddCoCurator(collection.id)}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CollectionManagement;