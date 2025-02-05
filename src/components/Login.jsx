import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();
  // const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://artbackend-1.onrender.com/login', {
        email,
        password,
      });
      // Here we're using both user data and token from your backend response
      login(response.data.member, response.data.access_token);
      toast.success('Login successful!');
      if (response.data.member.role_id === 1) { // Assuming admin role_id is 1
        navigate('/artworks'); // Admins are directed to the ArtworkList with edit options in Navbar
      } else {
        navigate('/'); // Non-admin users go to the Home page
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data.message || 'Invalid email or password. Please try again.');
      toast.error(error.response?.data.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Login</h2>
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
          <input 
            type="password" 
            className="form-control" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary">Log In</button>
      </form>
      <p className="mt-3">
        Do not have an account? <Link to="/sign-up" className="small text-muted">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;