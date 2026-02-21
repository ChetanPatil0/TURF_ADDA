import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';

import {
  RiGroupLine,
  RiBuilding2Line,
  RiShieldCheckLine,
  RiUserAddLine,
  RiBarChartBoxLine,
  RiErrorWarningLine,
  RiRefreshLine,
  RiArrowRightSLine,
  RiMapPinLine,
  RiEyeLine,
  RiCalendarEventLine,
  RiUserSettingsLine,
} from 'react-icons/ri';

import { getAdminDashboardData } from '../../api/dashboardApi';

import {
  formatNumber,
  getGreeting,
  getTodayShort,
  getStatusStyle,
} from '../../utils/index';

const todayLabel = getTodayShort;

const getSportClass = () =>
  'bg-[color-mix(in srgb,var(--color-disabled)_15%,white)] text-[#333333] font-medium';

const BigStat = ({ icon: Icon, iconBg, iconColor, label, value, trend, sub }) => {
  const up = (trend ?? 0) >= 0;
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-divider)] p-5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-snug">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`text-lg ${iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-[var(--color-text-primary)] leading-none tracking-tight">{value}</p>
      {trend != null && (
        <div className="flex items-center gap-1">
          <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
            {up ? <RiArrowUpLine /> : <RiArrowDownLine />}
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">vs last month</span>
        </div>
      )}
      <p className="text-[11px] text-[var(--color-text-secondary)] border-t border-[var(--color-divider)] pt-2 mt-0.5">
        {sub ?? todayLabel()}
      </p>
    </div>
  );
};

const Card = ({ title, badge, onViewAll, viewAllLabel = 'View all', children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-[var(--color-divider)] overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-divider)]">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">{title}</h2>
        {badge != null && badge > 0 && (
          <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
        >
          {viewAllLabel} <RiArrowRightSLine className="text-sm" />
        </button>
      )}
    </div>
    {children}
  </div>
);

const Empty = ({ icon: Icon, title, desc, action }) => (
  <div className="py-10 flex flex-col items-center text-center gap-2 px-6">
    <div className="w-11 h-11 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
      <Icon className="text-xl text-[#D4D4D4]" />
    </div>
    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
    {desc && <p className="text-xs text-[var(--color-text-secondary)] max-w-[15rem] leading-relaxed">{desc}</p>}
    {action}
  </div>
);

