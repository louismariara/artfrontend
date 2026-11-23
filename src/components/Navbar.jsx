import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/roles';
import { useGallery } from '../context/GalleryContext';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { gallery } = useGallery();

  useEffect(() => {}, [user, token]); // Dependency array to watch for changes
     const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await apiClient.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = response.data.notifications.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener('notifications:updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications:updated', handleUpdate);
    };
  }, [token]);

  // Function to handle admin-specific navigation
  const renderAdminNav = () => {
    return (
      <>
        <li className="nav-item">
          <Link className="nav-link" to="/admin">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/my-artwork">My Artwork</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/admin/edit-artwork">Edit Artwork</Link>
        </li>
         <li className="nav-item">
          <Link className="nav-link" to="/admin/members">Members</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/admin/sessions">Sessions</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/collections">Collections</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/wishlist">Wishlist</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/profile">Profile</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/notifications">
            Notifications{unreadCount > 0 && <sup className="notification-count">{unreadCount}</sup>}
          </Link>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => logout(() => navigate('/'))}>Sign Out</button>
        </li>
      </>
    );
  };
  // Function to handle guest navigation
  const renderGuestNav = () => {
    return (
      <>
        <li className="nav-item">
          <Link className="nav-link" to="/login">Login</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/sign-up">Sign Up</Link>
        </li>
      </>
    );
  };

  // Function to handle logged-in user navigation (non-admin)
  const renderUserNav = () => {
    return (
      <>
        <li className="nav-item">
          <Link className="nav-link" to="/collections">Collections</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/wishlist">Wishlist</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/profile">Profile</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/notifications">
            Notifications{unreadCount > 0 && <sup className="notification-count">{unreadCount}</sup>}
          </Link>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => logout(() => navigate('/'))}>Sign Out</button>
        </li>
      </>
    );
  };
  const renderCuratorNav = () => {
    return (
      <>
        <li className="nav-item">
          <Link className="nav-link" to="/admin">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/my-artwork">My Artwork</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/collections">Collections</Link>
        </li>
         <li className="nav-item">
          <Link className="nav-link" to="/wishlist">Wishlist</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/profile">Profile</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/notifications">
            Notifications{unreadCount > 0 && <sup className="notification-count">{unreadCount}</sup>}
          </Link>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => logout(() => navigate('/'))}>Sign Out</button>
        </li>
      </>
    );
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">{gallery?.name || 'Art Gallery'}</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          {token && user ? (
            hasRole(user, 'admin') ? renderAdminNav() : hasRole(user, 'curator') ? renderCuratorNav() : renderUserNav()
          ) : renderGuestNav()}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;