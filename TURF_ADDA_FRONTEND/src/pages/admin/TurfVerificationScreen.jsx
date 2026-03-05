import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';

import {
  RiArrowLeftLine,
  RiSearchLine,
  RiBuilding2Line,
  RiErrorWarningLine,
} from 'react-icons/ri';

import { getPendingVerficationTurf } from '../../api/adminApi';
import { getStatusStyle } from '../../utils/index';

const TurfVerificationScreen = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const role = (user?.role || '').toLowerCase();
    if (!isAuthenticated || (role !== 'admin' && role !== 'superadmin')) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user?.role, navigate]);

  useEffect(() => {
    const fetchPendingTurfs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getPendingVerficationTurf();
        const turfList = response?.data?.pendingTurfs || [];
        setTurfs(turfList);
      } catch (err) {
        const msg = err.message || 'Failed to load pending turfs';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingTurfs();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setPage(1);
  };

  const filteredTurfs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return turfs;

    return turfs.filter((turf) =>
      turf?.name?.toLowerCase().includes(term) ||
      turf?.owner?.fullName?.toLowerCase().includes(term) ||
      turf?.owner?.mobile?.toLowerCase().includes(term) ||
      turf?.location?.city?.toLowerCase().includes(term) ||
      turf?.location?.area?.toLowerCase().includes(term) ||
      turf?.location?.state?.toLowerCase().includes(term)
    );
  }, [turfs, search]);

  const paginatedTurfs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTurfs.slice(start, start + limit);
  }, [filteredTurfs, page, limit]);

  const showingFrom = filteredTurfs.length === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, filteredTurfs.length);
  const totalFiltered = filteredTurfs.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-default)] flex justify-center items-center py-16">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)] font-roboto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-primary)] hover:bg-gray-100 rounded-lg transition font-medium text-sm"
            >
              <RiArrowLeftLine size={18} />
              Back
            </button>

            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                Pending Turf Verifications
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Review & verify newly registered turfs
              </p>
            </div>
          </div>

          <div className="w-20" />
        </div>

        {/* Search + Clear */}
        <div className="bg-[var(--color-bg-paper)] rounded-lg shadow-sm border border-[var(--color-divider)] p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative col-span-2 sm:col-span-1 lg:col-span-2">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={16} />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by turf name, owner, mobile, city, district, state..."
                className="w-full pl-9 pr-3 py-2 border border-[var(--color-divider)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)] rounded-md text-sm transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Main content */}
        {error ? (
          <div className="text-center py-12 text-[var(--color-error)] text-sm font-medium flex flex-col items-center gap-4">
            <RiErrorWarningLine size={48} className="opacity-80" />
            <div>{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-6 py-2 bg-[var(--color-primary)] text-white rounded-md text-sm hover:opacity-90 transition"
            >
              Refresh Page
            </button>
          </div>
        ) : filteredTurfs.length === 0 ? (
          <div className="bg-[var(--color-bg-paper)] rounded-lg shadow-sm border border-[var(--color-divider)] p-16 text-center">
            <RiBuilding2Line className="text-6xl text-[var(--color-text-secondary)] opacity-40 mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] text-base">
              {search.trim()
                ? 'No pending turfs match your search.'
                : 'No pending turf verifications at the moment.'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-[var(--color-bg-paper)] shadow-sm rounded-lg overflow-hidden border border-[var(--color-divider)]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-divider)]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider w-16">Sr.</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Turf Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">State</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">District</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">City</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Owner Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Mobile</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-divider)]">
                    {paginatedTurfs.map((turf, idx) => {
                      const st = getStatusStyle(turf.status || 'pending');
                      return (
                        <tr key={turf._id || turf.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)] font-medium">
                            {(page - 1) * limit + idx + 1}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-[var(--color-text-primary)]">
                            {turf.name || '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                            {turf.location?.state || '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                            {turf.location?.area || '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                            {turf.location?.city || '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                            {turf.owner?.fullName || '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                            {turf.owner?.mobile || '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${st.bg} ${st.text}`}>
                              {st.label || 'Pending'}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-right">
                            <button
                              onClick={() => navigate(`/turf/${turf._id || turf.id}/verify`, { state: { turf } })}
                              className="px-4 py-1.5 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_85%,black)] text-white text-sm font-medium rounded-md transition"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--color-text-secondary)]">
              <div className="flex gap-2 order-2 sm:order-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2 border border-[var(--color-divider)] rounded-md disabled:opacity-50 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={showingTo >= totalFiltered}
                  className="px-5 py-2 border border-[var(--color-divider)] rounded-md disabled:opacity-50 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Next
                </button>
              </div>

              <div className="font-medium order-1 sm:order-2">
                Showing{' '}
                <span className="text-[var(--color-text-primary)] font-semibold">
                  {showingFrom}–{showingTo}
                </span>{' '}
                of{' '}
                <span className="text-[var(--color-text-primary)] font-semibold">
                  {totalFiltered}
                </span>{' '}
                pending turfs
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TurfVerificationScreen;