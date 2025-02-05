import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Home = () => {
  // Initialize with hardcoded artworks for testing or fallback
  const [artworks, setArtworks] = useState([
    {
      id: 1,
      title: "Buddha Shakyamuni Seated in Meditation (Dhyanamudra)",
      artist: "Unknown",
      medium: "Granite",
      dimensions: "160 × 120.2 × 56.3 cm (63 × 47 5/16 × 22 3/16 in.)",
      condition: "good",
      location: "Nagapattinam",
      theme: "Buddhism",
      views: 1000,
      updated_at: "2023-01-01T00:00:00Z",
      member_id: null,
      image_path: "uploads/1964.556 - Buddha Shakyamuni Seated in Meditation....jpg",
      description: "This meditating Buddha comes from the coastal town of Nagapattinam in southern India, which was, as a result of settlers from Srivijaya (Indonesia), one of the few places where Buddhism was still flourishing in the twelfth century. The Buddha—with his elongated earlobes, the wheel marks on his palms, the urna between his brows, and the cranial protuberance covered with snail-shell curls—is seated in the posture of meditation, with his hands resting on his lap (dhyanamudra), wearing a seemingly diaphanous monastic garment. As in other images from Nagapattinam, a flame emerges out of the Buddha’s cranial protuberance, probably signifying wisdom. This monumental granite sculpture originally would have graced a monastic site at Nagapattinam, which is also well known for its Buddhist bronzes. The Tamil inscription covering its back is no longer legible.",
      date: "1101–1200",
      credit_line: "Purchased with funds provided by Mr. and Mrs. Robert Andrew Brown",
      reference_number: "1964.556",
      iiif_manifest: "https://api.artic.edu/api/v1/artworks/21023/manifest.json"
    },
    {
      id: 2,
      title: "Mona Lisa",
      artist: "Leonardo da Vinci",
      medium: "Oil on poplar panel",
      dimensions: "77 cm × 53 cm",
      condition: "excellent",
      location: "Louvre Museum, Paris",
      theme: "Renaissance",
      image_path: "uploads/Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg",
      description: "A portrait by the Italian artist Leonardo da Vinci, famous for her enigmatic smile."
    },
    {
      id: 3,
      title: "The Scream",
      artist: "Edvard Munch",
      medium: "Pastel and crayon on cardboard",
      dimensions: "91 cm × 73.5 cm",
      condition: "fair",
      location: "National Gallery, Oslo",
      theme: "Expressionism",
      image_path: "uploads/scream_vert-a59c4997eed62f01e7ce9f7471890ea40f1f4636.jpg",
      description: "An iconic work depicting an angst-ridden figure against a fiery sky."
    },
    {
      id: 4,
      title: "The Last Supper",
      artist: "Leonardo da Vinci",
      medium: "Tempera on gesso, pitch, and mastic",
      dimensions: "460 cm × 880 cm",
      condition: "restored",
      location: "Santa Maria delle Grazie, Milan",
      theme: "Renaissance",
      image_path: "uploads/images.jpeg",
      description: "A late 15th-century mural painting by Leonardo da Vinci."
    },
    {
      id: 5,
      title: "Guernica",
      artist: "Pablo Picasso",
      medium: "Oil on canvas",
      dimensions: "349.3 cm × 776.6 cm",
      condition: "good",
      location: "Museo Reina Sofia, Madrid",
      theme: "Cubism",
      image_path: "uploads/guernica.jpeg",
      description: "A powerful anti-war painting in response to the bombing of Guernica."
    },
    {
      id: 6,
      title: "The Persistence of Memory",
      artist: "Salvador Dalí",
      medium: "Oil on canvas",
      dimensions: "24 cm × 33 cm",
      condition: "good",
      location: "Museum of Modern Art, New York",
      theme: "Surrealism",
      image_path: "uploads/persistence of memory.jpg",
      description: "Famous for its surreal melting clocks, exploring the concept of time."
    }
  ]);

  // State to manage loading status
  const [loading, setLoading] = useState(false);
  // State to manage error status, not reset on each fetch attempt
  const [error, setError] = useState(null);
  // Get the authentication token from the AuthContext
  const { token } = useAuth();

  // Effect hook to fetch artworks when the component mounts or when token changes
  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      // Do not reset error here, only on successful fetch
      try {
        const response = await axios.get('/artworks', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        console.log('Response from server:', response.data);
        // Merge fetched data with hardcoded data
        if (Array.isArray(response.data.artworks) && response.data.artworks.length > 0) {
          setArtworks(response.data.artworks);
          setError(null); // Reset error state if fetch is successful
        } else {
          toast.info('No new artworks found, showing default collection.');
        }
      } catch (error) {
        console.error('Detailed Error fetching artworks:', error.response ? error.response.data : error.message, error.stack);
        // Keep hardcoded data as fallback
        toast.error('Failed to fetch new artworks, showing default collection.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, [token]);

  // Render loading state
  if (loading) return <div className="d-flex justify-content-center mt-5">Loading...</div>;

  // Main render logic, no error state to show; instead, we always show artworks
  return (
    <div className="container mt-4">
      <h1 className="display-4 text-center mb-4">Art Collection</h1>
      <div className="row">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="col-md-3 mb-4">
            <div className="card artwork-card small-box">
              <img src={`/${artwork.image_path}`} className="card-img-top artwork-image" alt={artwork.title} />
              <div className="card-body">
                <h5 className="card-title">{artwork.title}</h5>
                <p className="card-text">By: {artwork.artist}</p>
                <Link to={`/artworks/${artwork.id}`} className="btn btn-link p-0">More Information</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;