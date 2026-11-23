import axios from 'axios';
import { BASE_URL } from './client';

// The super admin's own API helper. It talks only to /platform-admin/... and
// keeps its tokens under different names from gallery logins.
export const ACCESS_KEY = 'platform_access_token';
export const REFRESH_KEY = 'platform_refresh_token';

const platformClient = axios.create({ baseURL: `${BASE_URL}/platform-admin` });

platformClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One refresh at a time, shared by every request that hits an expired token.
let refreshing = null;
const refreshTokens = () => {
  if (!refreshing) {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    refreshing = axios
      .post(`${BASE_URL}/platform-admin/refresh`, {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then(({ data }) => {
        localStorage.setItem(ACCESS_KEY, data.access_token);
        localStorage.setItem(REFRESH_KEY, data.refresh_token);
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

platformClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isLogin = original?.url?.includes('/login');

    // 401 = expired token, 422 = a stored token that is not valid at all.
    if ((status === 401 || status === 422) && original && !original._retry && !isLogin) {
      original._retry = true;
      if (!localStorage.getItem(REFRESH_KEY)) {
        window.dispatchEvent(new CustomEvent('platform:logout'));
        return Promise.reject(error);
      }
      try {
        await refreshTokens();
        return platformClient(original); // the request interceptor adds the new token
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent('platform:logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default platformClient;