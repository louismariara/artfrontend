import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { imageUrl } from '../utils/images';
import { useGallery } from '../context/GalleryContext';
import WorkCaption from './WorkCaption';

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

  const [lead, ...rest] = artworks;

  return (
    <div className="container mt-4 on-photo">
      <p className="work-artist">{gallery?.name || 'Art Collection'}</p>
      {error && <div className="alert alert-warning text-center">Could not load artworks. Please try again later.</div>}
      {!error && artworks.length === 0 && (
        <p className="text-muted">No artworks have been added to this gallery yet.</p>
      )}
      {lead && (
        <article className="work-lead">
          <img
            src={imageUrl(lead.image_path)}
            alt={lead.title}
            onError={(event) => { event.target.onerror = null; event.target.src = '/placeholder.jpg'; }}
          />
          <div>
            <WorkCaption artwork={lead} />
            <p className="work-actions">
              <Link to={`/artworks/${lead.id}`}>View</Link>
              <Link to={`/artworks/${lead.id}#inquire`}>Ask about this work</Link>
            </p>
          </div>
        </article>
      )}
      {rest.length > 0 && (
        <div className="work-grid">
          {rest.map((artwork) => (
            <article key={artwork.id}>
              <Link to={`/artworks/${artwork.id}`}>
                <img
                  src={imageUrl(artwork.image_path)}
                  alt={artwork.title}
                  onError={(event) => { event.target.onerror = null; event.target.src = '/placeholder.jpg'; }}
                />
              </Link>
              <WorkCaption artwork={artwork} heading="h3" />
              <Link to={`/artworks/${artwork.id}#inquire`}>Ask about this work</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
