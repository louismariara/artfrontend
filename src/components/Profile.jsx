import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.member);
        setError(null);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch profile');
        toast.error('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/update-profile', {
        name: user.name,
        email: user.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      setError(error.response?.data.message || 'Failed to update profile');
      toast.error(error.response?.data.message || 'Failed to update profile');
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h1 className="display-4">Profile</h1>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="name" 
            value={user.name} 
            onChange={(e) => setUser({ ...user, name: e.target.value })} 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input 
            type="email" 
            className="form-control" 
            id="email" 
            value={user.email} 
            onChange={(e) => setUser({ ...user, email: e.target.value })} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Update Profile</button>
        <button type="button" className="btn btn-danger ms-2" onClick={logout}>Logout</button>
      </form>
    </div>
  );
};

export default Profile;