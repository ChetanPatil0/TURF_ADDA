import React, { useEffect, useState } from 'react';
import { FiSearch, FiMapPin, FiClock, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMessageModal } from '../../context/MessageModalContext';

const PlayerHome = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessageModal();

  const [featuredTurfs, setFeaturedTurfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: Replace with real API call
    setFeaturedTurfs([
      {
        id: 1,
        name: 'Elite Turf Arena',
        location: 'Mandideep',
        price: 800,
        rating: 4.7,
        reviews: 124,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        sports: ['Football', 'Cricket'],
        available: true,
      },
      {
        id: 2,
        name: 'GreenField Sports',
        location: 'Hoshangabad Rd',
        price: 700,
        rating: 4.5,
        reviews: 98,
        image: 'https://images.unsplash.com/photo-1570549717488-8d3d8a3c9e5f?w=800',
        sports: ['Football', 'Basketball'],
        available: true,
      },
      {
        id: 3,
        name: 'Victory Sports Complex',
        location: 'Bhopal Road',
        price: 900,
        rating: 4.8,
        reviews: 156,
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
        sports: ['Football', 'Cricket', 'Tennis'],
        available: false,
      },
    ]);

    toast.success('Welcome to Turfadda! 🎉', { autoClose: 2000 });
  }, []);

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/player/find-turfs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/player/find-turfs');
    }
  };

  const handleBookNow = (turf) => {
    if (!turf.available) {
      toast.warn('This turf is currently unavailable');
      return;
    }
    showMessage({
      type: 'info',
      title: `Book ${turf.name}`,
      message: `Ready to book ${turf.name} at ₹${turf.price}/hr?`,
      primaryText: 'Continue to Booking',
      secondaryText: 'Cancel',
      onPrimary: () => navigate(`/turf/${turf.id}`),
    });
  };

  return (
    <div className="min-h-full space-y-8 md:space-y-12">
      {/* Hero Section with Search */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-primary)] p-8 md:p-12 shadow-xl">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect Turf
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Book premium sports turfs in minutes. Football, Cricket, Basketball & more.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center gap-3 flex-1 px-5 py-4">
                <FiSearch className="text-gray-400 flex-shrink-0" size={22} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                  placeholder="Search by location, sport, or turf name..."
                  className="w-full outline-none text-base text-[var(--color-text-primary)] placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleQuickSearch}
                className="bg-[var(--color-primary)] text-white px-6 md:px-8 py-4 font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Search
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {['Near Me', 'Football', 'Cricket', 'Available Today'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => navigate(`/player/find-turfs?filter=${filter.toLowerCase()}`)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Available Turfs', value: '50+', icon: '🏟️' },
          { label: 'Happy Players', value: '5000+', icon: '⚽' },
          { label: 'Cities', value: '15+', icon: '📍' },
          { label: 'Bookings Today', value: '200+', icon: '📅' },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--color-bg-paper)] rounded-xl p-6 border border-[var(--color-divider)] text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)] mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[var(--color-text-secondary)]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Featured Turfs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Top Rated Turfs Near You
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Premium turfs recommended just for you
            </p>
          </div>
          <button
            onClick={() => navigate('/player/find-turfs')}
            className="hidden sm:block text-[var(--color-primary)] font-semibold hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTurfs.map((turf, index) => (
            <div
              key={turf.id}
              className="group bg-[var(--color-bg-paper)] rounded-2xl overflow-hidden border border-[var(--color-divider)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Image Container */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={turf.image}
                  alt={turf.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Availability Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      turf.available
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {turf.available ? '✓ Available' : 'Booked'}
                  </span>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => navigate(`/turf/${turf.id}`)}
                    className="px-4 py-2 bg-white text-[var(--color-primary)] rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Title & Location */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 line-clamp-1">
                    {turf.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-sm">
                    <FiMapPin size={16} className="flex-shrink-0" />
                    <span className="line-clamp-1">{turf.location}</span>
                  </div>
                </div>

                {/* Sports Tags */}
                <div className="flex flex-wrap gap-2">
                  {turf.sports.map((sport) => (
                    <span
                      key={sport}
                      className="px-2.5 py-1 bg-[var(--color-primary-light)]/30 text-[var(--color-primary)] rounded-full text-xs font-medium"
                    >
                      {sport}
                    </span>
                  ))}
                </div>

                {/* Rating & Price Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-divider)]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-500 fill-yellow-500" size={18} />
                      <span className="font-bold text-[var(--color-text-primary)]">
                        {turf.rating}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      ({turf.reviews})
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      Starting from
                    </div>
                    <div className="text-xl font-bold text-[var(--color-primary)]">
                      ₹{turf.price}/hr
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={() => handleBookNow(turf)}
                  disabled={!turf.available}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    turf.available
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98] shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {turf.available ? 'Book Now' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button - Mobile */}
        <button
          onClick={() => navigate('/player/find-turfs')}
          className="sm:hidden w-full py-3 bg-[var(--color-bg-paper)] text-[var(--color-primary)] rounded-xl font-semibold border border-[var(--color-divider)] hover:bg-gray-50 transition-colors"
        >
          View All Turfs →
        </button>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary-light)]/50 rounded-2xl p-8 md:p-10 text-center border border-[var(--color-primary)]/20">
        <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-3">
          Own a Sports Turf?
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-2xl mx-auto">
          Join Turfadda and reach thousands of players looking to book your venue.
        </p>
        <button
          onClick={() => {
            toast.info('Partner registration coming soon!');
          }}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-all shadow-md hover:shadow-lg"
        >
          Become a Partner
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerHome;