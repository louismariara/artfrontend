import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { imageUrl } from '../utils/images';
import { formatPrice, priceFieldLabel } from '../utils/money';
import { useAuth } from '../context/AuthContext';
import { useGallery } from '../context/GalleryContext';
import { toast } from 'react-toastify';
import ImageUpload from './ImageUpload';

const MyArtwork = () => {
  const { token, user } = useAuth();
  const { gallery } = useGallery();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    title: '', artist: '', medium: '', dimensions: '', condition: '', price: '', category: '',
    location: '', theme: '', image_path: '', description: ''
  });

  const [filter, setFilter] = useState('all'); // 'all' | 'owner' | 'collaborator'
  const [searchTerm, setSearchTerm] = useState('');

  const [expandedArtworkId, setExpandedArtworkId] = useState(null);
  const [collaboratorsByArtwork, setCollaboratorsByArtwork] = useState({});
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');

  const fetchMyArtworks = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/my-artworks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArtworks(response.data.artworks);
    } catch (error) {
      console.error('Error fetching my artworks:', error);
      toast.error('Failed to fetch your artworks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const response = await apiClient.get('/members/eligible-collaborators', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching members list:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyArtworks();
      fetchAllMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArtwork((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddArtwork = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/artworks', newArtwork, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork added successfully');
      setNewArtwork({
        title: '', artist: '', medium: '', dimensions: '', condition: '', price: '', category: '',
        location: '', theme: '', image_path: '', description: ''
      });
      setShowAddForm(false);
      fetchMyArtworks();
    } catch (error) {
      console.error('Error adding artwork:', error);
      toast.error(error.response?.data?.message || 'Failed to add artwork');
    }
  };

  const handleDeleteArtwork = async (id) => {
    if (!window.confirm('Delete this artwork? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork deleted successfully');
      fetchMyArtworks();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error(error.response?.data?.message || 'Failed to delete artwork');
    }
  };

  const fetchCollaborators = async (artworkId) => {
    setCollaboratorLoading(true);
    try {
      const response = await apiClient.get(`/artworks/${artworkId}/collaborators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollaboratorsByArtwork((prev) => ({ ...prev, [artworkId]: response.data.collaborators }));
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to fetch collaborators');
    } finally {
      setCollaboratorLoading(false);
    }
  };

  const toggleCollaboratorPanel = (artworkId) => {
    if (expandedArtworkId === artworkId) {
      setExpandedArtworkId(null);
      return;
    }
    setExpandedArtworkId(artworkId);
    setSelectedMemberToAdd('');
    fetchCollaborators(artworkId);
  };

  const handleAddCollaborator = async (artworkId) => {
    if (!selectedMemberToAdd) return;
    try {
      const response = await apiClient.post(
        `/artworks/${artworkId}/collaborators`,
        { member_id: Number(selectedMemberToAdd) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setSelectedMemberToAdd('');
      fetchCollaborators(artworkId);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error(error.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (artworkId, memberId) => {
    try {
      const response = await apiClient.delete(`/artworks/${artworkId}/collaborators/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      fetchCollaborators(artworkId);
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error(error.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const getEligibleMembers = (artwork) => {
    const currentCollaboratorIds = (collaboratorsByArtwork[artwork.id] || []).map((c) => c.member_id);
    return allMembers.filter((m) =>
      m.id !== artwork.member_id &&
      !currentCollaboratorIds.includes(m.id)
    );
  };

  const visibleArtworks = useMemo(() => {
    return artworks.filter((a) => {
      if (filter !== 'all' && a.my_role !== filter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        return a.title?.toLowerCase().includes(term) || a.artist?.toLowerCase().includes(term);
      }
      return true;
    });
  }, [artworks, filter, searchTerm]);

  const ownedCount = artworks.filter((a) => a.my_role === 'owner').length;
  const collaboratorCount = artworks.filter((a) => a.my_role === 'collaborator').length;

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="display-4 mb-0">My Artwork</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Cancel' : 'Add Artwork'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddArtwork} className="card p-4 mb-4">
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input type="text" className="form-control" id="title" name="title" value={newArtwork.title} onChange={handleInputChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="artist" className="form-label">Artist</label>
            <input type="text" className="form-control" id="artist" name="artist" value={newArtwork.artist} onChange={handleInputChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="medium" className="form-label">Medium</label>
            <input type="text" className="form-control" id="medium" name="medium" value={newArtwork.medium} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="dimensions" className="form-label">Dimensions</label>
            <input type="text" className="form-control" id="dimensions" name="dimensions" value={newArtwork.dimensions} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="condition" className="form-label">Condition</label>
            <select className="form-select" id="condition" name="condition" value={newArtwork.condition} onChange={handleInputChange}>
              <option value="">Select...</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input type="text" className="form-control" id="location" name="location" value={newArtwork.location} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="theme" className="form-label">Theme</label>
            <input type="text" className="form-control" id="theme" name="theme" value={newArtwork.theme} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="price" className="form-label">{priceFieldLabel(gallery?.currency)}</label>
            <input type="number" step="0.01" min="0" className="form-control" id="price" name="price" value={newArtwork.price} onChange={handleInputChange} placeholder="Leave blank if it is not for sale" />
          </div>
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <input type="text" className="form-control" id="category" name="category" value={newArtwork.category} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Image</label>
            <ImageUpload
              onImageUpload={(filename) => setNewArtwork((prev) => ({ ...prev, image_path: filename }))}
            />
            {newArtwork.image_path && (
              <p className="small text-muted mt-1">Image ready: {newArtwork.image_path}</p>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea className="form-control" id="description" name="description" rows="3" value={newArtwork.description} onChange={handleInputChange} />
          </div>
          <button type="submit" className="btn btn-success">Submit</button>
        </form>
      )}

      <div className="card p-3 mb-4">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All ({artworks.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'owner' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('owner')}
            >
              Owned ({ownedCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'collaborator' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('collaborator')}
            >
              Collaborating ({collaboratorCount})
            </button>
          </div>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by title or artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '260px' }}
          />
        </div>
      </div>

      {visibleArtworks.length === 0 ? (
        <p className="text-center mt-5">
          {artworks.length === 0 ? "You haven't added any artwork yet." : 'No artwork matches your filter.'}
        </p>
      ) : (
        <div className="row">
          {visibleArtworks.map((artwork) => (
            <div key={artwork.id} className="col-md-4 mb-4">
              <div className="card">
                {artwork.image_path && (
                  <img
                    src={imageUrl(artwork.image_path)}
                    className="card-img-top"
                    alt={artwork.title}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="card-title mb-0">{artwork.title}</h5>
                    <span className={`badge ${artwork.my_role === 'owner' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {artwork.my_role === 'owner' ? 'Owner' : 'Collaborator'}
                    </span>
                  </div>
                  <p className="card-text mb-1">By: {artwork.artist}</p>
                  <p className="card-text fw-semibold">{formatPrice(artwork.price, gallery?.currency) ?? 'Price on request'}</p>
                  <div className="mb-2">
                    <button className="btn btn-primary btn-sm me-2" onClick={() => navigate(`/artworks/${artwork.id}`)}>Edit</button>
                    {artwork.my_role === 'owner' && (
                      <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteArtwork(artwork.id)}>Delete</button>
                    )}
                    {artwork.my_role === 'owner' && (
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => toggleCollaboratorPanel(artwork.id)}>
                        {expandedArtworkId === artwork.id ? 'Hide Collaborators' : 'Collaborators'}
                      </button>
                    )}
                  </div>

                  {expandedArtworkId === artwork.id && artwork.my_role === 'owner' && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      {collaboratorLoading ? (
                        <p className="small text-muted mb-2">Loading collaborators...</p>
                      ) : (
                        <ul className="list-unstyled mb-2">
                          {(collaboratorsByArtwork[artwork.id] || []).length === 0 ? (
                            <li className="small text-muted">No collaborators yet.</li>
                          ) : (
                            collaboratorsByArtwork[artwork.id].map((collab) => (
                              <li key={collab.member_id} className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small">{collab.name}</span>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveCollaborator(artwork.id, collab.member_id)}
                                >
                                  Remove
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                      <div className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          value={selectedMemberToAdd}
                          onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                        >
                          <option value="">Select a curator or admin...</option>
                          {getEligibleMembers(artwork).map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={!selectedMemberToAdd}
                          onClick={() => handleAddCollaborator(artwork.id)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyArtwork;