import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';
import DataTable from 'react-data-table-component';

import { RiRefreshLine, RiErrorWarningLine, RiSearchLine, RiBuilding2Line } from 'react-icons/ri';

import { getPendingVerficationTurf } from '../../api/adminApi';
import { getStatusStyle } from '../../utils/index';

// Custom compact & modern styles
const customStyles = {
  headCells: {
    style: {
      backgroundColor: 'var(--color-bg-default)',
      color: 'var(--color-text-secondary)',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      padding: '10px 14px',
      borderBottom: '2px solid var(--color-divider)',
    },
  },
  cells: {
    style: {
      padding: '10px 14px',
      fontSize: '13px',
      color: 'var(--color-text-primary)',
    },
  },
  rows: {
    style: {
      minHeight: '46px',
      '&:hover': {
        backgroundColor: 'var(--color-primary-light)/10',
      },
      borderBottom: '1px solid var(--color-divider)',
    },
  },
  pagination: {
    style: {
      backgroundColor: 'transparent',
      borderTop: '1px solid var(--color-divider)',
      minHeight: '50px',
      padding: '8px 16px',
    },
  },
};

const TurfVerificationScreen = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPendingTurfs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPendingVerficationTurf();
      console.log('pending turf daata : ',response)
      const turfList = response?.data?.pendingTurfs || [];
      setTurfs(turfList);
    } catch (e) {
      setError(e.message || 'Failed to load pending turfs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = (user?.role || '').toLowerCase();
    if (!isAuthenticated || (role !== 'admin' && role !== 'superadmin')) {
      navigate('/login');
      return;
    }
    fetchPendingTurfs();
  }, [isAuthenticated, user?.role, navigate]);

  const columns = useMemo(() => [
    {
      name: 'Sr. No.',
      selector: (row, index) => index + 1,
      width: '80px',
      center: true,
      cell: (row, index) => <div className="font-medium text-gray-600">{index + 1}</div>,
    },
    {
      name: 'Turf Name',
      selector: row => row.name,
      cell: row => <div className="font-medium">{row.name || '—'}</div>,
      width: '240px',
    },
    {
      name: 'State',
      selector: row => row.location?.state,
      cell: row => row.location?.state || '—',
      width: '130px',
    },
    {
      name: 'District',
      selector: row => row.location?.area,
      cell: row => row.location?.area || '—',
      width: '150px',
    },
    {
      name: 'City',
      selector: row => row.location?.city,
      cell: row => row.location?.city || '—',
      width: '130px',
    },
    {
      name: 'Owner Name',
      selector: row => row.owner?.fullName,
      cell: row => row.owner?.fullName || '—',
      width: '180px',
    },
    {
      name: 'Owner Mobile',
      selector: row => row.owner?.mobile,
      cell: row => row.owner?.mobile || '—',
      width: '130px',
    },
    {
      name: 'Status',
      selector: row => row.status,
      cell: row => {
        const st = getStatusStyle(row.status);
        return (
          <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: st.dot }} />
            {st.label}
          </span>
        );
      },
      width: '150px',
    },
    {
      name: 'Action',
      cell: row => (
        <button
          onClick={() => navigate(`/admin/turf/${row.id}/verify`, { state: { turf: row } })}
          className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)] text-white font-medium text-sm rounded-xl transition-all shadow-sm hover:shadow"
        >
          Review
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '110px',
    },
  ], [navigate]);

  const filteredTurfs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return turfs.filter(turf =>
      turf?.name?.toLowerCase().includes(term) ||
      turf?.owner?.fullName?.toLowerCase().includes(term) ||
      turf?.location?.city?.toLowerCase().includes(term) ||
      turf?.location?.area?.toLowerCase().includes(term) ||
      turf?.location?.state?.toLowerCase().includes(term)
    );
  }, [turfs, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-default)] flex flex-col items-center justify-center gap-6">
        <Loader size="xl" />
        <p className="text-base font-medium text-[var(--color-text-secondary)] animate-pulse">
          Loading pending turf verifications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-default)] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-[var(--color-divider)] p-12 max-w-md w-full text-center shadow-lg">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <RiErrorWarningLine className="text-5xl text-[var(--color-error)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Error</h2>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8">{error}</p>
          <button
            onClick={fetchPendingTurfs}
            className="inline-flex items-center gap-3 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)] text-white px-10 py-4 rounded-2xl font-semibold text-base transition-all shadow-md hover:shadow-xl"
          >
            <RiRefreshLine className="text-xl" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)]" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Pending Turf Verifications
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              {filteredTurfs.length} pending {filteredTurfs.length === 1 ? 'turf' : 'turfs'} awaiting review
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-lg" />
            <input
              type="text"
              placeholder="Search by turf name, owner, state, district, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3 rounded-2xl border border-[var(--color-divider)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all text-sm bg-white shadow-sm"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredTurfs}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50]}
          responsive
          customStyles={customStyles}
          noHeader
          persistTableHead
          highlightOnHover
          pointerOnHover
          noDataComponent={
            <div className="p-16 text-center">
              <RiBuilding2Line className="text-8xl text-[var(--color-text-secondary)] opacity-30 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                No Pending Turfs Found
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                There are no turfs pending verification at the moment.
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TurfVerificationScreen;