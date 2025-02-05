import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This log or any other action here can help confirm when user or token changes
    console.log('User or Token updated:', user, token);
  }, [user, token]); // Dependency array to watch for changes

  // Function to handle admin-specific navigation
  const renderAdminNav = () => {
    return (
      <>
        <li className="nav-item">
          <Link className="nav-link" to="/admin/edit-artwork">Edit Artwork</Link>
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
      <li className="nav-item">
        <button className="nav-link btn btn-link" onClick={() => logout(() => navigate('/'))}>Sign Out</button>
      </li>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">Art Gallery</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          {token ? (
            user && user.role_id === 1 ? renderAdminNav() : renderUserNav()
          ) : renderGuestNav()}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;