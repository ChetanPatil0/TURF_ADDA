import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';
import {
  RiSearchLine,
  RiCloseLine,
  RiRefreshLine,
  RiCompassDiscoverLine,
  RiCalendarCheckLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import { getPlayerDashboard } from '../../api/dashboardApi';

import { BookingCard, EmptyState, SectionHeader, TurfCard } from '../../components/common';

const PlayerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setCoords(null);
      }
    );
  }, []);

  useEffect(() => {
    if (coords === undefined) return;
    if (hasFetched.current) return;

    const fetchDashboard = async () => {
      try {
        hasFetched.current = true;
        setLoading(true);
        setError(null);

        const response = await getPlayerDashboard(
          coords?.lat,
          coords?.lng
        );

        console.log('test',response.data)
        setData(response.data || response);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [coords]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/find-turfs?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/find-turfs');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-default)]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-default)] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <RiRefreshLine className="text-4xl text-[var(--color-error)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-all shadow-sm"
        >
          <RiRefreshLine className="text-lg" /> Try Again
        </button>
      </div>
    );
  }

  const { upcomingBookings = [], nearbyTurfs = [] } = data || {};

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)] font-['Roboto'] pb-16">
      <div className="bg-gradient-to-br from-[var(--color-primary-light)]/30 via-white to-[var(--color-primary-light)]/20 rounded-b-3xl border-b border-[var(--color-divider)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome'}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Ready for your next match? Find and book the perfect turf near you.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search turfs, cities, sports..."
                className="w-full pl-10 pr-10 py-3 bg-white border border-[var(--color-divider)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary-light)] transition-all"
              />
              <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-gray-500 pointer-events-none" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <RiCloseLine />
                </button>
              )}
            </form>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm hover:bg-[var(--color-primary-dark)] transition-all shadow-sm active:scale-95 sm:min-w-[110px]"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-14">
          <SectionHeader
            title="Turfs Near You"
            count={nearbyTurfs.length}
            onViewAll={() => navigate('/find-turfs')}
          />

          {nearbyTurfs.length === 0 ? (
            <div className="bg-[var(--color-bg-paper)] border-2 border-dashed border-[var(--color-divider)] rounded-2xl p-10 text-center">
              <EmptyState
                icon={RiCompassDiscoverLine}
                title="No nearby turfs found"
                description="We couldn't find any turfs close to your location. Browse all available options to discover more."
                action={
                  <button
                    onClick={() => navigate('/find-turfs')}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-all shadow-sm"
                  >
                    Explore Turfs <RiArrowRightLine className="text-base" />
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nearbyTurfs.map((turf, i) => (
                <TurfCard key={turf.id || i} turf={turf} />
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-[var(--color-divider)] my-14" />

        <section>
          <SectionHeader
            title="Upcoming Bookings"
            count={upcomingBookings.length}
            onViewAll={() => navigate('/bookings')}
          />

          {upcomingBookings.length === 0 ? (
            <div className="bg-[var(--color-bg-paper)] border-2 border-dashed border-[var(--color-divider)] rounded-2xl p-10 text-center">
              <EmptyState
                icon={RiCalendarCheckLine}
                title="No upcoming bookings"
                description="Looks like you don’t have any upcoming games yet. Ready to plan your next match?"
                action={
                  <button
                    onClick={() => navigate('/find-turfs')}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-all shadow-sm"
                  >
                    Explore Turfs <RiArrowRightLine className="text-base" />
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {upcomingBookings.map((booking, i) => (
                <BookingCard key={booking.id || i} booking={booking} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PlayerDashboard;