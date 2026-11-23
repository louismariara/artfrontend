import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { toast } from 'react-toastify';
import PasswordVisibilityToggle from './PasswordVisibilityToggle';

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const passwordError = validatePassword(newPassword);
    if (passwordError) errors.newPassword = passwordError;
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await apiClient.post('/login/reset-password', {
        token,
        new_password: newPassword
      });
      toast.success(response.data.message || 'Password reset successful. Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(message);
      setFieldErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="container mt-5">
        <div className="login-form">
          <h2 className="mb-4">Reset Password</h2>
          <div className="alert alert-danger" role="alert">
            This reset link is missing or invalid. Please request a new one.
          </div>
          <p className="mt-3">
            <Link to="/forgot-password" className="small text-muted">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="login-form">
        <h2 className="mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordVisibilityToggle visible={showPassword} onClick={() => setShowPassword((prev) => !prev)} />
            </div>
            {fieldErrors.newPassword && <div className="text-danger small mt-1">{fieldErrors.newPassword}</div>}
            <div className="form-text">At least 8 characters, with uppercase, lowercase, a number, and a special character.</div>
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword && <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>}
          </div>

          {fieldErrors.form && <div className="alert alert-danger">{fieldErrors.form}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-3">
          <Link to="/login" className="small text-muted">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
