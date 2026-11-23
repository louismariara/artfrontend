import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { imageUrl } from '../utils/images';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ImageUpload from './ImageUpload';

const AdminArtworkManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    title: '', artist: '', medium: '', dimensions: '', condition: '', price: '', category: '',
    location: '', theme: '', image_path: '', description: ''
  });

  // Collaborator panel state, keyed by artwork id
  const [expandedArtworkId, setExpandedArtworkId] = useState(null);
  const [collaboratorsByArtwork, setCollaboratorsByArtwork] = useState({});
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');

  const fetchArtworks = async () => {
    try {
      const response = await apiClient.get('/artworks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArtworks(response.data.artworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to fetch artworks');
    }
  };

  // Only curators and admins are eligible collaborators per the backend rule,
  // so we fetch the member list once and filter it client-side per artwork.
  const fetchAllMembers = async () => {
    try {
      const response = await apiClient.get('/members/eligible-collaborators', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
      // Non-fatal — collaborator management just won't have a member list to pick from.
    }
  };

  useEffect(() => {
    fetchArtworks();
    fetchAllMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
      await fetchArtworks();
    } catch (error) {
      console.error('Error adding artwork:', error);
      toast.error('Failed to add artwork');
    }
  };

  const handleDeleteArtwork = async (id) => {
    try {
      await apiClient.delete(`/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork deleted successfully');
      await fetchArtworks();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArtwork(prevState => ({ ...prevState, [name]: value }));
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

  const getEligibleMembersForArtwork = (artwork) => {
    const currentCollaboratorIds = (collaboratorsByArtwork[artwork.id] || []).map((c) => c.member_id);
    return allMembers.filter((m) =>
      m.id !== artwork.member_id &&           // not the owner
      !currentCollaboratorIds.includes(m.id)  // not already a collaborator
    );
  };

  return (
    <div className="container mt-4">
      <h1 className="display-4 text-center mb-4">Admin Artwork Management</h1>
      <div className="d-flex justify-content-center mb-4">
        <button className="btn btn-primary" onClick={toggleAddForm}>
          {showAddForm ? 'Hide Add Form' : 'Add Artwork'}
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
            <label htmlFor="price" className="form-label">Price</label>
            <input type="number" step="0.01" className="form-control" id="price" name="price" value={newArtwork.price} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <input type="text" className="form-control" id="category" name="category" value={newArtwork.category} onChange={handleInputChange} />
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
            <textarea className="form-control" id="description" name="description" value={newArtwork.description} onChange={handleInputChange} rows="3"></textarea>
          </div>
          <button type="submit" className="btn btn-success">Submit</button>
        </form>
      )}

      <h2 className="mt-5">Current Artworks</h2>
      <div className="row">
        {Array.isArray(artworks) && artworks.length > 0 ? (
          artworks.map((artwork) => (
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
                  <h5 className="card-title">{artwork.title}</h5>
                  <p className="card-text">By: {artwork.artist}</p>
                  <p className="card-text small text-muted">Owner: {artwork.uploaded_by || 'Unknown'}</p>
                  <div className="mb-2">
                    <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteArtwork(artwork.id)}>Delete</button>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => { navigate(`/artworks/${artwork.id}`); }}>Edit</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => toggleCollaboratorPanel(artwork.id)}>
                      {expandedArtworkId === artwork.id ? 'Hide Collaborators' : 'Collaborators'}
                    </button>
                  </div>

                  {expandedArtworkId === artwork.id && (
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
                          {getEligibleMembersForArtwork(artwork).map((m) => (
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
          ))
        ) : (
          <p className="text-center mt-5">No artworks to display or an error occurred.</p>
        )}
      </div>
    </div>
  );
};

export default AdminArtworkManagement;