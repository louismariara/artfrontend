import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'; // put it btwn becausei want my css custom style to overide my bootstrap styling
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';// this  toast container is for consistent notifications to display any errors
import 'react-toastify/dist/ReactToastify.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
    <App/>
    <ToastContainer/>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
