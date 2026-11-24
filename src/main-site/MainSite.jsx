import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Landing from './Landing';
import CreateGallery from './CreateGallery';
import { PRODUCT_NAME } from './brand';
import { PlatformProvider } from './platform/PlatformContext';
import PlatformLogin from './platform/PlatformLogin';
import PlatformLayout from './platform/PlatformLayout';
import PlatformGalleries from './platform/PlatformGalleries';
import PlatformGalleryDetail from './platform/PlatformGalleryDetail';

// The site people see when there is NO gallery in the address (the main domain).
// "Platform admin" goes to /platform: the sign-in page when signed out, the
// galleries list when signed in. Having the link visible gives nobody access;
// the pages still need a super admin login.
const MainSite = () => (
  <BrowserRouter>
    <PlatformProvider>
      <div>
        <header className="site-bar">
          <Link className="site-brand" to="/">{PRODUCT_NAME}</Link>
          <nav className="site-bar-links" aria-label="Platform">
            <Link to="/create-gallery">Create your gallery</Link>
            <Link to="/platform">Platform admin</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create-gallery" element={<CreateGallery />} />
          <Route path="/platform/login" element={<PlatformLogin />} />
          <Route path="/platform" element={<PlatformLayout />}>
            <Route index element={<PlatformGalleries />} />
            <Route path="galleries/:id" element={<PlatformGalleryDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ToastContainer />
    </PlatformProvider>
  </BrowserRouter>
);

export default MainSite;