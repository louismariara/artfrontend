import PropTypes from 'prop-types';
import { useGallery } from '../context/GalleryContext';
import MainSite from '../main-site/MainSite';

const Message = ({ title, children }) => (
  <div className="container mt-5 text-center on-photo" style={{ maxWidth: '560px' }}>
    <h2 className="mb-3">{title}</h2>
    <p className="text-muted">{children}</p>
  </div>
);

Message.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node };

// Shows the gallery app only when the gallery in the address exists and is
// active. With no gallery in the address it shows the main site instead.
const GalleryGate = ({ children }) => {
  const { status, slug } = useGallery();

  if (status === 'no-gallery') {
    return <MainSite />;
  }
  if (status === 'loading') {
    return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  }
  if (status === 'not-found') {
    return (
      <Message title="Gallery not found">
        There is no gallery called &quot;{slug}&quot;. Check the web address and try again.
      </Message>
    );
  }
  if (status === 'suspended') {
    return (
      <>
        <Message title="This gallery is suspended">
          Access to this gallery has been paused. Please contact the gallery owner.
        </Message>
        <div className="text-center">
          <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </>
    );
  }
  if (status === 'error') {
    return (
      <Message title="Can't reach the server">
        Something went wrong while loading this gallery. Please try again in a moment.
      </Message>
    );
  }
  return children;
};

GalleryGate.propTypes = { children: PropTypes.node };

export default GalleryGate;