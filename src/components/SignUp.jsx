import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/sign-up', {
        name,
        email,
        password,
        role_id: roleId
      });
      // Assuming the backend returns a token upon successful sign-up
      if (response.data.token) {
        login(response.data.member, response.data.token); // This assumes your backend returns user data and token
        toast.success('Account created and logged in successfully!');
        navigate('/', { replace: true });
      } else {
        toast.error('Sign up was successful, but login failed. Please try logging in.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      toast.error(error.response?.data.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
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
        <div className="mb-3">
          <label htmlFor="roleId" className="form-label">Role ID</label>
          <input 
            type="number" 
            className="form-control" 
            id="roleId" 
            value={roleId} 
            onChange={(e) => setRoleId(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login" className="small text-muted">Log In</Link>
      </p>
    </div>
  );
};

export default SignUp;