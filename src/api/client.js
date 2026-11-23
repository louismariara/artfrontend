import axios from 'axios';
import { getGallerySlug } from '../utils/gallery';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const apiClient = axios.create({
  baseURL: BASE_URL,
});
// Before login the backend can't tell which gallery a request is for, so these
// five calls always carry the gallery name in the body. Everything after login
// is identified by the token, so nothing else needs it.
const ORG_SLUG_PATHS = [
  '/login',
  '/sign-up',
  '/login/request-recovery',
  '/login/unlock/request-otp',
  '/login/unlock/verify-otp',
];

apiClient.interceptors.request.use((config) => {
  const slug = getGallerySlug();
  const isPlainBody = config.data && typeof config.data === 'object' && !(config.data instanceof FormData);
  if (
    slug &&
    !config.skipOrgSlug && // lets the create-a-gallery form opt out later (step 4)
    config.method === 'post' &&
    ORG_SLUG_PATHS.includes(config.url) &&
    isPlainBody &&
    !config.data.org_slug
  ) {
    config.data = { ...config.data, org_slug: slug };
  }
  return config;
});

// Queues requests that hit a 401 while a refresh is already in flight,
// so we never fire two simultaneous /refresh calls for the same expired token.
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/login') ||
      originalRequest?.url?.includes('/sign-up') ||
      originalRequest?.url?.includes('/refresh');

    // The gallery was suspended while this person was using it: drop their
    // saved login and tell the app to show the "suspended" screen.
    const responseMessage = error.response?.data?.message;
    if (
      status === 403 &&
      typeof responseMessage === 'string' &&
      responseMessage.toLowerCase().includes('suspended')
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new CustomEvent('gallery:suspended'));
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );
        const { access_token, refresh_token } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        window.dispatchEvent(new CustomEvent('auth:tokens-updated', {
          detail: { accessToken: access_token, refreshToken: refresh_token }
        }));

        onRefreshed(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshSubscribers = [];
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;