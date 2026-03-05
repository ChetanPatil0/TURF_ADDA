import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  RiSearchLine,
  RiRefreshLine,
  RiCompassDiscoverLine,
  RiErrorWarningLine,
  RiCloseLine,
  RiMapPinLine,
} from 'react-icons/ri';
import { toast } from 'react-toastify';

import Loader from '../../components/common/Loader';
import { EmptyState, SectionHeader, TurfCard } from '../../components/common';
import { getDiscoverTurfs } from '../../api/turfApi';

const MemoizedSkeletonCard = React.memo(() => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse shadow-sm">
    <div className="h-40 bg-gray-200" />
    <div className="p-4.5 space-y-2.5">
      <div className="h-5 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-8 bg-gray-200 rounded mt-3" />
    </div>
  </div>
));

const FindTurfs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const loadTurfs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDiscoverTurfs(params);
      const data = response.data || response;

      if (params.search) {
        setSections([{ title: `Results for "${params.search}"`, turfs: data.turfs || [] }]);
        setIsSearchMode(true);
      } else {
        setSections(data.sections || []);
        setIsSearchMode(false);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Failed to load turfs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');

    if (searchParam) {
      setSearchQuery(searchParam);
      loadTurfs({ search: searchParam });
    } else {
      loadTurfs();
    }
  }, [location.search, loadTurfs]);

  useEffect(() => {
    if (!searchQuery.trim() && !location.search) {
      loadTurfs({});
    }
  }, [searchQuery, loadTurfs, location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    navigate('');
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadTurfs({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast.error(
          err.code === 1 ? 'Location permission denied' : 'Unable to get your location'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isEmpty = useMemo(
    () => sections.length === 0 || sections.every((s) => s.turfs?.length === 0),
    [sections]
  );

  const skeletonArray = useMemo(() => Array(8).fill(0), []);
  const canSearch = !!searchQuery.trim();

  if (loading && sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-default)]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)] pb-20 font-['Roboto']">
      <div className="bg-white border-b border-[var(--color-divider)] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-1">
            Explore Turfs
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            Find and book the best turfs near you or anywhere in India
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search turfs, cities, sports..."
                className="w-full pl-10 pr-10 py-3 bg-white border border-[var(--color-divider)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary-light)] transition-all"
              />
              <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RiCloseLine className="text-2xl" />
                </button>
              )}
            </form>

            <button
              onClick={handleFindNearby}
              disabled={isLocating}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all active:scale-95 ${
                isLocating ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <RiMapPinLine className="text-lg" />
              {isLocating ? 'Locating...' : 'Near Me'}
            </button>

            <button
              type="submit"
              disabled={!canSearch}
              onClick={handleSubmit}
              className={`px-6 py-3 rounded-2xl font-semibold text-sm shadow-sm transition-all active:scale-95 min-w-[100px] ${
                canSearch
                  ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
              <RiErrorWarningLine className="text-5xl text-[var(--color-error)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
              Something went wrong
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-md">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadTurfs({});
              }}
              className="flex items-center gap-3 px-8 py-3.5 bg-[var(--color-primary)] text-white rounded-2xl font-semibold hover:bg-[var(--color-primary-dark)] transition-all active:scale-95"
            >
              <RiRefreshLine className="text-lg" /> Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {skeletonArray.map((_, i) => (
              <MemoizedSkeletonCard key={i} />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl py-20 px-6 text-center">
            <EmptyState
              icon={RiCompassDiscoverLine}
              title="No turfs found"
              description="Try searching with a different keyword, city, or sport, or use 'Near Me' to find turfs close to you."
            />
          </div>
        ) : (
          <div className="space-y-16">
            {sections.map((section, idx) => (
              <section key={idx}>
                <SectionHeader
                  title={section.title}
                  count={section.turfs?.length || 0}
                  onViewAll={null}
                />
                {section.turfs?.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center text-sm text-gray-600">
                    No turfs available in this section right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {section.turfs.map((turf) => (
                      <TurfCard key={turf.id} turf={turf} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FindTurfs);