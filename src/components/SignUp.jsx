import { useState } from 'react';
import apiClient from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGallery } from '../context/GalleryContext';
import PasswordVisibilityToggle from './PasswordVisibilityToggle';

const validate = ({ name, email, password }) => {
  const errors = {};
  if (!name || !name.trim()) {
    errors.name = 'Name is required';
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.password = 'Password needs an uppercase letter, a lowercase letter, a number, and a special character';
  }
  return errors;
};

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { gallery } = useGallery();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate({ name, email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await apiClient.post('/sign-up', { name, email, password });
      toast.success('Account created! Please log in.');
      navigate('/login', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(message);
      setFieldErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '480px' }}>
      <div className="signup-form">
        <h2 className="mb-4">Join {gallery?.name}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword((prev) => !prev)} />
            </div>
            {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}
            <div className="form-text">At least 8 characters, with uppercase, lowercase, a number, and a special character.</div>
          </div>
          {fieldErrors.form && <div className="alert alert-danger">{fieldErrors.form}</div>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-3">
          Already have an account? <Link to="/login" className="small text-muted">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;