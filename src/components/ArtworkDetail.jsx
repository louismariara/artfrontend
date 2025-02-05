// src/components/ArtworkDetail.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ImageUpload from './ImageUpload'; // Import the new component

const ArtworkDetail = () => {
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedArtworkData, setUpdatedArtworkData] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle image upload
  const handleImageUpload = (filename) => {
    // Update the artwork state with the new image path
    setUpdatedArtworkData(prevData => ({ ...prevData, image_path: filename }));
    toast.info('Image path updated. Save changes to apply.');
  };

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(`/artworks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setArtwork(response.data.artwork);
        setUpdatedArtworkData(response.data.artwork);
        setError(null);
      } catch (error) {
        console.error('Error fetching artwork:', error);
        setError('Failed to fetch artwork details');
        toast.error('Failed to fetch artwork details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchArtwork();
    } else {
      setLoading(false);
    }
  }, [id, token]);

  if (!token) {
    toast.info(location.state?.message || "Please log in or sign up to view artwork details.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedArtworkData({ ...updatedArtworkData, [name]: value });
  };

  const handleUpdateArtwork = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/artworks/${id}`, updatedArtworkData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArtwork(response.data.artwork);
      setIsEditing(false);
      toast.success('Artwork updated successfully');
      console.log('Artwork updated:', response.data);
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork');
    }
  };

  const handleDeleteArtwork = async () => {
    try {
      await axios.delete(`/api/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork deleted successfully');
      console.log('Artwork deleted');
      navigate('/artworks');
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;
  if (!artwork) return <div className="alert alert-warning text-center mt-5">Artwork not found</div>;

  return (
    <div className="container mt-4">
      <h1 className="display-4">{artwork.title}</h1>
      <p className="lead">By: {artwork.artist}</p>
      
      {!isEditing ? (
        <dl className="row">
          <dt className="col-sm-3">Medium</dt>
          <dd className="col-sm-9">{artwork.medium}</dd>
          <dt className="col-sm-3">Dimensions</dt>
          <dd className="col-sm-9">{artwork.dimensions}</dd>
          <dt className="col-sm-3">Condition</dt>
          <dd className="col-sm-9">{artwork.condition}</dd>
          <dt className="col-sm-3">Location</dt>
          <dd className="col-sm-9">{artwork.location}</dd>
          <dt className="col-sm-3">Theme</dt>
          <dd className="col-sm-9">{artwork.theme}</dd>
          <dt className="col-sm-3">Description</dt>
          <dd className="col-sm-9">{artwork.description}</dd>
        </dl>
      ) : (
        <form onSubmit={handleUpdateArtwork}>
          <div className="mb-3">
            <label htmlFor="medium" className="form-label">Medium</label>
            <input 
              type="text" 
              className="form-control" 
              id="medium" 
              name="medium" 
              value={updatedArtworkData.medium} 
              onChange={handleChange} 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea 
              className="form-control" 
              id="description" 
              name="description" 
              value={updatedArtworkData.description} 
              onChange={handleChange} 
            />
          </div>
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}

      <div className="mt-4">
        {!isEditing && (
          <>
            <button className="btn btn-warning me-2" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="btn btn-danger" onClick={handleDeleteArtwork}>Delete</button>
          </>
        )}
      </div>

      <div className="mt-4">
        <ImageUpload onImageUpload={handleImageUpload} />
      </div>

      <div className="mt-4">
        <Link to="/artworks" className="btn btn-outline-secondary">Back to Artworks</Link>
      </div>
    </div>
  );
};

export default ArtworkDetail;