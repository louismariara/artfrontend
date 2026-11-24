import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { imageUrl } from '../utils/images';
import { useGallery } from '../context/GalleryContext';
import WorkCaption from './WorkCaption';

const PublicArtwork = () => {
  const { id } = useParams();
  const { slug } = useGallery();
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await apiClient.get(`/public/artworks/${id}`, { params: { slug } });
        if (!cancelled) setArtwork(data.artwork);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Artwork not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, slug]);

  useEffect(() => {
    if (!artwork || window.location.hash !== '#inquire') return;
    document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [artwork]);

  const ask = async (event) => {
    event.preventDefault();
    setFormError(null);
    setSending(true);
    try {
      await apiClient.post(`/public/artworks/${id}/inquire`, { name, email, message }, { params: { slug } });
      setSent(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'The question could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-warning text-center mt-5">{error}</div>;
  if (!artwork) return null;

  return (
    <div className="container mt-4">
      <p><Link to="/">Back to the gallery</Link></p>
      <article className="work-lead">
        {artwork.image_path && (
          <img
            src={imageUrl(artwork.image_path)}
            alt={artwork.title}
            onError={(event) => { event.target.style.display = 'none'; }}
          />
        )}
        <div>
          <WorkCaption artwork={artwork} heading="h1" />
          {artwork.description && <p className="work-medium">{artwork.description}</p>}
          {artwork.category && <p className="work-medium">{artwork.category}</p>}
        </div>
      </article>

      <section id="inquire" className="inquire">
        <h2 className="work-title">Ask about this work</h2>
        <p className="work-medium">Send a question to the gallery. You do not need an account.</p>
        {sent ? (
          <p>The gallery has your question.</p>
        ) : (
          <form onSubmit={ask} className="inquire-form">
            <label htmlFor="inquire-name">Your name</label>
            <input id="inquire-name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
            <label htmlFor="inquire-email">Email</label>
            <input id="inquire-email" type="email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={200} />
            <label htmlFor="inquire-message">Question</label>
            <textarea id="inquire-message" className="form-control" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} required minLength={10} maxLength={800} />
            {formError && <div className="alert alert-warning">{formError}</div>}
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Send question'}
            </button>
          </form>
        )}
        <p className="work-medium mt-3">Log in to save this work or leave a comment.</p>
      </section>
    </div>
  );
};

export default PublicArtwork;
