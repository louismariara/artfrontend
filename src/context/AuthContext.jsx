import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token') || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stores both tokens and the member returned by /login or /sign-up.
  const login = (userData, accessToken, newRefreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
  };

  const logout = async (onComplete) => {
    try {
      if (token) {
        await apiClient.post('/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Error calling /logout:', err);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    if (onComplete) onComplete();
  };
  // Verify the stored token on load, and keep other tabs/components in sync.
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await apiClient.get('/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.member);
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          } else {
            console.error('Token verification failed:', error);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => {
    const handleTokensUpdated = (e) => {
      setToken(e.detail.accessToken);
      setRefreshToken(e.detail.refreshToken);
    };
    const handleAutoLogout = () => {
      logout();
    };

    window.addEventListener('auth:tokens-updated', handleTokensUpdated);
    window.addEventListener('auth:logout', handleAutoLogout);

    return () => {
      window.removeEventListener('auth:tokens-updated', handleTokensUpdated);
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      apiClient.get('/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {
        // A failure here (401) is already handled by the response interceptor —
        // it'll attempt a refresh, and if that also fails (session fully revoked),
        // it fires the auth:logout event we already listen for above.
      });
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      refreshToken,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};