import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import platformClient, { ACCESS_KEY, REFRESH_KEY } from '../../api/platformClient';

const ADMIN_KEY = 'platform_admin';

const readAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY));
  } catch {
    return null;
  }
};

const PlatformContext = createContext();

export const PlatformProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(ACCESS_KEY));
  const [admin, setAdmin] = useState(readAdmin());

  const clearSession = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
  };

  const login = (adminData, accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    setToken(accessToken);
    setAdmin(adminData);
  };

  // Ends this session on the server, then clears it here either way.
  const logout = async () => {
    try {
      await platformClient.post('/logout');
    } catch (err) {
      console.error('Platform logout failed:', err);
    }
    clearSession();
  };

  // Ends every session of this super admin, on every device.
  const logoutAll = async () => {
    try {
      await platformClient.post('/logout-all');
    } catch (err) {
      console.error('Platform logout-all failed:', err);
    }
    clearSession();
  };

  // The API helper announces this when a session can no longer be renewed.
  useEffect(() => {
    const handleLogout = () => clearSession();
    window.addEventListener('platform:logout', handleLogout);
    return () => window.removeEventListener('platform:logout', handleLogout);
  }, []);

  return (
    <PlatformContext.Provider value={{ token, admin, login, logout, logoutAll }}>
      {children}
    </PlatformContext.Provider>
  );
};

PlatformProvider.propTypes = { children: PropTypes.node };

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};