import { formatPrice } from '../utils/money';
import { useGallery } from '../context/GalleryContext';

// The public reading order used by galleries: artist, title, medium, price.
const WorkCaption = ({ artwork, heading: Heading = 'h2' }) => {
  const { gallery } = useGallery();
  return (
    <div className="work-caption">
      <p className="work-artist">{artwork.artist}</p>
      <Heading className="work-title">{artwork.title}</Heading>
      {artwork.medium ? <p className="work-medium">{artwork.medium}</p> : null}
      <p className="work-price">{formatPrice(artwork.price, gallery?.currency) ?? 'Price on request'}</p>
    </div>
  );
};

export default WorkCaption;
