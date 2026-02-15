import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/common/UserAvatar';
import { getMyTurfs } from '../../api/turfApi';
import Loader from '../../components/common/Loader';

const OwnerDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [errorTurfs, setErrorTurfs] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'owner') {
      navigate('/login');
      return;
    }

    const fetchTurfs = async () => {
      try {
        setLoadingTurfs(true);
        setErrorTurfs('');
        const data = await getMyTurfs();
        setTurfs(data.turfs || []);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to load turfs. Please try again.';
        setErrorTurfs(msg);
        toast.error(msg);
      } finally {
        setLoadingTurfs(false);
      }
    };

    fetchTurfs();
  }, [isAuthenticated, user?.role, navigate]);

  const navigateTo = (path) => () => navigate(path);

  const stats = [
    { title: "Today's Bookings", value: "12", icon: "calendar", color: "primary" },
    { title: "Upcoming Bookings", value: "28", icon: "clock", color: "blue" },
    { title: "This Month Revenue", value: "₹48,500", icon: "rupee", color: "green" },
    { title: "Active Turfs", value: loadingTurfs ? null : turfs.length, icon: "turf", color: "primary" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/40 pb-16">
      {/* Hero / Welcome */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0">
              <UserAvatar
                src={user?.profileImage}
                name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                size={80}
                className="ring-4 ring-white/30 shadow-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome back, {user?.firstName || 'Owner'}!
              </h1>
              <p className="mt-2 text-green-100 text-lg">
                Here's what's happening with your turfs today
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="space-y-10 md:space-y-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.title}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`text-${stat.color}-600 mb-4`}>
                  {stat.icon === 'calendar' && (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {stat.icon === 'clock' && (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {stat.icon === 'rupee' && (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )}
                  {stat.icon === 'turf' && (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {stat.value ?? <Loader size="sm" inline />}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <button
                onClick={navigateTo('/owner/add-turf')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Turf
              </button>

              <button
                onClick={navigateTo('/owner/bookings')}
                className="border-2 border-green-600 text-green-700 hover:bg-green-50 px-6 py-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Bookings
              </button>

              <button
                onClick={navigateTo('/owner/revenue')}
                className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-6 py-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Revenue Overview
              </button>
            </div>
          </section>

          {/* My Turfs Section */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">My Turfs</h2>
            </div>

            {loadingTurfs ? (
              <div className="p-16 flex flex-col items-center justify-center">
                <Loader size="xl" />
                <p className="mt-6 text-gray-500 text-lg">Loading your turfs...</p>
              </div>
            ) : errorTurfs ? (
              <div className="p-16 text-center">
                <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Something went wrong</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">{errorTurfs}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : turfs.length === 0 ? (
              <div className="p-16 text-center">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">No turfs yet</h3>
                <p className="text-gray-500 mb-8">Start by adding your first sports turf</p>
                <button
                  onClick={navigateTo('/owner/turfs/new')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Turf
                </button>
              </div>
            ) : (
              <div className="p-6">
                {/* Here you can render actual turf cards/list */}
                <div className="text-center py-12 text-gray-600">
                  {turfs.length} turfs loaded successfully
                  {/* <TurfCards turfs={turfs} /> */}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;