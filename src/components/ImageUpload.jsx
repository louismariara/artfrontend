/* eslint-disable react/prop-types */
// src/components/ImageUpload.jsx
import { useState } from 'react';
import apiClient from '../api/client';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Not a <form> on purpose: this sits inside the artwork form, and a form inside
// a form makes "Upload" also submit the artwork before the picture is ready.
const ImageUpload = ({ onImageUpload, label = 'Upload Image', inputId = 'imageUpload' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Choose an image first');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      const response = await apiClient.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Image uploaded');
      onImageUpload && onImageUpload(response.data.filename);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-3">
      <label htmlFor={inputId} className="form-label">{label}</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="form-control mb-2"
        id={inputId}
        onChange={handleFileChange}
      />
      <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default ImageUpload;