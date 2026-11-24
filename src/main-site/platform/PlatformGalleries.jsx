import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import platformClient from '../../api/platformClient';
import { galleryAddress } from '../../utils/gallery';

const leaseBadge = (gallery) => {
  if (gallery.lease_state === 'expired') {
    return { text: `Expired ${gallery.paid_until}`, className: 'bg-danger' };
  }
  if (gallery.lease_state === 'expiring') {
    return { text: `Ends ${gallery.paid_until}`, className: 'bg-warning text-dark' };
  }
  if (gallery.lease_state === 'current') {
    return { text: `Paid through ${gallery.paid_until}`, className: 'bg-success' };
  }
  return { text: 'No lease recorded', className: 'bg-secondary' };
};

const PlatformGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchGalleries = async () => {
    try {
      const { data } = await platformClient.get('/galleries');
      setGalleries(data.galleries);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load galleries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const changeStatus = async (gallery) => {
    const suspending = gallery.status === 'active';
    const question = suspending
      ? `Suspend "${gallery.name}"? Nobody in it will be able to use it until you reactivate it.`
      : `Reactivate "${gallery.name}"?`;
    if (!window.confirm(question)) return;

    setBusyId(gallery.id);
    try {
      const action = suspending ? 'suspend' : 'reactivate';
      const { data } = await platformClient.patch(`/galleries/${gallery.id}/${action}`);
      toast.success(data.message || 'Done');
      await fetchGalleries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const rename = async (gallery) => {
    const input = window.prompt('New display name for this gallery:', gallery.name);
    if (input === null) return;
    const newName = input.trim();
    if (!newName || newName === gallery.name) return;

    setBusyId(gallery.id);
    try {
      await platformClient.patch(`/galleries/${gallery.id}`, { name: newName });
      toast.success('Gallery renamed');
      await fetchGalleries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not rename');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div>Loading galleries...</div>;

  const attention = galleries.filter(
    (gallery) => gallery.lease_state === 'expired' || gallery.lease_state === 'expiring'
  );

  return (
    <>
      <h2 className="mb-3">Galleries ({galleries.length})</h2>
      {attention.length > 0 && (
        <div className="alert alert-warning">
          <strong>Leases that need attention.</strong>
          <ul className="mb-0 mt-2">
            {attention.map((gallery) => (
              <li key={gallery.id}>
                <Link to={`/platform/galleries/${gallery.id}`}>{gallery.name}</Link>
                {' '}
                {gallery.lease_state === 'expired'
                  ? `expired on ${gallery.paid_until}.`
                  : `is paid through ${gallery.paid_until} (${gallery.days_left} day${gallery.days_left === 1 ? '' : 's'} left).`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Status</th>
              <th>Lease</th>
              <th>Members</th>
              <th>Artworks</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleries.map((gallery) => (
              <tr key={gallery.id}>
                <td>{gallery.name}</td>
                <td>
                  <a href={galleryAddress(gallery.slug)} target="_blank" rel="noreferrer">{gallery.slug}</a>
                </td>
                <td>
                  <span className={`badge ${gallery.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                    {gallery.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${leaseBadge(gallery).className}`}>{leaseBadge(gallery).text}</span>
                </td>
                <td>{gallery.member_count}</td>
                <td>{gallery.artwork_count}</td>
                <td>{new Date(gallery.created_at).toLocaleDateString()}</td>
                <td className="d-flex flex-wrap gap-1">
                  <Link to={`/platform/galleries/${gallery.id}`} className="btn btn-primary btn-sm">View</Link>
                  <button className="btn btn-outline-secondary btn-sm" disabled={busyId === gallery.id} onClick={() => rename(gallery)}>
                    Rename
                  </button>
                  <button
                    className={`btn btn-sm ${gallery.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                    disabled={busyId === gallery.id}
                    onClick={() => changeStatus(gallery)}
                  >
                    {gallery.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PlatformGalleries;