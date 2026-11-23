import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MemberManagement = () => {
  const { token, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        apiClient.get('/members', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get('/roles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMembers(membersRes.data.members);
      setRoles(rolesRes.data.roles);
      setError(null);
    } catch (err) {
      console.error('Error fetching members/roles:', err);
      setError('Failed to load members');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRoleChange = async (memberId, newRoleId) => {
    try {
      const response = await apiClient.put(
        `/members/${memberId}/role`,
        { role_id: Number(newRoleId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role_id: Number(newRoleId) } : m))
      );
    } catch (err) {
      console.error('Error changing role:', err);
      toast.error(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleBlock = async (memberId) => {
    try {
      const response = await apiClient.post(
        `/admin/members/${memberId}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, admin_locked: true } : m))
      );
    } catch (err) {
      console.error('Error blocking member:', err);
      toast.error(err.response?.data?.message || 'Failed to block member');
    }
  };

  const handleUnblock = async (memberId) => {
    try {
      const response = await apiClient.post(
        `/admin/members/${memberId}/unblock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, admin_locked: false, locked_until: null } : m))
      );
    } catch (err) {
      console.error('Error unblocking member:', err);
      toast.error(err.response?.data?.message || 'Failed to unblock member');
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h1 className="display-4 mb-4">Member Management</h1>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = user && user.id === member.id;
                return (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={member.role_id}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        style={{ maxWidth: '160px' }}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {member.admin_locked ? (
                        <span className="badge bg-danger">Blocked</span>
                      ) : member.locked_until && new Date(member.locked_until) > new Date() ? (
                        <span className="badge bg-warning text-dark">Temporarily Locked</span>
                      ) : (
                        <span className="badge bg-success">Active</span>
                      )}
                    </td>
                    <td>
                      {member.admin_locked ? (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled={isSelf}
                          onClick={() => handleUnblock(member.id)}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={isSelf}
                          onClick={() => handleBlock(member.id)}
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isSelfNoteVisible(members, user) && (
          <p className="text-muted small mt-2">Your own accounts role and block controls are disabled here for safety.</p>
        )}
      </div>
    </div>
  );
};

const isSelfNoteVisible = (members, user) => {
  return user && members.some((m) => m.id === user.id);
};

export default MemberManagement;