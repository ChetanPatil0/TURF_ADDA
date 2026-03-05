import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';
import {
  RiAddCircleLine,
  RiEyeLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiMapPinLine,
  RiImageLine,
  RiBuilding2Line,
  RiErrorWarningLine,
  RiRefreshLine,
} from 'react-icons/ri';

import { getMyTurfs, deleteTurf } from '../../api/turfApi'; 

import { formatRupee, getStatusStyle } from '../../utils/index';
import { NoImagePlaceholder } from '../../components/common';
import { BASE_URL_MEDIA } from '../../const';
import { useMessageModal } from '../../context/MessageModalContext';

const PageLoading = () => (
  <div className="min-h-screen bg-[var(--color-bg-default)] flex flex-col items-center justify-center gap-4">
    <Loader size="sm" />
  </div>
);

const PageError = ({ message, onRetry }) => (
  <div className="min-h-screen bg-[var(--color-bg-default)] flex items-center justify-center px-5">
    <div className="bg-[var(--color-bg-paper)] rounded-2xl shadow p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <RiErrorWarningLine className="text-3xl text-[var(--color-error)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Couldn't load</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-[var(--color-error)] hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const TurfCard = ({ turf, onView, onEdit, onDelete }) => {
  const st = getStatusStyle(turf.status || 'active');

  const loc = [turf?.location?.area, turf?.location?.city]
    .filter(Boolean)
    .join(', ') || 'Location not set';

  const coverImage = turf.coverImage
    ? `${BASE_URL_MEDIA}${turf.coverImage}`
    : turf.images?.[0]
    ? `${BASE_URL_MEDIA}${turf.images[0]}`
    : null;

  const price = turf.pricePerSlot ? formatRupee(turf.pricePerSlot) : '₹0';

  return (
    <div className="bg-[var(--color-bg-paper)] rounded-2xl border border-[var(--color-divider)] overflow-hidden shadow hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-44 sm:h-48 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={turf.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <NoImagePlaceholder />
        )}

        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${st.bg} ${st.text}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: st.dot }} />
            {st.label}
          </span>
        </div>

        {turf.isVerified && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-xs font-medium shadow-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.707 9.293a1 1 0 011.414 0L9 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-tight line-clamp-2 flex-1">
            {turf.name}
          </h3>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-[var(--color-primary)]">{price}</div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">per slot</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mb-4">
          <RiMapPinLine className="text-[var(--color-primary)] text-base" />
          <span className="truncate">{loc}</span>
        </div>

        {turf.sports?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {turf.sports.slice(0, 5).map((sport, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-medium rounded-full border border-[color-mix(in srgb,var(--color-primary)_20%,transparent)]"
              >
                {sport}
              </span>
            ))}
            {turf.sports.length > 5 && (
              <span className="px-3 py-1 text-xs text-[var(--color-text-secondary)] bg-gray-100 rounded-full">
                +{turf.sports.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 border-t border-[var(--color-divider)]">
        <button
          onClick={onView}
          className="py-3.5 flex items-center justify-center gap-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/60 text-sm font-medium transition-colors"
        >
          <RiEyeLine className="text-base" /> View
        </button>
        <button
          onClick={onEdit}
          className="py-3.5 flex items-center justify-center gap-2 text-[var(--color-text-primary)] hover:bg-gray-100 text-sm font-medium transition-colors border-x border-[var(--color-divider)]"
        >
          <RiEdit2Line className="text-base" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="py-3.5 flex items-center justify-center gap-2 text-[var(--color-error)] hover:bg-red-50 text-sm font-medium transition-colors"
        >
          <RiDeleteBinLine className="text-base" /> Delete
        </button>
      </div>
    </div>
  );
};

const MyTurfs = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { showMessage } = useMessageModal(); 

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await getMyTurfs();

      let turfsList = [];

      if (res?.success && res?.data?.turfs && Array.isArray(res.data.turfs)) {
        turfsList = res.data.turfs;
      } else if (Array.isArray(res)) {
        turfsList = res;
      } else if (res?.turfs && Array.isArray(res.turfs)) {
        turfsList = res.turfs;
      } else if (res?.data && Array.isArray(res.data)) {
        turfsList = res.data;
      }

      setTurfs(turfsList);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load your turfs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'owner') {
      navigate('/login');
      return;
    }
    fetchTurfs();
  }, [isAuthenticated, user?.role, navigate]);

  const handleView = (id) => navigate(`/owner/turf/${id}`);
  const handleEdit = (id) => navigate(`/owner/turf/${id}/edit`);

  const handleDeleteClick = (turfId, turfName) => {
    showMessage({
      type: 'warning',
      title: 'Delete Turf',
      message: `Are you sure you want to delete "${turfName || 'this turf'}"? This action cannot be undone.`,
      primaryText: 'Delete',
      onPrimary: async () => {
        try {
          await deleteTurf(turfId); // assumes your API has soft-delete or real delete

          setTurfs((prev) => prev.filter((t) => (t._id || t.id) !== turfId));

          showMessage({
            type: 'success',
            title: 'Success',
            message: 'Turf has been deleted successfully.',
            primaryText: 'OK',
            onPrimary: () => {}, // just close
          });
        } catch (error) {
          showMessage({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete turf. Please try again.',
            primaryText: 'OK',
          });
          console.error('Delete error:', error);
        }
      },
      secondaryText: 'Cancel',
      onSecondary: () => {},
    });
  };

  const goToAdd = () => navigate('/owner/turfs/add-turf');

  if (loading) return <PageLoading />;
  if (error && turfs.length === 0) return <PageError message={error} onRetry={fetchTurfs} />;

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)] pb-12">
      <div className="bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">
                My Turfs
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Manage your listed turfs.
              </p>
            </div>

            <button
              onClick={goToAdd}
              className="flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm min-w-[160px]"
            >
              <RiAddCircleLine className="text-lg" />
              Add Turf
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {turfs.length === 0 ? (
          <div className="bg-[var(--color-bg-paper)] rounded-2xl border border-[var(--color-divider)] py-14 px-6 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <RiBuilding2Line className="text-5xl text-[var(--color-primary)]" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-3">
              No turfs yet
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
              Start by adding your first turf and begin accepting bookings.
            </p>
            <button
              onClick={goToAdd}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-7 py-3 rounded-xl text-base font-medium hover:bg-[var(--color-primary)]/90 transition-colors shadow-sm"
            >
              <RiAddCircleLine className="text-xl" />
              Add Turf
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turfs.map((turf) => (
              <TurfCard
                key={turf._id || turf.id}
                turf={turf}
                onView={() => handleView(turf._id || turf.id)}
                onEdit={() => handleEdit(turf._id || turf.id)}
                onDelete={() =>
                  handleDeleteClick(turf._id || turf.id, turf.name)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTurfs;