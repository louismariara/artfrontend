import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import platformClient from '../../api/platformClient';
import { galleryAddress } from '../../utils/gallery';
import { formatPrice } from '../../utils/money';

const leaseBadge = (gallery) => {
  if (!gallery) return { text: 'No lease recorded', className: 'bg-secondary' };
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

const memberState = (member) => {
  if (member.admin_locked) return { label: 'Blocked by gallery admin', className: 'bg-danger' };
  if (member.locked) return { label: 'Temporarily locked', className: 'bg-warning text-dark' };
  return { label: 'OK', className: 'bg-success' };
};

const PlatformGalleryDetail = () => {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [members, setMembers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyMemberId, setBusyMemberId] = useState(null);
  const [paidUntil, setPaidUntil] = useState('');
  const [leaseBusy, setLeaseBusy] = useState(false);

  const fetchAll = async () => {
    try {
      const [membersRes, artworksRes] = await Promise.all([
        platformClient.get(`/galleries/${id}/members`),
        platformClient.get(`/galleries/${id}/artworks`),
      ]);
      setGallery(membersRes.data.gallery);
      setPaidUntil(membersRes.data.gallery.paid_until || '');
      setMembers(membersRes.data.members);
      setArtworks(artworksRes.data.artworks);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const unlock = async (member) => {
    let liftAdminBlock = false;
    if (member.admin_locked) {
      liftAdminBlock = window.confirm(
        `${member.name} was blocked by a gallery admin. Lift that block too?\n\nOK = lift it, Cancel = only clear temporary locks.`
      );
    }
    setBusyMemberId(member.id);
    try {
      const { data } = await platformClient.post(
        `/galleries/${id}/members/${member.id}/unlock`,
        { clear_admin_block: liftAdminBlock }
      );
      toast.success(data.message);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not unlock');
    } finally {
      setBusyMemberId(null);
    }
  };

  const sendReset = async (member) => {
    if (!window.confirm(`Email a password reset link to ${member.email}?`)) return;
    setBusyMemberId(member.id);
    try {
      const { data } = await platformClient.post(`/galleries/${id}/members/${member.id}/reset-password`);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send the reset email');
    } finally {
      setBusyMemberId(null);
    }
  };

  const saveLease = async () => {
    setLeaseBusy(true);
    try {
      const { data } = await platformClient.patch(`/galleries/${id}/lease`, {
        paid_until: paidUntil || null,
      });
      setGallery((current) => ({ ...current, ...data.gallery }));
      setPaidUntil(data.gallery.paid_until || '');
      toast.success(data.message || 'Lease updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save the lease');
    } finally {
      setLeaseBusy(false);
    }
  };

  const sendReminder = async () => {
    if (!window.confirm(`Email a payment reminder to the admins of ${gallery.name}?`)) return;
    setLeaseBusy(true);
    try {
      const { data } = await platformClient.post(`/galleries/${id}/lease-reminder`);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send the reminder');
    } finally {
      setLeaseBusy(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) {
    return (
      <>
        <div className="alert alert-danger">{error}</div>
        <Link to="/platform">Back to galleries</Link>
      </>
    );
  }

  return (
    <>
      <p><Link to="/platform">&larr; All galleries</Link></p>
      <h2>
        {gallery.name}{' '}
        <span className={`badge ${gallery.status === 'active' ? 'bg-success' : 'bg-danger'}`}>{gallery.status}</span>
      </h2>
      <p className="text-muted">
        <a href={galleryAddress(gallery.slug)} target="_blank" rel="noreferrer">{galleryAddress(gallery.slug)}</a>
      </p>

      <div className="card p-3 mb-3">
        <h3 className="h5">Lease</h3>
        <p className="mb-2">
          <span className={`badge ${leaseBadge(gallery).className}`}>{leaseBadge(gallery).text}</span>
          {gallery.lease_state === 'current' || gallery.lease_state === 'expiring' ? (
            <span className="ms-2 text-muted">{`${gallery.days_left} ${gallery.days_left === 1 ? 'day' : 'days'} left`}</span>
          ) : null}
        </p>
        <p className="text-muted small">
          There is no card payment yet. Enter the last day this gallery has paid for.
          This list warns you when that date is within 14 days, or already past.
          The day after that date, the gallery is suspended on its own. Set a later date to open it again.
          A reminder emails every admin of this gallery and also leaves a notice in their account.
        </p>
        <div className="row g-2 align-items-end">
          <div className="col-sm-auto">
            <label className="form-label" htmlFor="paid-until">Paid through</label>
            <input
              id="paid-until"
              type="date"
              className="form-control"
              value={paidUntil}
              onChange={(event) => setPaidUntil(event.target.value)}
            />
          </div>
          <div className="col-sm-auto">
            <button type="button" className="btn btn-primary" disabled={leaseBusy} onClick={saveLease}>
              Save lease
            </button>
          </div>
          <div className="col-sm-auto">
            <button type="button" className="btn btn-outline-dark" disabled={leaseBusy} onClick={sendReminder}>
              Email payment reminder
            </button>
          </div>
        </div>
      </div>

      <h3 className="h5 mt-4">Members ({members.length})</h3>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const state = memberState(member);
              return (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.role}</td>
                  <td><span className={`badge ${state.className}`}>{state.label}</span></td>
                  <td className="d-flex flex-wrap gap-1">
                    {(member.admin_locked || member.locked) && (
                      <button className="btn btn-outline-primary btn-sm" disabled={busyMemberId === member.id} onClick={() => unlock(member)}>
                        Unlock
                      </button>
                    )}
                    <button className="btn btn-outline-secondary btn-sm" disabled={busyMemberId === member.id} onClick={() => sendReset(member)}>
                      Send reset email
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="h5 mt-4">Artworks ({artworks.length})</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Title</th><th>Artist</th><th>Category</th><th>Price</th><th>Views</th></tr>
          </thead>
          <tbody>
            {artworks.map((artwork) => (
              <tr key={artwork.id}>
                <td>{artwork.id}</td>
                <td>{artwork.title}</td>
                <td>{artwork.artist}</td>
                <td>{artwork.category || '-'}</td>
                <td>{formatPrice(artwork.price, gallery?.currency) ?? '—'}</td>
                <td>{artwork.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PlatformGalleryDetail;