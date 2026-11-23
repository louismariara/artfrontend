import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SessionManagement = () => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [memberIdFilter, setMemberIdFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async (filterOverride) => {
    const activeFilter = filterOverride !== undefined ? filterOverride : memberIdFilter;
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sessions', {
        headers: { Authorization: `Bearer ${token}` },
        params: activeFilter ? { member_id: activeFilter } : {}
      });
      setSessions(response.data.sessions);
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSessions();
  };

  const handleRevoke = async (sessionId) => {
    try {
      const response = await apiClient.delete(`/admin/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error('Error revoking session:', err);
      toast.error(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('This will sign out every other active session across all members. Continue?')) {
      return;
    }
    try {
      const response = await apiClient.post(
        '/admin/logout-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchSessions();
    } catch (err) {
      console.error('Error during logout-all:', err);
      toast.error(err.response?.data?.message || 'Failed to log out all sessions');
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h1 className="display-4 mb-0">Active Sessions</h1>
          <button className="btn btn-danger" onClick={handleLogoutAll}>
            Log Out All Other Sessions
          </button>
        </div>

        <form onSubmit={handleFilterSubmit} className="mb-3 d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by member ID"
            value={memberIdFilter}
            onChange={(e) => setMemberIdFilter(e.target.value)}
            style={{ maxWidth: '220px' }}
          />
          <button type="submit" className="btn btn-outline-secondary">Filter</button>
          {memberIdFilter && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { setMemberIdFilter(''); fetchSessions(''); }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Member</th>
                <th>Device</th>
                <th>IP Address</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">No active sessions found.</td>
                </tr>
              ) : (
                sessions.map((session) => {
                  return (
                    <tr key={session.id}>
                      <td>{session.member_name} <span className="text-muted small">(#{session.member_id})</span></td>
                      <td>{session.device_info || '—'}</td>
                      <td>{session.ip_address || '—'}</td>
                      <td>{new Date(session.created_at).toLocaleString()}</td>
                      <td>
                      {session.is_current ? (
                        <span className="badge bg-secondary">This session</span>
                      ) : (
                        <button className="btn btn-sm btn-danger" onClick={() => handleRevoke(session.id)}>
                          Revoke
                        </button>
                      )}
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;