const PendingTurfRow = ({ turf, onView }) => {
  const st = getStatusStyle(turf.status);
  const loc = [turf.area, turf.city].filter(Boolean).join(', ') || 'Location not set';
  return (
    <div className="px-5 py-4 border-b border-[var(--color-divider)] last:border-0 hover:bg-[var(--color-bg-default)] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
          {turf.coverImage ? (
            <img src={turf.coverImage} alt={turf.name} className="w-full h-full object-cover" />
          ) : (
            <RiBuilding2Line className="text-2xl text-[var(--color-primary)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{turf.name}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
            <RiMapPinLine className="text-[var(--color-primary)]" /> {loc}
          </p>
          <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
            {st.label}
          </span>
        </div>
        <button
          onClick={onView}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
        >
          Review
        </button>
      </div>
    </div>
  );
};

const ActionTile = ({ icon: Icon, label, desc, onClick, accent = false }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md active:scale-[0.98] ${
      accent
        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)]'
        : 'bg-white border-[var(--color-divider)] hover:border-[var(--color-primary)]'
    }`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-white/20' : 'bg-[var(--color-primary-light)]'}`}>
      <Icon className={`text-xl ${accent ? 'text-white' : 'text-[var(--color-primary)]'}`} />
    </div>
    <div>
      <p className={`text-sm font-bold ${accent ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>{label}</p>
      <p className={`text-[11px] ${accent ? 'text-white/70' : 'text-[var(--color-text-secondary)]'}`}>{desc}</p>
    </div>
  </button>
);

const PageLoading = () => (
  <div className="min-h-screen bg-[var(--color-bg-default)] flex flex-col items-center justify-center gap-4">
    <Loader size="xl" />
    <p className="text-sm font-medium text-[var(--color-text-secondary)] animate-pulse">Loading admin dashboard…</p>
  </div>
);

const PageError = ({ message, onRetry }) => (
  <div className="min-h-screen bg-[var(--color-bg-default)] flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl border border-[var(--color-divider)] p-8 max-w-sm w-full text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <RiErrorWarningLine className="text-3xl text-[var(--color-error)]" />
      </div>
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Dashboard unavailable</h2>
      <p className="text-[var(--color-text-secondary)] text-sm mb-6 leading-relaxed">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-[var(--color-error)] hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
      >
        <RiRefreshLine /> Try Again
      </button>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminDashboardData();
      setData(res?.data || res);
    } catch (e) {
        console.log('error',e)
      setError(e.response?.data?.message || e.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = (user?.role || '').toLowerCase();

    if (!isAuthenticated || (role !== 'admin' && role !== 'superadmin')) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, user?.role, navigate, fetchData]);

  const go = (path) => () => navigate(path);

  const stats = data?.stats ?? {};
  const pendingTurfs = data?.pendingTurfs ?? [];

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <PageLoading />;
  if (error && !data) return <PageError message={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)]" style={{ fontFamily: 'Roboto, sans-serif' }}>

      <div className="sticky top-0 z-20 bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-tight truncate">
              {getGreeting()}, <span className="text-[var(--color-primary)]">Admin</span>
            </h1>
            <p className="text-[11px] text-[var(--color-text-secondary)]">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={go('/admin/users')}
              className="hidden sm:flex items-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold px-3.5 py-2 rounded-xl text-xs transition-all"
            >
              <RiGroupLine className="text-sm" /> Users
            </button>
            <button
              onClick={go('/admin/turfs/pending')}
              className="hidden sm:flex items-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold px-3.5 py-2 rounded-xl text-xs transition-all"
            >
              <RiShieldCheckLine className="text-sm" /> Verify Turfs
            </button>
            <button
              onClick={go('/admin/reports')}
              className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <RiBarChartBoxLine className="text-sm" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BigStat
            icon={RiGroupLine}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Total Users"
            value={formatNumber(stats.totalUsers)}
            trend={stats.userTrend ?? null}
            sub={`New today: ${formatNumber(stats.newUsersToday)}`}
          />
          <BigStat
            icon={RiBuilding2Line}
            iconBg="bg-[var(--color-primary-light)]"
            iconColor="text-[var(--color-primary)]"
            label="Total Turfs"
            value={formatNumber(stats.totalTurfs)}
            trend={stats.turfTrend ?? null}
            sub={`Pending: ${formatNumber(stats.pendingTurfs)}`}
          />
          <BigStat
            icon={RiShieldCheckLine}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
            label="Pending Verifications"
            value={formatNumber(stats.pendingTurfs)}
            trend={null}
            sub="Requires review"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="lg:col-span-2 space-y-6">

            <section>
              <h2 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ActionTile icon={RiUserAddLine} label="Add Admin" desc="Create new admin" onClick={go('/admin/add-admin')} accent />
                <ActionTile icon={RiShieldCheckLine} label="Pending Turfs" desc="Verify new venues" onClick={go('/admin/turfs/pending')} />
                <ActionTile icon={RiGroupLine} label="Manage Users" desc="View & control users" onClick={go('/admin/users')} />
                <ActionTile icon={RiBarChartBoxLine} label="Platform Reports" desc="Analytics & logs" onClick={go('/admin/reports')} />
              </div>
            </section>

            <Card title="Pending Turf Verifications" badge={stats.pendingTurfs} onViewAll={go('/admin/turfs/pending')}>
              {pendingTurfs.length === 0 ? (
                <Empty icon={RiBuilding2Line} title="No pending turfs" desc="All turfs are verified or no new registrations." />
              ) : (
                <div className="divide-y divide-[var(--color-divider)]">
                  {pendingTurfs.slice(0, 5).map((turf) => (
                    <PendingTurfRow
                      key={turf.id}
                      turf={turf}
                      onView={() => navigate(`/admin/turf/${turf.id}/verify`)}
                    />
                  ))}
                </div>
              )}
            </Card>

          </div>

          <div className="flex flex-col gap-5">

            <div className="bg-[var(--color-bg-paper)] rounded-2xl border border-[var(--color-divider)] p-5">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">Management Snapshot</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Users', value: formatNumber(stats.totalUsers), icon: RiGroupLine, bg: 'bg-blue-50', color: 'text-blue-600' },
                  { label: 'Total Turfs', value: formatNumber(stats.totalTurfs), icon: RiBuilding2Line, bg: 'bg-[var(--color-primary-light)]', color: 'text-[var(--color-primary)]' },
                  { label: 'Pending Verifications', value: formatNumber(stats.pendingTurfs), icon: RiShieldCheckLine, bg: 'bg-orange-50', color: 'text-orange-600' },
                  { label: 'New Users Today', value: formatNumber(stats.newUsersToday), icon: RiUserAddLine, bg: 'bg-green-50', color: 'text-green-600' },
                ].map(({ label, value, icon: Icon, bg, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon className={`text-sm ${color}`} />
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={go('/admin/turfs/pending')}
              className="w-full flex items-center gap-3 p-4 bg-[var(--color-primary-light)] rounded-2xl border border-[color-mix(in srgb,var(--color-primary)_20%,transparent)] hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                <RiShieldCheckLine className="text-white text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-text-primary)]">Pending Verifications</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Review & approve new turfs</p>
              </div>
              <RiArrowRightSLine className="text-[var(--color-primary)] text-xl group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <div className="flex gap-3 sm:hidden">
              <button
                onClick={go('/admin/users')}
                className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] font-semibold py-3 rounded-xl text-xs hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              >
                <RiGroupLine /> Users
              </button>
              <button
                onClick={go('/admin/turfs/pending')}
                className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] font-semibold py-3 rounded-xl text-xs hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              >
                <RiShieldCheckLine /> Verify
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;