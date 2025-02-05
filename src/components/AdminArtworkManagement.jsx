import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminArtworkManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    title: '',
    artist: '',
    medium: '',
    dimensions: '',
    condition: '',
    location: '',
    theme: '',
    image_path: '',
    description: ''
  });

  // Function to fetch artworks from the server
  const fetchArtworks = async () => {
    try {
      const response = await axios.get('https://artbackend-1.onrender.com/artworks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArtworks(response.data.artworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to fetch artworks');
    }
  };

  // useEffect hook to fetch artworks when the component mounts or when token changes
  useEffect(() => {
    fetchArtworks();
  }, [token]);

  // Function to handle adding a new artwork
  const handleAddArtwork = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://artbackend-1.onrender.com/artworks', newArtwork, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork added successfully');
      setNewArtwork({
        title: '',
        artist: '',
        medium: '',
        dimensions: '',
        condition: '',
        location: '',
        theme: '',
        image_path: '',
        description: ''
      });
      setShowAddForm(false);
      // Refetch artworks to update the list
      await fetchArtworks();
    } catch (error) {
      console.error('Error adding artwork:', error);
      toast.error('Failed to add artwork');
    }
  };

  // Function to handle deleting an artwork
  const handleDeleteArtwork = async (id) => {
    try {
      await axios.delete(`https://artbackend-1.onrender.com/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork deleted successfully');
      // Refetch artworks to update the list
      await fetchArtworks();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  // Function to handle updating an artwork
  const handleUpdateArtwork = async (id, updatedData) => {
    try {
      await axios.put(`https://artbackend-1.onrender.com/artworks/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork updated successfully');
      // Refetch artworks to update the list
      await fetchArtworks();
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork');
    }
  };

  // Function to toggle the visibility of the add form
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  // Function to handle changes in the form inputs for adding a new artwork
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArtwork(prevState => ({
      ...prevState,
      [name]: value
    }));
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
        <form onSubmit={handleAddArtwork} className="mb-4">
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
            <input type="text" className="form-control" id="condition" name="condition" value={newArtwork.condition} onChange={handleInputChange} />
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
            <label htmlFor="image_path" className="form-label">Image Path</label>
            <input type="text" className="form-control" id="image_path" name="image_path" value={newArtwork.image_path} onChange={handleInputChange} />
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
                <img src={`/${artwork.image_path}`} className="card-img-top" alt={artwork.title} />
                <div className="card-body">
                  <h5 className="card-title">{artwork.title}</h5>
                  <p className="card-text">By: {artwork.artist}</p>
                  <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteArtwork(artwork.id)}>Delete</button>
                  <button className="btn btn-primary btn-sm" onClick={() => {navigate(`/admin/edit-artwork/${artwork.id}`);
                  }}>Edit</button>
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