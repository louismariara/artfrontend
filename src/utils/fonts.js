// The same keys the API accepts. A gallery picks one of these for headings
// and one for the reading text. Unknown keys fall back to the classic face.
export const GALLERY_FONTS = [
  { key: 'classic', label: 'Classic serif', stack: "'Merriweather', Georgia, serif", google: 'Merriweather:ital,wght@0,400;0,700;1,400' },
  { key: 'garamond', label: 'Cormorant Garamond', stack: "'Cormorant Garamond', Palatino, serif", google: 'Cormorant+Garamond:ital,wght@0,500;0,600;1,500' },
  { key: 'baskerville', label: 'Libre Baskerville', stack: "'Libre Baskerville', Georgia, serif", google: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400' },
  { key: 'newsreader', label: 'Newsreader', stack: "'Newsreader', Georgia, serif", google: 'Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400' },
  { key: 'franklin', label: 'Libre Franklin', stack: "'Libre Franklin', 'Helvetica Neue', sans-serif", google: 'Libre+Franklin:wght@400;500;600' },
  { key: 'source', label: 'Source Sans', stack: "'Source Sans 3', 'Helvetica Neue', sans-serif", google: 'Source+Sans+3:wght@400;500;600' },
  { key: 'outfit', label: 'Outfit', stack: "'Outfit', 'Helvetica Neue', sans-serif", google: 'Outfit:wght@400;500;600' },
];

const BY_KEY = Object.fromEntries(GALLERY_FONTS.map((font) => [font.key, font]));

export const fontByKey = (key) => BY_KEY[key] || BY_KEY.classic;

export function loadFontFaces(keys) {
  const families = [...new Set(keys.map((key) => fontByKey(key).google))].join('&family=');
  const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  let link = document.getElementById('gallery-fonts');
  if (!link) {
    link = document.createElement('link');
    link.id = 'gallery-fonts';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
}

export function applyGalleryFonts(headingKey, bodyKey) {
  const heading = fontByKey(headingKey);
  const body = fontByKey(bodyKey);
  loadFontFaces([heading.key, body.key]);
  document.documentElement.style.setProperty('--font-heading', heading.stack);
  document.documentElement.style.setProperty('--font-body', body.stack);
}

export function clearGalleryFonts() {
  document.documentElement.style.removeProperty('--font-heading');
  document.documentElement.style.removeProperty('--font-body');
}
