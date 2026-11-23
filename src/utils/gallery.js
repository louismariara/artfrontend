// Names that can never be a gallery (must match RESERVED_SUBDOMAINS in the backend).
const RESERVED = ['www', 'api', 'app'];

// Pure function so it is easy to reason about: hostname + settings in, slug out.
export function slugFromHostname(hostname, rootDomain, fallbackSlug) {
  let label = null;
  const host = (hostname || '').toLowerCase();

  if (host === 'localhost' || /^[\d.]+$/.test(host)) {
    label = null; // plain localhost or a raw IP: no gallery in the address
  } else if (host.endsWith('.localhost')) {
    label = host.split('.')[0]; // acme.localhost
  } else if (rootDomain && host.endsWith('.' + rootDomain)) {
    const prefix = host.slice(0, -(rootDomain.length + 1)); // acme.yoursite.com -> acme
    label = prefix && !prefix.includes('.') ? prefix : null;
  } else if (!rootDomain) {
    const parts = host.split('.');
    label = parts.length > 2 ? parts[0] : null;
  }

  if (label && !RESERVED.includes(label)) return label;
  if (label) return null; // reserved name such as www or app: this is the main site
  return fallbackSlug || null;
}

export function getGallerySlug() {
  return slugFromHostname(
    window.location.hostname,
    import.meta.env.VITE_ROOT_DOMAIN,
    import.meta.env.VITE_ORG_SLUG
  );
}

// The full web address of a gallery, e.g. http://acme.localhost:5173 in
// development or https://acme.yoursite.com in production.
export function galleryAddress(slug) {
  const { protocol, port } = window.location;
  const root = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
  return `${protocol}//${slug}.${root}${port ? `:${port}` : ''}`;
}