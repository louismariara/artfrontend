// Fixed colors, all dark enough to stay readable on the white panels.
// Accent is used for links, prices, and menu highlights. The unread count stays red.
// Buttons are the filled actions. Headings are titles only.
export const ACCENT_COLORS = [
  { key: 'terracotta', label: 'Terracotta', color: '#B0532C', hover: '#8A3F1F' },
  { key: 'ink', label: 'Ink', color: '#1A1A1A', hover: '#000000' },
  { key: 'forest', label: 'Forest', color: '#1F4D3A', hover: '#143528' },
  { key: 'navy', label: 'Navy', color: '#1E3A5F', hover: '#14283F' },
  { key: 'wine', label: 'Wine', color: '#7A2E3B', hover: '#541F28' },
];

export const BUTTON_COLORS = [
  { key: 'charcoal', label: 'Charcoal', color: '#1F2937', hover: '#111827' },
  { key: 'black', label: 'Black', color: '#111111', hover: '#000000' },
  { key: 'terracotta', label: 'Terracotta', color: '#B0532C', hover: '#8A3F1F' },
  { key: 'navy', label: 'Navy', color: '#1E3A5F', hover: '#14283F' },
  { key: 'forest', label: 'Forest', color: '#1F4D3A', hover: '#143528' },
];

export const HEADING_COLORS = [
  { key: 'charcoal', label: 'Charcoal', color: '#1F2937' },
  { key: 'black', label: 'Black', color: '#1A1A1A' },
  { key: 'navy', label: 'Navy', color: '#1E3A5F' },
  { key: 'forest', label: 'Forest', color: '#1F4D3A' },
  { key: 'wine', label: 'Wine', color: '#7A2E3B' },
];

export const BAR_COLORS = [
  { key: 'charcoal', label: 'Charcoal', color: '#1F2937', ink: '#F7F4EF', line: 'rgba(247, 244, 239, 0.22)', hover: '#E7C4B0', light: false },
  { key: 'white', label: 'White', color: '#FFFFFF', ink: '#1A1A1A', line: '#E4E1DA', light: true },
  { key: 'cream', label: 'Cream', color: '#F4EFE6', ink: '#1A1A1A', line: '#E4D9CC', light: true },
  { key: 'ink', label: 'Ink', color: '#161311', ink: '#F7F4EF', line: 'rgba(247, 244, 239, 0.16)', hover: '#E7C4B0', light: false },
  { key: 'terracotta', label: 'Terracotta', color: '#B0532C', ink: '#FFFFFF', line: 'rgba(255, 255, 255, 0.28)', hover: '#F4EFE6', light: false },
  { key: 'navy', label: 'Navy', color: '#1E3A5F', ink: '#F7F4EF', line: 'rgba(247, 244, 239, 0.22)', hover: '#E7C4B0', light: false },
  { key: 'forest', label: 'Forest', color: '#1F4D3A', ink: '#F7F4EF', line: 'rgba(247, 244, 239, 0.22)', hover: '#E7C4B0', light: false },
  { key: 'wine', label: 'Wine', color: '#7A2E3B', ink: '#FFFFFF', line: 'rgba(255, 255, 255, 0.24)', hover: '#F4EFE6', light: false },
];

const byKey = (list, fallback) => (key) => list.find((item) => item.key === key) || fallback;

export const accentByKey = byKey(ACCENT_COLORS, ACCENT_COLORS[0]);
export const buttonByKey = byKey(BUTTON_COLORS, BUTTON_COLORS[0]);
export const headingByKey = byKey(HEADING_COLORS, HEADING_COLORS[0]);
export const barByKey = byKey(BAR_COLORS, BAR_COLORS[0]);

export function applyGalleryColors(accentKey, buttonKey, headingKey, barKey) {
  const accent = accentByKey(accentKey);
  const button = buttonByKey(buttonKey);
  const heading = headingByKey(headingKey);
  const bar = barByKey(barKey);
  const root = document.documentElement;
  root.style.setProperty('--accent-color', accent.color);
  root.style.setProperty('--accent-hover', accent.hover);
  root.style.setProperty('--primary-color', button.color);
  root.style.setProperty('--primary-hover', button.hover);
  root.style.setProperty('--heading-color', heading.color);
  root.style.setProperty('--bar-bg', bar.color);
  root.style.setProperty('--bar-ink', bar.ink);
  root.style.setProperty('--bar-line', bar.line);
  root.style.setProperty('--bar-hover', bar.light ? accent.color : bar.hover);
  root.style.setProperty('--bar-logo-bg', bar.light ? 'transparent' : '#FFFFFF');
}

export function clearGalleryColors() {
  const root = document.documentElement;
  ['--accent-color', '--accent-hover', '--primary-color', '--primary-hover', '--heading-color', '--bar-bg', '--bar-ink', '--bar-line', '--bar-hover', '--bar-logo-bg']
    .forEach((name) => root.style.removeProperty(name));
}
