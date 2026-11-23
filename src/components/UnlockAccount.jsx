import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { isAdmin } from '../utils/roles';


const UnlockAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [stage, setStage] = useState('request'); // 'request' | 'verify'
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await apiClient.post('/login/unlock/request-otp', { email });
      toast.success(response.data.message);
      setStage('verify');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await apiClient.post('/login/unlock/verify-otp', { email, otp_code: otpCode });
      login(response.data.member, response.data.access_token, response.data.refresh_token);
      toast.success(response.data.message);
      if (isAdmin(response.data.member)) {
        navigate('/artworks');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired code.';
      setError(message);
      toast.error(message);
      // Backend invalidates the code after 3 wrong tries — send them back
      // to request a fresh one rather than let them keep guessing here.
      if (message.toLowerCase().includes('no valid code')) {
        setStage('request');
        setOtpCode('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="login-form">
        <h2 className="mb-4">Unlock Your Account</h2>

        {stage === 'request' && (
          <form onSubmit={handleRequestOtp}>
            <p className="text-muted">
              Enter your email and we will send a one-time code to unlock your account.
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
            {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        )}

        {stage === 'verify' && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-muted">
              Enter the 6-digit code sent to <strong>{email}</strong>. It expires in 10 minutes.
            </p>
            <div className="mb-3">
              <label htmlFor="otp_code" className="form-label">Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="form-control"
                id="otp_code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => { setStage('request'); setOtpCode(''); setError(null); }}
            >
              Resend code
            </button>
          </form>
        )}

        <p className="mt-3">
          <Link to="/login" className="small text-muted">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default UnlockAccount;