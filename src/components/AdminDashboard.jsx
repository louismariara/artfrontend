import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('/inventory-alerts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInventoryAlerts(response.data.alerts);
        setError(null);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch inventory alerts');
        toast.error('Failed to fetch inventory alerts');
      }
    };
    if (user && (user.role.name === "admin" || user.role.name === "curator")) {
      fetchAlerts();
    }
  }, [token, user]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!user || (user.role.name !== "admin" && user.role.name !== "curator")) {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Inventory Alerts</h2>
      <ul>
        {inventoryAlerts.map((alert) => (
          <li key={alert.id}>
            <Link to={`/inventory-alerts/${alert.id}`}>{alert.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;