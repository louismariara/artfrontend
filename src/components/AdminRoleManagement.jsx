import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/roles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoles(response.data.roles);
        setError(null);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch roles');
        toast.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, [token]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/roles', { name: newRoleName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles([...roles, response.data.role]);
      setNewRoleName('');
      setSuccessMessage('Role created successfully');
      toast.success('Role created successfully');
      setError(null);
    } catch (error) {
      setError(error.response?.data.message || 'Failed to create role');
      toast.error(error.response?.data.message || 'Failed to create role');
      setSuccessMessage(null);
    }
  };

  const handleUpdateRole = async (roleId, newName) => {
    try {
      const response = await axios.put(`/roles/${roleId}`, { name: newName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(roles.map(role => role.id === roleId ? response.data.role : role));
      setSuccessMessage('Role updated successfully');
      toast.success('Role updated successfully');
      setError(null);
    } catch (error) {
      setError(error.response?.data.message || 'Failed to update role');
      toast.error(error.response?.data.message || 'Failed to update role');
      setSuccessMessage(null);
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await axios.delete(`/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(roles.filter(role => role.id !== roleId));
      setSuccessMessage('Role deleted successfully');
      toast.success('Role deleted successfully');
      setError(null);
    } catch (error) {
      setError(error.response?.data.message || 'Failed to delete role');
      toast.error(error.response?.data.message || 'Failed to delete role');
      setSuccessMessage(null);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1 className="display-4">Role Management</h1>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <form onSubmit={handleCreateRole}>
        <div className="mb-3">
          <input 
            type="text" 
            className="form-control" 
            value={newRoleName} 
            onChange={(e) => setNewRoleName(e.target.value)} 
            placeholder="New role name"
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Role</button>
      </form>
      <h2 className="mt-4">Existing Roles</h2>
      <ul className="list-group">
        {roles.map(role => (
          <li key={role.id} className="list-group-item d-flex justify-content-between align-items-center">
            {role.name}
            <div>
              <input 
                type="text" 
                className="form-control mb-2" 
                defaultValue={role.name} 
                onChange={(e) => handleUpdateRole(role.id, e.target.value)}
                placeholder="Update role name"
              />
              <button className="btn btn-danger" onClick={() => handleDeleteRole(role.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminRoleManagement;