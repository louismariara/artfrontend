import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'; // put it btwn becausei want my css custom style to overide my bootstrap styling
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext.jsx';
import { GalleryProvider } from './context/GalleryContext.jsx';
import GalleryGate from './components/GalleryGate.jsx';
import { ToastContainer } from 'react-toastify';// this  toast container is for consistent notifications to display any errors
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GalleryProvider>
      <GalleryGate>
        <AuthProvider>
          <BrowserRouter>
            <App/>
            <ToastContainer/>
          </BrowserRouter>
        </AuthProvider>
      </GalleryGate>
    </GalleryProvider>
  </StrictMode>,
)