import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/roles';
import { useGallery } from '../context/GalleryContext';
import { imageUrl } from '../utils/images';

const item = (to, label, count) => ({ to, label, count });

const menuFor = (user, token, unreadCount) => {
  if (!token || !user) {
    return [
      { title: 'Visit', items: [item('/login', 'Log in'), item('/sign-up', 'Create an account')] },
    ];
  }

  const account = [
    item('/wishlist', 'Wishlist'),
    item('/profile', 'Profile'),
    item('/notifications', 'Notifications', unreadCount),
  ];

  if (hasRole(user, 'admin')) {
    return [
      { title: 'Visit', items: [item('/', 'Collection')] },
      {
        title: 'Studio',
        items: [
          item('/admin', 'Dashboard'),
          item('/my-artwork', 'My artwork'),
          item('/admin/edit-artwork', 'Edit artwork'),
          item('/collections', 'Collections'),
        ],
      },
      {
        title: 'Gallery',
        items: [
          item('/admin/members', 'Members'),
          item('/admin/sessions', 'Sessions'),
          item('/settings', 'Appearance'),
        ],
      },
      { title: 'Account', items: account },
    ];
  }

  if (hasRole(user, 'curator')) {
    return [
      { title: 'Visit', items: [item('/', 'Collection')] },
      {
        title: 'Studio',
        items: [
          item('/admin', 'Dashboard'),
          item('/my-artwork', 'My artwork'),
          item('/collections', 'Collections'),
        ],
      },
      { title: 'Account', items: account },
    ];
  }

  return [
    { title: 'Visit', items: [item('/', 'Collection'), item('/collections', 'Collections')] },
    { title: 'Account', items: account },
  ];
};

const MenuIcon = ({ open }) => (
  <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
    {open ? (
      <path d="M2 2 L20 14 M20 2 L2 14" stroke="currentColor" strokeWidth="1.6" />
    ) : (
      <>
        <path d="M1 1.5 H21" stroke="currentColor" strokeWidth="1.6" />
        <path d="M1 8 H21" stroke="currentColor" strokeWidth="1.6" />
        <path d="M1 14.5 H21" stroke="currentColor" strokeWidth="1.6" />
      </>
    )}
  </svg>
);

const Navbar = () => {
  const { token, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { gallery } = useGallery();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return undefined;
    }
    let cancelled = false;
    const fetchUnreadCount = async () => {
      try {
        const response = await apiClient.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        const unread = response.data.notifications.filter((note) => !note.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to fetch unread notification count:', err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener('notifications:updated', handleUpdate);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('notifications:updated', handleUpdate);
    };
  }, [token]);

  const sections = menuFor(user, token, unreadCount);
  const roleLabel = user?.role_name ? user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1) : '';

  return (
    <>
      <header className="site-bar">
        <Link className="site-brand" to="/">
          {gallery?.logo_path && (
            <img className="site-logo" src={imageUrl(gallery.logo_path)} alt="" />
          )}
          <span>{gallery?.name || 'Art Gallery'}</span>
        </Link>
        {token && user ? (
          <button
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="gallery-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
            <span>{open ? 'Close' : 'Menu'}</span>
          </button>
        ) : !isLoading ? (
          <nav className="site-bar-links" aria-label="Account">
            <Link to="/login">Log in</Link>
            <Link to="/sign-up">Sign up</Link>
          </nav>
        ) : null}
      </header>

      {open && (
        <button type="button" className="gallery-overlay" aria-label="Close menu" onClick={() => setOpen(false)} />
      )}

      <nav id="gallery-menu" className={`gallery-drawer${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="gallery-drawer-head">
          <div>
            <p className="gallery-drawer-kicker">{gallery?.name || 'Art Gallery'}</p>
            {user && <p className="gallery-drawer-who">{user.name}{roleLabel ? ` · ${roleLabel}` : ''}</p>}
          </div>
          <button type="button" className="menu-button" onClick={() => setOpen(false)}>
            <MenuIcon open />
            <span>Close</span>
          </button>
        </div>
        {sections.map((section) => (
          <div key={section.title} className="gallery-drawer-section">
            <p className="gallery-drawer-label">{section.title}</p>
            <ul>
              {section.items.map((entry) => (
                <li key={entry.to}>
                  <NavLink
                    to={entry.to}
                    end={entry.to === '/'}
                    className={({ isActive }) => `gallery-drawer-link${isActive ? ' is-active' : ''}`}
                  >
                    {entry.label}
                    {entry.count > 0 && <span className="gallery-drawer-count">{entry.count}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {token && user && (
          <button type="button" className="gallery-drawer-signout" onClick={() => logout(() => navigate('/'))}>
            Sign out
          </button>
        )}
      </nav>
    </>
  );
};

export default Navbar;
