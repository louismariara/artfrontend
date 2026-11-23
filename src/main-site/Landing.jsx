import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { galleryAddress } from '../utils/gallery';
import { PRODUCT_NAME, TAGLINE } from './brand';

// People may paste a whole address; keep only the gallery part ("acme").
const cleanAddress = (value) =>
  value.trim().toLowerCase().replace(/^https?:\/\//, '').split(/[./:]/)[0];

const Landing = () => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleGo = async (e) => {
    e.preventDefault();
    setError(null);
    const slug = cleanAddress(address);
    if (!slug) {
      setError('Type your gallery address, for example: acme');
      return;
    }
    setChecking(true);
    try {
      const { data } = await apiClient.get('/gallery-info', { params: { slug } });
      if (!data.exists) {
        setError(`There is no gallery with the address "${slug}".`);
      } else if (data.status !== 'active') {
        setError('That gallery is currently suspended.');
      } else {
        window.location.assign(galleryAddress(data.slug));
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container mt-5 on-photo" style={{ maxWidth: '640px' }}>
      <h1 className="display-5 mb-3">{PRODUCT_NAME}</h1>
      <p className="lead">{TAGLINE}</p>
      <Link to="/create-gallery" className="btn btn-primary btn-lg mb-5">Create your gallery</Link>

      <h2 className="h5">Already have a gallery?</h2>
      <p className="text-muted">Type your gallery&apos;s address to go to it.</p>
      <form onSubmit={handleGo} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="your-gallery"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-label="Gallery address"
        />
        <button type="submit" className="btn btn-outline-primary" disabled={checking}>
          {checking ? 'Checking...' : 'Go'}
        </button>
      </form>
      {error && <div className="alert alert-warning mt-3">{error}</div>}
      <p className="mt-5 mb-0 small text-muted">
        <Link to="/platform/login">Platform sign in</Link>
      </p>
    </div>
  );
};

export default Landing;