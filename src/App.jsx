import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import UnlockAccount from './components/UnlockAccount';
import SignUp from './components/SignUp';
import ArtworkList from './components/ArtworkList';
import ArtworkDetail from './components/ArtworkDetail';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import Search from './components/Search';
import AdminArtworkManagement from './components/AdminArtworkManagement';
import MemberManagement from './components/MemberManagement';
import Navbar from './components/Navbar';
import ForgotPassword from './components/ForgotPassword';
import Notifications from './components/Notifications';
import ResetPassword from './components/ResetPassword';
import SessionManagement from './components/SessionManagement';
import MyArtwork from './components/MyArtwork';
import CollectionManagement from './components/CollectionManagement';
import MyWishlist from './components/MyWishlist';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PropTypes from 'prop-types';

const ALL_ROLES = ['admin', 'curator', 'member'];

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  }

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: 'Please log in or sign up to view this page.' }}
        replace
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/unlock" element={<UnlockAccount />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/artworks" element={<ArtworkList />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin/edit-artwork"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminArtworkManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artworks/:id"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <ArtworkDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <CollectionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <MyWishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'curator']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MemberManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SessionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-artwork"
          element={
            <ProtectedRoute allowedRoles={['admin', 'curator']}>
              <MyArtwork />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;