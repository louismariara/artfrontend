import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../api/client';
import { galleryAddress } from '../utils/gallery';
import PasswordVisibilityToggle from '../components/PasswordVisibilityToggle';

// Same rule as the backend's is_valid_slug: 3-50 chars, a-z 0-9 with single
// hyphens between them, none at the start or end.
const SLUG_PATTERN = /^(?=.{3,50}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugFromName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');

const SLUG_MESSAGES = {
  checking: { className: 'text-muted', text: 'Checking...' },
  available: { className: 'text-success', text: 'This address is available.' },
  taken: { className: 'text-danger', text: 'This address is already taken.' },
  reserved: { className: 'text-danger', text: 'This address is reserved. Choose another.' },
  invalid: {
    className: 'text-danger',
    text: 'Use 3-50 characters: lowercase letters, numbers and single hyphens (not at the start or end).'
  },
  error: { className: 'text-danger', text: 'Could not check the address. Try again.' },
};

const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return 'Password needs an uppercase letter, a lowercase letter, a number, and a special character';
  }
  return null;
};

const CreateGallery = () => {
  const [galleryName, setGalleryName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState('idle');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleGalleryNameChange = (value) => {
    setGalleryName(value);
    // Suggest an address from the name until the person types their own.
    if (!slugEdited) setSlug(slugFromName(value));
  };

  // Ask the backend whether the address is free (after a short pause in typing).
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle');
      return;
    }
    if (!SLUG_PATTERN.test(slug)) {
      setSlugStatus('invalid');
      return;
    }
    setSlugStatus('checking');
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data } = await apiClient.get('/gallery-info', { params: { slug } });
        if (cancelled) return;
        if (data.available) setSlugStatus('available');
        else if (data.exists) setSlugStatus('taken');
        else if (data.reason === 'reserved') setSlugStatus('reserved');
        else setSlugStatus('invalid');
      } catch {
        if (!cancelled) setSlugStatus('error');
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!galleryName.trim()) found.galleryName = 'Gallery name is required';
    if (slugStatus !== 'available') found.slug = 'Choose an available gallery address';
    if (!adminName.trim()) found.adminName = 'Your name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) found.email = 'Enter a valid email address';
    const passwordError = validatePassword(password);
    if (passwordError) found.password = passwordError;
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await apiClient.post(
        '/sign-up',
        {
          name: adminName.trim(),
          email,
          password,
          gallery_name: galleryName.trim(),
          gallery_slug: slug,
        },
        { skipOrgSlug: true } // creating a new gallery, not joining one
      );
      toast.success('Your gallery is ready!');
      window.location.assign(`${galleryAddress(slug)}/login?created=1`);
    } catch (error) {
      const message =
        error.response?.status === 429
          ? 'Too many galleries have been created from this network recently. Please try again later.'
          : error.response?.data?.message || 'Could not create the gallery. Please try again.';
      toast.error(message);
      setErrors({ form: message });
      setSubmitting(false);
    }
  };

  const slugMessage = SLUG_MESSAGES[slugStatus];

  return (
    <div className="container mt-5 on-photo" style={{ maxWidth: '520px' }}>
      <h2 className="mb-4">Create your gallery</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="galleryName" className="form-label">Gallery name</label>
          <input
            type="text"
            id="galleryName"
            className={`form-control ${errors.galleryName ? 'is-invalid' : ''}`}
            value={galleryName}
            onChange={(e) => handleGalleryNameChange(e.target.value)}
          />
          {errors.galleryName && <div className="invalid-feedback">{errors.galleryName}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="slug" className="form-label">Gallery address</label>
          <input
            type="text"
            id="slug"
            className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase());
            }}
          />
          <div className="form-text">Your gallery will live at {galleryAddress(slug || 'your-address')}</div>
          {slugMessage && <div className={`small ${slugMessage.className}`}>{slugMessage.text}</div>}
          {errors.slug && <div className="text-danger small">{errors.slug}</div>}
        </div>

        <hr />
        <p className="text-muted">This will be the gallery&apos;s first administrator account.</p>

        <div className="mb-3">
          <label htmlFor="adminName" className="form-label">Your name</label>
          <input
            type="text"
            id="adminName"
            className={`form-control ${errors.adminName ? 'is-invalid' : ''}`}
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
          />
          {errors.adminName && <div className="invalid-feedback">{errors.adminName}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="password-field-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword((prev) => !prev)} />
          </div>
          {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
          <div className="form-text">At least 8 characters, with uppercase, lowercase, a number, and a special character.</div>
        </div>

        {errors.form && <div className="alert alert-danger">{errors.form}</div>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create gallery'}
        </button>
      </form>
      <p className="mt-3">
        <Link to="/" className="small text-muted">Back</Link>
      </p>
    </div>
  );
};

export default CreateGallery;