import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { imageUrl } from '../utils/images';
import { useGallery } from '../context/GalleryContext';

// The gallery's public front page: its most-viewed artworks, visible to
// everyone with no login. Uses /public/artworks, which returns display fields only.
const Home = () => {
  const { slug, gallery } = useGallery();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchArtworks = async () => {
      try {
        const response = await apiClient.get('/public/artworks', { params: { slug } });
        if (!cancelled) {
          setArtworks(response.data.artworks || []);
          setError(false);
        }
      } catch (err) {
        console.error('Could not load public artworks:', err.response?.data || err.message);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchArtworks();
    return () => {
      cancelled = true;
    };
  }, [slug]);


  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4 on-photo">
      <h1 className="display-4 text-center mb-4">{gallery?.name || 'Art Collection'}</h1>
      {error && <div className="alert alert-warning text-center">Could not load artworks. Please try again later.</div>}
      {!error && artworks.length === 0 && (
        <p className="text-center text-muted">No artworks have been added to this gallery yet.</p>
      )}
      <div className="row">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="col-md-3 mb-4">
            <div className="card artwork-card small-box">
              <img
                src={imageUrl(artwork.image_path)}
                className="card-img-top artwork-image"
                alt={artwork.title}
                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
              />
              <div className="card-body">
                <h5 className="card-title">{artwork.title}</h5>
                <p className="card-text">By: {artwork.artist}</p>
                <Link to={`/artworks/${artwork.id}`} className="btn btn-link p-0">More Information</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;