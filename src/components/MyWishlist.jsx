import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { imageUrl } from '../utils/images';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.wishlist);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRemove = async (artworkId) => {
    try {
      await apiClient.delete(`/wishlist/${artworkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Removed from wishlist');
      setWishlist((prev) => prev.filter((a) => a.id !== artworkId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <h1 className="display-4 mb-4">My Wishlist</h1>
      {wishlist.length === 0 && (
        <p>Your wishlist is empty. Browse artworks and add some!</p>
      )}
      <div className="row">
        {wishlist.map((artwork) => (
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
                <Link to={`/artworks/${artwork.id}`} className="btn btn-primary me-2">View Details</Link>
                <button className="btn btn-outline-danger" onClick={() => handleRemove(artwork.id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyWishlist;