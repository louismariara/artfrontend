import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await apiClient.post('/login/request-recovery', { email });
      // Backend always returns the same generic message whether or not the
      // account exists, so we just show whatever it sent back.
      setMessage(response.data.message);
      setSent(true);
    } catch (err) {
      const errMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(errMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="login-form">
        <h2 className="mb-4">Forgot Password</h2>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <p className="text-muted">
              Enter your account email and we will send you a link to reset your password.
            </p>
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
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="alert alert-success" role="alert">
            {message}
          </div>
        )}

        <p className="mt-3">
          <Link to="/login" className="small text-muted">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;