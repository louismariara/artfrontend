import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateArtwork = () => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    medium: '',
    dimensions: '',
    condition: '',
    location: '',
    theme: '',
    description: ''
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://artbackend-1.onrender.com/artworks', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork created successfully');
      console.log('Artwork created:', response.data);
      // Optionally, you can redirect to the list of artworks or the detail page of the new artwork
      navigate('/artworks');
    } catch (error) {
      console.error('Error creating artwork:', error);
      toast.error('Failed to create artwork');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="display-4">Create New Artwork</h1>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input type="text" className="form-control" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        {/* Repeat similar blocks for other fields like artist, medium, etc. */}
        <button type="submit" className="btn btn-primary">Create Artwork</button>
      </form>
    </div>
  );
};

export default CreateArtwork;