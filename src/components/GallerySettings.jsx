import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useGallery } from '../context/GalleryContext';
import ImageUpload from './ImageUpload';
import { imageUrl } from '../utils/images';
import { GALLERY_FONTS, fontByKey, loadFontFaces } from '../utils/fonts';
import { CURRENCIES, formatPrice } from '../utils/money';
import { ACCENT_COLORS, BUTTON_COLORS, HEADING_COLORS, BAR_COLORS, accentByKey, buttonByKey, headingByKey, barByKey } from '../utils/theme';

const Swatches = ({ legend, note, value, options, onChange }) => {
  const current = options.find((item) => item.key === value) || options[0];
  return (
    <fieldset className="appearance-swatches">
      <legend>{legend}</legend>
      <p className="appearance-note">{note}</p>
      <div className="swatch-row">
        {options.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`swatch${item.key === value ? ' is-selected' : ''}`}
            style={{ '--swatch': item.color }}
            aria-pressed={item.key === value}
            aria-label={item.label}
            onClick={() => onChange(item.key)}
          />
        ))}
      </div>
      <p className="swatch-current">{current.label}</p>
    </fieldset>
  );
};

const GallerySettings = () => {
  const { token } = useAuth();
  const { reloadGallery } = useGallery();
  const [name, setName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [backgroundPath, setBackgroundPath] = useState('');
  const [fontHeading, setFontHeading] = useState('classic');
  const [fontBody, setFontBody] = useState('classic');
  const [currency, setCurrency] = useState('ksh');
  const [colorAccent, setColorAccent] = useState('terracotta');
  const [colorButton, setColorButton] = useState('charcoal');
  const [colorHeading, setColorHeading] = useState('charcoal');
  const [colorBar, setColorBar] = useState('charcoal');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await apiClient.get('/gallery-settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        const gallery = data.gallery;
        setName(gallery.name || '');
        setLogoPath(gallery.logo_path || '');
        setBackgroundPath(gallery.background_path || '');
        setFontHeading(gallery.font_heading || 'classic');
        setFontBody(gallery.font_body || 'classic');
        setCurrency(gallery.currency || 'ksh');
        setColorAccent(gallery.color_accent || 'terracotta');
        setColorButton(gallery.color_button || 'charcoal');
        setColorHeading(gallery.color_heading || 'charcoal');
        setColorBar(gallery.color_bar || 'charcoal');
        setSlug(gallery.slug || '');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not load gallery settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    loadFontFaces([fontHeading, fontBody]);
  }, [fontHeading, fontBody]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.patch('/gallery-settings', {
        name,
        logo_path: logoPath || '',
        background_path: backgroundPath || '',
        font_heading: fontHeading,
        font_body: fontBody,
        currency,
        color_accent: colorAccent,
        color_button: colorButton,
        color_heading: colorHeading,
        color_bar: colorBar,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gallery = data.gallery;
      setName(gallery.name || '');
      setLogoPath(gallery.logo_path || '');
      setBackgroundPath(gallery.background_path || '');
      setFontHeading(gallery.font_heading || 'classic');
      setFontBody(gallery.font_body || 'classic');
      setCurrency(gallery.currency || 'ksh');
      setColorAccent(gallery.color_accent || 'terracotta');
      setColorButton(gallery.color_button || 'charcoal');
      setColorHeading(gallery.color_heading || 'charcoal');
      setColorBar(gallery.color_bar || 'charcoal');
      reloadGallery();
      toast.success(data.message || 'Saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save gallery settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;

  const accent = accentByKey(colorAccent);
  const button = buttonByKey(colorButton);
  const heading = headingByKey(colorHeading);
  const bar = barByKey(colorBar);
  const headingFont = fontByKey(fontHeading).stack;
  const bodyFont = fontByKey(fontBody).stack;

  return (
    <div className="container mt-4 appearance-page">
      <h1 className="h2 mb-2">Appearance</h1>
      <p className="appearance-lead">
        Each block changes one part of this gallery. The address stays {slug ? `"${slug}"` : 'the same'}, so links people already have keep working.
      </p>
      <div className="appearance-layout">
        <form onSubmit={save}>
          <section className="appearance-card">
            <h2>Name</h2>
            <p className="appearance-note">Shown in the bar and the browser tab. It does not change the web address.</p>
            <label htmlFor="gallery-name" className="form-label">Gallery name</label>
            <input
              id="gallery-name"
              className="form-control"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={150}
              required
            />
          </section>

          <section className="appearance-card">
            <h2>Pictures</h2>
            <p className="appearance-note">The logo sits in the bar. The background sits behind the white panels, so words stay readable.</p>
            <div className="appearance-pictures">
              <div>
                <h3 className="h6">Logo</h3>
                {logoPath && (
                  <img src={imageUrl(logoPath)} alt="" style={{ height: 48, width: 'auto' }} className="d-block mb-2 bg-white border" />
                )}
                <ImageUpload label="Upload a logo" inputId="logo-upload" onImageUpload={setLogoPath} />
                {logoPath && (
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setLogoPath('')}>
                    Remove logo
                  </button>
                )}
              </div>
              <div>
                <h3 className="h6">Background</h3>
                {backgroundPath && (
                  <img src={imageUrl(backgroundPath)} alt="" style={{ maxHeight: 72, width: 'auto' }} className="d-block mb-2 border" />
                )}
                <ImageUpload label="Upload a background" inputId="background-upload" onImageUpload={setBackgroundPath} />
                {backgroundPath && (
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setBackgroundPath('')}>
                    Use the standard background
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="appearance-card">
            <h2>Type</h2>
            <p className="appearance-note">Headings are titles. Reading text is everything else, including this page.</p>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="font-heading" className="form-label">Headings</label>
                <select id="font-heading" className="form-select" value={fontHeading} onChange={(event) => setFontHeading(event.target.value)}>
                  {GALLERY_FONTS.map((font) => (
                    <option key={font.key} value={font.key}>{font.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="font-body" className="form-label">Reading text</label>
                <select id="font-body" className="form-select" value={fontBody} onChange={(event) => setFontBody(event.target.value)}>
                  {GALLERY_FONTS.map((font) => (
                    <option key={font.key} value={font.key}>{font.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="appearance-card">
            <h2>Prices</h2>
            <p className="appearance-note">Written in front of every sale price. A blank price still says “Price on request.”</p>
            <label htmlFor="gallery-currency" className="form-label">Currency</label>
            <select id="gallery-currency" className="form-select" value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {CURRENCIES.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </section>

          <section className="appearance-card">
            <h2>Colors</h2>
            <p className="appearance-note">Four separate choices. The white panels stay white so text does not disappear on a photo.</p>
            <Swatches
              legend="Top bar"
              note="The bar across the top, including the gallery name and Menu. The words switch to light or dark with the color. The menu panel stays white."
              value={colorBar}
              options={BAR_COLORS}
              onChange={setColorBar}
            />
            <Swatches
              legend="Links and prices"
              note="Links, the sale price, and menu highlights. The unread count stays red."
              value={colorAccent}
              options={ACCENT_COLORS}
              onChange={setColorAccent}
            />
            <Swatches
              legend="Buttons"
              note="Filled buttons, such as Save, Upload, and Send."
              value={colorButton}
              options={BUTTON_COLORS}
              onChange={setColorButton}
            />
            <Swatches
              legend="Headings"
              note="Page titles and artwork titles."
              value={colorHeading}
              options={HEADING_COLORS}
              onChange={setColorHeading}
            />
          </section>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save appearance'}
          </button>
        </form>

        <aside className="appearance-preview" aria-label="Preview">
          <p className="appearance-preview-kicker">Preview</p>
          <div className="appearance-preview-bar" style={{ background: bar.color, color: bar.ink, borderColor: bar.line, fontFamily: headingFont }}>
            <span>{name || 'Gallery name'}</span>
            <span>Menu</span>
          </div>
          <div className="appearance-preview-sheet" style={{ fontFamily: bodyFont }}>
            <p className="appearance-preview-kicker" style={{ fontFamily: headingFont, color: heading.color }}>{name || 'Gallery name'}</p>
            <h3 style={{ fontFamily: headingFont, color: heading.color }}>Morning Harbor</h3>
            <p>Oil on canvas</p>
            <p style={{ color: accent.color, fontWeight: 600 }}>{formatPrice(2400, currency)}</p>
            <p><span style={{ color: accent.color }}>View this work</span></p>
            <button type="button" className="appearance-preview-button" style={{ '--preview-button': button.color }}>
              Save
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GallerySettings;
