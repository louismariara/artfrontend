import  { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ArtworkList = () => {
const [artworks, setArtworks] = useState([]);
// eslint-disable-next-line no-unused-vars
const [error, setError] = useState(null);
const { token } = useAuth();
  

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await axios.get('/artworks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setArtworks(response.data.artworks);
        setError(null);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch artworks');
        toast.error('Failed to fetch artworks');
      }
    };
    fetchArtworks();
  }, [token]);

  return (
    <div className="container mt-4">
      <h1 className="display-4">Artworks</h1>
      <div className="row">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{artwork.title}</h5>
                <p className="card-text">By: {artwork.artist}</p>
                <Link to={`/artworks/${artwork.id}`} className="btn btn-primary">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtworkList;