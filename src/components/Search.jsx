import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Search = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: '', artist: '', category: '', theme: '' });
  const { token } = useAuth();
  const [showFilters, setShowFilters] = useState(false); // New state to toggle filter visibility

  const handleSearch = async (e) => {
    e.preventDefault();
    const queryString = Object.keys(filters).map(key => 
      filters[key] ? `${key}=${encodeURIComponent(filters[key])}` : ''
    ).filter(Boolean).join('&');
    
    try {
      const response = await axios.get(`/search-artworks?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.artworks);
      setError(null);
      toast.success('Search successful');
    } catch (error) {
      console.error(error);
      setError('Failed to fetch search results');
      toast.error('Failed to fetch search results');
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container mt-4">
      <h1 className="display-4">Search Artworks</h1>
      <form onSubmit={handleSearch}>
        <div className="mb-3">
          <input 
            type="text" 
            className="form-control" 
            value={query} 
            onChange={(e) => {
              setQuery(e.target.value);
              setFilters({ ...filters, name: e.target.value }); // Assuming name search
            }} 
            placeholder="Search artworks..."
            required 
          />
          <span 
            className="filter-icon" 
            onClick={toggleFilters} 
            title="Toggle Filters"
          ></span>
        </div>

        {/* Filter options */}
        {showFilters && (
          <>
            <div className="mb-3">
              <label htmlFor="categorySelect">Filter by Category:</label>
              <select 
                id="categorySelect"
                className="form-control" 
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="painting">Painting</option>
                <option value="sculpture">Sculpture</option>
                <option value="photography">Photography</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="artistInput">Filter by Artist:</label>
              <input 
                type="text" 
                id="artistInput"
                className="form-control" 
                value={filters.artist} 
                onChange={(e) => setFilters({ ...filters, artist: e.target.value })}
                placeholder="Artist name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="themeInput">Filter by Theme:</label>
              <input 
                type="text" 
                id="themeInput"
                className="form-control" 
                value={filters.theme} 
                onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
                placeholder="Theme"
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {searchResults.length > 0 && (
        <div className="row mt-4">
          {searchResults.map((artwork) => (
            <div key={artwork.id} className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{artwork.title}</h5>
                  <p className="card-text">By: {artwork.artist}</p>
                  <a href={`/artworks/${artwork.id}`} className="btn btn-outline-primary">View Details</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;