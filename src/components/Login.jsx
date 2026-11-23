import { useState } from 'react';
import apiClient from '../api/client';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGallery } from '../context/GalleryContext';
import { isAdmin } from '../utils/roles';
import { toast } from 'react-toastify';
import PasswordVisibilityToggle from './PasswordVisibilityToggle';

const Login = () => {
  const { gallery } = useGallery();
  const [searchParams] = useSearchParams();
  const justCreated = searchParams.get('created') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLocked(false);
    setSubmitting(true);

    try {
      const response = await apiClient.post('/login', { email, password });
      login(response.data.member, response.data.access_token, response.data.refresh_token);
      toast.success('Login successful!');
      if (isAdmin(response.data.member)) {
        navigate('/artworks');
      } else {
        navigate('/');
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Invalid email or password. Please try again.';

      if (status === 403 && message.toLowerCase().includes('temporarily locked')) {
        setLocked(true);
      } else {
        setLocked(false);
      }
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="container mt-5">
      <div className="login-form">
        <h2 className="mb-4">Log in{gallery ? ` to ${gallery.name}` : ''}</h2>
        {justCreated && (
          <div className="alert alert-success">
            Your account has been created! Please log in.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword((prev) => !prev)} />
            </div>
          </div>
          {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
          <p className="mb-3">
            <Link to="/forgot-password" className="small text-muted">Forgot password?</Link>
          </p>
          {locked && (
            <div className="mb-3">
              <Link to="/login/unlock" state={{ email }} className="small">
                Unlock your account
              </Link>
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="mt-3">
          Do not have an account? <Link to="/sign-up" className="small text-muted">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;