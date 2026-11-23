import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { hasRole } from '../utils/roles';

const AdminDashboard = () => {
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  const isAdmin = hasRole(user, 'admin');
  const isAdminOrCurator = hasRole(user, 'admin', 'curator');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [alertsRes, artworksRes] = await Promise.all([
          apiClient.get('/inventory-alerts', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          apiClient.get('/artworks', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setInventoryAlerts(alertsRes.data.alerts);
        setArtworks(artworksRes.data.artworks);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard data');
        toast.error('Failed to fetch dashboard data');
      }
    };
    if (isAdminOrCurator) {
      fetchDashboardData();
    }
  }, [token, isAdminOrCurator]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!isAdminOrCurator) {
    return <div className="alert alert-warning">You do not have permission to access this page.</div>;
  }

  // Admin sees every artwork system-wide; a curator only sees their own,
  // matching the same scoping the backend already applies to inventory alerts.
  const scopedArtworks = isAdmin ? artworks : artworks.filter((a) => a.member_id === user.id);

  const total = scopedArtworks.length;
  const goodCount = scopedArtworks.filter((a) => a.condition === 'good').length;
  const fairCount = scopedArtworks.filter((a) => a.condition === 'fair').length;
  const poorCount = scopedArtworks.filter((a) => a.condition === 'poor').length;

  return (
    <div className="container mt-4">
      <div className="card p-4 mb-4">
        <h1>Admin Dashboard</h1>
        <h2>{isAdmin ? 'Collection Overview' : 'My Artwork Overview'}</h2>
        <div className="row text-center">
          <div className="col">
            <div className="border rounded p-3">
              <div className="fs-3">{total}</div>
              <div className="text-muted">Total Artworks</div>
            </div>
          </div>
          <div className="col">
            <div className="border rounded p-3">
              <div className="fs-3">{goodCount}</div>
              <div className="text-muted">Good Condition</div>
            </div>
          </div>
          <div className="col">
            <div className="border rounded p-3">
              <div className="fs-3">{fairCount}</div>
              <div className="text-muted">Fair Condition</div>
            </div>
          </div>
          <div className="col">
            <div className="border rounded p-3">
              <div className="fs-3">{poorCount}</div>
              <div className="text-muted">Poor Condition</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card p-4 mb-4">
        <h2>{isAdmin ? 'All Artworks' : 'My Artworks'}</h2>
        {scopedArtworks.length === 0 ? (
          <p>No artworks to show.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Artist</th>
                <th>Condition</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scopedArtworks.map((artwork) => (
                <tr key={artwork.id}>
                  <td>{artwork.title}</td>
                  <td>{artwork.artist}</td>
                  <td>{artwork.condition}</td>
                  <td>
                    <Link to={`/artworks/${artwork.id}`} className="btn btn-sm btn-outline-primary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card p-4">
        <h2>Inventory Alerts</h2>
        <ul>
          {inventoryAlerts.map((alert) => (
            <li key={alert.id}>
              <Link to={`/artworks/${alert.id}`}>{alert.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;