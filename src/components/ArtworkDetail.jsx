import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { imageUrl } from '../utils/images';
import { useParams, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ImageUpload from './ImageUpload';
import { isAdmin } from '../utils/roles';
import { priceFieldLabel } from '../utils/money';
import { useGallery } from '../context/GalleryContext';
import WorkCaption from './WorkCaption';

const ArtworkDetail = () => {
  const { gallery } = useGallery();
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedArtworkData, setUpdatedArtworkData] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Activity log + comments — only fetched/shown for the owner or an admin,
  // matching the backend's exact permission rule for both endpoints.
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleImageUpload = (filename) => {
    setUpdatedArtworkData(prevData => ({ ...prevData, image_path: `uploads/${filename}` }));
    toast.info('Image path updated. Save changes to apply.');
  };

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await apiClient.get(`/artworks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setArtwork(response.data.artwork);
        setUpdatedArtworkData(response.data.artwork);
        setError(null);
      } catch (err) {
        console.error('Error fetching artwork:', err);
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

  const canViewActivityAndComments = artwork && user && (isAdmin(user) || artwork.member_id === user.id);

  useEffect(() => {
    if (!canViewActivityAndComments) return;

    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const response = await apiClient.get(`/artworks/${id}/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivity(response.data.activity);
      } catch (err) {
        console.error('Error fetching activity log:', err);
      } finally {
        setActivityLoading(false);
      }
    };

    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await apiClient.get(`/artworks/${id}/comments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComments(response.data.comments);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchActivity();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewActivityAndComments, id, token]);

  useEffect(() => {
    if (!artwork || !token) return;

    const checkWishlistStatus = async () => {
      try {
        const response = await apiClient.get('/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(response.data.wishlist.some((a) => a.id === artwork.id));
      } catch (err) {
        console.error('Error checking wishlist status:', err);
      }
    };

    checkWishlistStatus();
  }, [artwork, token]);

  const handleToggleWishlist = async () => {
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await apiClient.delete(`/wishlist/${artwork.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await apiClient.post('/wishlist', { artwork_id: artwork.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (!artwork || !user || isAdmin(user) || artwork.member_id === user.id) return;

    const checkCollaboratorStatus = async () => {
      try {
        const response = await apiClient.get(`/artworks/${id}/collaborators`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsCollaborator(response.data.collaborators.some((c) => c.member_id === user.id));
      } catch (err) {
        console.error('Error checking collaborator status:', err);
      }
    };

    checkCollaboratorStatus();
  }, [artwork, user, id, token]);

  const canModify = user && (isAdmin(user) || artwork?.member_id === user.id || isCollaborator);
  const canDelete = user && (isAdmin(user) || artwork?.member_id === user.id);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await apiClient.post(
        `/artworks/${id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      const response = await apiClient.get(`/artworks/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data.comments);
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!token) {
    toast.info(location.state?.message || 'Please log in or sign up to view artwork details.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedArtworkData({ ...updatedArtworkData, [name]: value });
  };

  const handleUpdateArtwork = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/artworks/${id}`, updatedArtworkData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArtwork(response.data.artwork);
      setIsEditing(false);
      toast.success('Artwork updated successfully');
    } catch (err) {
      console.error('Error updating artwork:', err);
      toast.error('Failed to update artwork');
    }
  };

  const handleDeleteArtwork = async () => {
    try {
      await apiClient.delete(`/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Artwork deleted successfully');
      navigate('/artworks');
    } catch (err) {
      console.error('Error deleting artwork:', err);
      toast.error('Failed to delete artwork');
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;
  if (!artwork) return <div className="alert alert-warning text-center mt-5">Artwork not found</div>;

  return (
    <div className="container mt-4">
      <div className="card p-4 mb-4">
        <WorkCaption artwork={artwork} heading="h1" />
      </div>

      {artwork.image_path && (
        <img
          src={imageUrl(artwork.image_path)}
          alt={artwork.title}
          className="img-fluid mb-3"
          style={{ maxHeight: '480px', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}

      <div className="card p-4 mb-4">
        {!isEditing ? (
          <dl className="row">
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
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={updatedArtworkData.title || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="artist" className="form-label">Artist</label>
              <input
                type="text"
                className="form-control"
                id="artist"
                name="artist"
                value={updatedArtworkData.artist || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="medium" className="form-label">Medium</label>
              <input
                type="text"
                className="form-control"
                id="medium"
                name="medium"
                value={updatedArtworkData.medium || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="dimensions" className="form-label">Dimensions</label>
              <input
                type="text"
                className="form-control"
                id="dimensions"
                name="dimensions"
                value={updatedArtworkData.dimensions || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="condition" className="form-label">Condition</label>
              <select
                className="form-select"
                id="condition"
                name="condition"
                value={updatedArtworkData.condition || ''}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                id="location"
                name="location"
                value={updatedArtworkData.location || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="theme" className="form-label">Theme</label>
              <input
                type="text"
                className="form-control"
                id="theme"
                name="theme"
                value={updatedArtworkData.theme || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="price" className="form-label">{priceFieldLabel(gallery?.currency)}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                id="price"
                name="price"
                value={updatedArtworkData.price ?? ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                id="category"
                name="category"
                value={updatedArtworkData.category || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={updatedArtworkData.description || ''}
                onChange={handleChange}
              />
            </div>
            <ImageUpload onImageUpload={handleImageUpload} />
            {updatedArtworkData.image_path !== artwork.image_path && (
              <p className="small text-muted">New image ready. Click Save Changes to apply it.</p>
            )}
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => { setUpdatedArtworkData(artwork); setIsEditing(false); }}
            >
              Cancel
            </button>
          </form>
        )}

        <div className="mt-4">
          {!isEditing && (
            <>
              {canModify && <button className="btn btn-warning me-2" onClick={() => setIsEditing(true)}>Edit</button>}
              {canDelete && <button className="btn btn-danger me-2" onClick={handleDeleteArtwork}>Delete</button>}
              <button
                className={`btn ${isWishlisted ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
              >
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </>
          )}
        </div>

        <div className="mt-4">
          <Link to="/artworks" className="btn btn-outline-secondary">Back to Artworks</Link>
        </div>
      </div>

      {canViewActivityAndComments && (
        <>
          <div className="card p-4 mb-4">
            <h5>Activity Log</h5>
            {activityLoading ? (
              <p className="small text-muted">Loading...</p>
            ) : activity.length === 0 ? (
              <p className="small text-muted">No activity recorded yet.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {activity.map((entry, idx) => (
                  <li key={idx} className="small mb-1">
                    <strong>{entry.member_name}</strong> {entry.action} — <span className="text-muted">{new Date(entry.timestamp).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-4 mb-4">
            <h5>Comments</h5>
            {commentsLoading ? (
              <p className="small text-muted">Loading...</p>
            ) : comments.length === 0 ? (
              <p className="small text-muted mb-3">No comments yet.</p>
            ) : (
              <ul className="list-unstyled mb-3">
                {comments.map((c) => (
                  <li key={c.id} className="mb-2">
                    <strong className="small">{c.member_name}</strong>{' '}
                    <span className="text-muted small">{new Date(c.created_at).toLocaleString()}</span>
                    <p className="mb-0">{c.content}</p>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleSubmitComment} className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-sm btn-primary" disabled={submittingComment || !newComment.trim()}>
                Post
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ArtworkDetail;