import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../api/client';
import { getGallerySlug } from '../utils/gallery';

const GalleryContext = createContext();

// status: 'loading' | 'ready' | 'no-gallery' | 'not-found' | 'suspended' | 'error'
export const GalleryProvider = ({ children }) => {
  const slug = getGallerySlug();
  const [state, setState] = useState({
    status: slug ? 'loading' : 'no-gallery',
    gallery: null,
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    apiClient
      .get('/gallery-info', { params: { slug } })
      .then((response) => {
        if (cancelled) return;
        const data = response.data;
        if (!data.exists) setState({ status: 'not-found', gallery: null });
        else if (data.status !== 'active') setState({ status: 'suspended', gallery: data });
        else setState({ status: 'ready', gallery: data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', gallery: null });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Step 3B: the gallery got suspended while someone was using it (client.js
  // announces this when any request comes back "suspended").
  useEffect(() => {
    const handleSuspended = () => {
      setState((previous) => ({ ...previous, status: 'suspended' }));
    };
    window.addEventListener('gallery:suspended', handleSuspended);
    return () => window.removeEventListener('gallery:suspended', handleSuspended);
  }, []);

  // Step 3A: show the gallery's name as the browser tab title.
  useEffect(() => {
    if (state.gallery?.name) document.title = state.gallery.name;
  }, [state.gallery]);

  return (
    <GalleryContext.Provider value={{ slug, ...state }}>
      {children}
    </GalleryContext.Provider>
  );
};

GalleryProvider.propTypes = { children: PropTypes.node };

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};