import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import platformClient from '../../api/platformClient';
import PasswordVisibilityToggle from '../../components/PasswordVisibilityToggle';
import { usePlatform } from './PlatformContext';

const PlatformLogin = () => {
  const { token, login } = usePlatform();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (token) return <Navigate to="/platform" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await platformClient.post('/login', { email, password });
      login(data.super_admin, data.access_token, data.refresh_token);
      navigate('/platform', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Could not sign in. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5 on-photo" style={{ maxWidth: '420px' }}>
      <h2 className="mb-4">Platform sign in</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            className="form-control"
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
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword((prev) => !prev)} />
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default PlatformLogin;