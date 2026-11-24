import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleMarkRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
    } catch (err) {
      console.error('Error marking notification read:', err);
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await apiClient.put('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
      toast.error('Failed to update notifications');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <div className="notice-head">
          <div>
            <h1 className="mb-0">Notifications</h1>
            <p>{unreadCount > 0 ? `${unreadCount} unread` : 'You are caught up.'}</p>
          </div>
          {unreadCount > 0 && (
            <button type="button" className="btn btn-outline-secondary" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-muted">No notifications yet.</p>
        ) : (
          <ul className="notice-list">
            {notifications.map((n) => (
              <li key={n.id} className={`notice-row${n.is_read ? ' is-read' : ''}`}>
                <span className="notice-dot" aria-hidden="true" />
                <div className="notice-body">
                  <p>{n.message}</p>
                  <span className="small text-muted">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                {!n.is_read && (
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleMarkRead(n.id)}>
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;