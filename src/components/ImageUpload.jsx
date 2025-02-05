// src/components/ImageUpload.jsx
import  { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // Adjust the path according to your project structure

const ImageUpload = ({ onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const { token } = useAuth();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response.data);
      toast.success('Image upload confirmed by backend');
      // Call the callback function if provided
      onImageUpload && onImageUpload(response.data.filename);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data.message || 'Failed to confirm image upload with backend');
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <div className="mb-3">
        <label htmlFor="imageUpload" className="form-label">Upload Image</label>
        <input 
          type="file" 
          className="form-control" 
          id="imageUpload" 
          onChange={handleFileChange} 
          required 
        />
      </div>
      <button type="submit" className="btn btn-primary">Upload</button>
    </form>
  );
};

export default ImageUpload;