import { Route, Routes } from 'react-router-dom';
import Home from './components/Home'; 
import Login from './components/Login'; 
import SignUp from './components/SignUp'; 
import ArtworkList from './components/ArtworkList'; 
import ArtworkDetail from './components/ArtworkDetail'; 
import Profile from './components/Profile'; 
import AdminDashboard from './components/AdminDashboard'; 
import Search from './components/Search'; 
import AdminRoleManagement from './components/AdminRoleManagement';
import AdminArtworkManagement from './components/AdminArtworkManagement';
import Navbar from './components/Navbar';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (isLoading) {
    return <div>Loading...</div>; // or your preferred loading indicator
  }

  // Check for token first, then roles if specified
  if (!token) {
    return <Navigate to="/login" state={{ from: location, message: "Please log in or sign up to view artwork details." }} replace />;
  }

  // Check user, role, and role name existence before accessing
  if (!user || !user.role || !user.role_id || !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <> 
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/artworks" element={<ArtworkList />} />
        <Route 
          path="/admin/edit-artwork" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminArtworkManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/artworks/:id" 
          element={
            <ProtectedRoute>
              <ArtworkDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={["user", "admin", "curator"]}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={["admin", "curator"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/search" element={<Search />} />
        <Route 
          path="/admin/roles" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRoleManagement />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;