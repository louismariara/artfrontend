import { BASE_URL } from '../api/client';

// Turns a stored image path ("3/abc123.png", optionally with an "uploads/"
// prefix) into the address the browser can load. One place, used everywhere.
export const imageUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  return `${BASE_URL}/uploads/${path.replace(/^uploads\//, '')}`;
};