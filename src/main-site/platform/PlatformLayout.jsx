import { Navigate, Outlet } from 'react-router-dom';
import { usePlatform } from './PlatformContext';

// Everything under /platform except the login page sits inside this: it sends
// signed-out visitors to the login and shows the signed-in header.
const PlatformLayout = () => {
  const { token, admin, logout, logoutAll } = usePlatform();

  if (!token) return <Navigate to="/platform/login" replace />;

  return (
    <div className="container mt-4 on-photo">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <strong>Platform admin</strong>
          {admin && <span className="text-muted ms-2">{admin.name} ({admin.email})</span>}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Sign out</button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              if (window.confirm('Sign out of every device you are signed in on?')) logoutAll();
            }}
          >
            Sign out everywhere
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default PlatformLayout;