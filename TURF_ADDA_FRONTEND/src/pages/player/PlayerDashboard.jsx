import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';
import {
  RiCalendarLine,
  RiMapPinLine,
  RiFootballLine,
  RiTimeLine,
  RiStarFill,
  RiStarHalfFill,
  RiStarLine,
  RiErrorWarningLine,
  RiSearchLine,
  RiArrowRightLine,
  RiImageLine,
  RiCalendarCheckLine,
  RiCompassDiscoverLine,
  RiRefreshLine,
  RiWallet3Line,
  RiMapPin2Line,
} from 'react-icons/ri';
import { getPlayerDashboard } from '../../api/dashboardApi';
import { formatDateDDMMYYYY, formatRupee } from '../../utils';

const BASE_URL_MEDIA = import.meta.env.VITE_BASE_URL_MEDIA || 'http://localhost:5000';

/* ── Star Rating ─────────────────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[...Array(full)].map((_, i) => (
        <RiStarFill key={`f${i}`} style={{ color: '#F59E0B', fontSize: 13 }} />
      ))}
      {half && <RiStarHalfFill style={{ color: '#F59E0B', fontSize: 13 }} />}
      {[...Array(empty)].map((_, i) => (
        <RiStarLine key={`e${i}`} style={{ color: '#D4D4D4', fontSize: 13 }} />
      ))}
      <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
};

/* ── No Image Placeholder ───────────────────────────────────────────── */
const NoImagePlaceholder = () => (
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#F3F4F6',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
     
    }}>
      <RiImageLine style={{ fontSize: 24, color: '#9CA3AF' }} />
    </div>
    <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.04em' }}>No Image</span>
  </div>
);

/* ── Booking Card ───────────────────────────────────────────────────── */
const BookingCard = ({ booking }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/bookings/${booking.id}`)}
      style={{
        background: 'var(--color-bg-paper)',
        border: '1px solid var(--color-divider)',
        borderRadius: 16,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(43,182,115,0.12)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-divider)';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {booking.turfName}
          </div>
          <div style={{
            marginTop: 6, display: 'inline-flex', alignItems: 'center',
            background: 'var(--color-primary-light)', color: 'var(--color-primary)',
            fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Confirmed
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <RiCalendarCheckLine style={{ fontSize: 20, color: 'var(--color-primary)' }} />
        </div>
      </div>

      {/* Info chips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { icon: RiCalendarLine, label: formatDateDDMMYYYY(booking.date) },
          { icon: RiTimeLine, label: booking.time },
          booking.sport ? { icon: RiFootballLine, label: booking.sport } : null,
          { icon: RiWallet3Line, label: formatRupee(booking.totalPrice), highlight: true },
        ].filter(Boolean).map(({ icon: Icon, label, highlight }, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: highlight ? 'var(--color-primary-light)' : '#F9FAFB',
            borderRadius: 10, padding: '8px 12px',
          }}>
            <Icon style={{ fontSize: 14, color: highlight ? 'var(--color-primary)' : 'var(--color-text-secondary)', flexShrink: 0 }} />
            <span style={{
              fontSize: 12, fontWeight: highlight ? 700 : 500,
              color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Turf Card ──────────────────────────────────────────────────────── */
const TurfCard = ({ turf }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const imgSrc = turf.coverImage ? `${BASE_URL_MEDIA}${turf.coverImage}` : null;
  const showDistance = turf.distanceKm != null;
  console.log('Conver image ',imgSrc)
    console.log('Conver imgError ',imgError)
  return (
    <div
      onClick={() => navigate(`/turf/${turf.id}`)}
      style={{
        background: 'var(--color-bg-paper)',
        border: '1px solid var(--color-divider)',
        borderRadius: 16, overflow: 'hidden',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(43,182,115,0.13)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-divider)';
      }}
    >
      {/* Image */}
      <div style={{ height: 155, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={turf.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <NoImagePlaceholder />
        )}

        {/* Distance badge — only shown when distanceKm is present */}
        {showDistance && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(6px)',
            borderRadius: 20, padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <RiMapPin2Line style={{ color: 'var(--color-primary)', fontSize: 13 }} />
            {turf.distanceKm} km away
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Name & Location */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {turf.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <RiMapPinLine style={{ fontSize: 12, color: 'var(--color-primary)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {[turf.location?.area, turf.location?.city].filter(Boolean).join(', ') || '—'}
            </span>
          </div>
        </div>

        {/* Rating — only show if rating exists */}
        {turf.rating != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRating rating={turf.rating} />
            {turf.reviewCount != null && (
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                ({turf.reviewCount} {turf.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </div>
        )}

        {/* Sports tags */}
        {turf.sports?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {turf.sports.slice(0, 3).map((sport) => (
              <span key={sport} style={{
                fontSize: 11, fontWeight: 600,
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
              }}>
                {sport}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: 12,
          borderTop: '1px solid var(--color-divider)',
        }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              ₹{turf.pricePerSlot}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginLeft: 4 }}>/ slot</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/player/turf/${turf.id}`); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '8px 16px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
          >
            Book Now
            <RiArrowRightLine style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Empty State ─────────────────────────────────────────────────────── */
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 12,
  }}>
    <div style={{
      width: 60, height: 60, borderRadius: 16,
      background: 'var(--color-primary-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon style={{ fontSize: 28, color: 'var(--color-primary)' }} />
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 280 }}>{description}</div>
    </div>
    {action}
  </div>
);

/* ── Section Header ──────────────────────────────────────────────────── */
const SectionHeader = ({ title, count, onViewAll }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>{title}</h2>
      {count > 0 && (
        <span style={{
          background: 'var(--color-primary)', color: '#fff',
          fontSize: 11, fontWeight: 700,
          minWidth: 22, height: 22, borderRadius: 11,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 6px',
        }}>
          {count}
        </span>
      )}
    </div>
    {count > 0 && onViewAll && (
      <button
        onClick={onViewAll}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: 'var(--color-primary)',
          padding: 0,
        }}
      >
        View All <RiArrowRightLine style={{ fontSize: 15 }} />
      </button>
    )}
  </div>
);

/* ── Main Dashboard ──────────────────────────────────────────────────── */
const PlayerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null)
      );
    }
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPlayerDashboard(coords?.lat, coords?.lng);
        console.log('Dashboard response:', response);
        setData(response.data || response);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [coords]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-default)' }}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-default)', gap: 16, padding: 24, textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RiErrorWarningLine style={{ fontSize: 28, color: 'var(--color-error)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-text-primary)' }}>Something went wrong</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{error}</div>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 12, padding: '10px 24px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <RiRefreshLine /> Try Again
        </button>
      </div>
    );
  }

  const { upcomingBookings = [], nearbyTurfs = [], location = {} } = data || {};

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--color-bg-default)', fontFamily: 'Roboto, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{
        width: '100%',
        background: 'var(--color-bg-paper)',
        borderBottom: '1px solid var(--color-divider)',
        padding: '28px 0 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--color-primary)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
            }}>
              Dashboard
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2 }}>
              {user?.firstName ? `Hello, ${user.firstName}` : 'Hello there'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6, marginBottom: 0, lineHeight: 1.6 }}>
              Manage your bookings and discover turfs available to play at.
            </p>
          </div>

          {/* Full-width search */}
          <button
            onClick={() => navigate('/turfs')}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--color-bg-default)',
              border: '1.5px solid var(--color-divider)',
              borderRadius: 14, padding: '12px 18px',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-divider)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RiSearchLine style={{ fontSize: 18, color: 'var(--color-primary)' }} />
            </div>
            <span style={{ flex: 1, fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 400, textAlign: 'left' }}>
              Search turfs, locations, sports...
            </span>
            <RiArrowRightLine style={{ fontSize: 16, color: 'var(--color-text-secondary)', flexShrink: 0 }} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px', boxSizing: 'border-box' }}>

        {/* Upcoming Bookings */}
        <section style={{ marginBottom: 44 }}>
          <SectionHeader
            title="Upcoming Bookings"
            count={upcomingBookings.length}
            onViewAll={() => navigate('/bookings')}
          />
          {upcomingBookings.length === 0 ? (
            <div style={{
              background: 'var(--color-bg-paper)',
              border: '1.5px dashed var(--color-divider)',
              borderRadius: 16,
            }}>
              <EmptyState
                icon={RiCalendarCheckLine}
                title="No upcoming bookings"
                description="You have no upcoming slots booked. Explore turfs nearby and reserve your next game."
                action={
                  <button
                    onClick={() => navigate('/turfs')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--color-primary)', color: '#fff',
                      border: 'none', borderRadius: 10, padding: '9px 20px',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
                    }}
                  >
                    Explore Turfs <RiArrowRightLine />
                  </button>
                }
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {upcomingBookings.map((booking, i) => (
                <BookingCard key={booking.id || i} booking={booking} />
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-divider)', marginBottom: 44 }} />

        {/* Nearby Turfs */}
        <section>
          <SectionHeader
            title="Turfs Near You"
            count={nearbyTurfs.length}
            onViewAll={() => navigate('/turfs')}
          />
          {nearbyTurfs.length === 0 ? (
            <div style={{
              background: 'var(--color-bg-paper)',
              border: '1.5px dashed var(--color-divider)',
              borderRadius: 16,
            }}>
              <EmptyState
                icon={RiCompassDiscoverLine}
                title="No turfs found nearby"
                description="Enable location access to discover turfs close to you, or browse all available turfs."
                action={
                  <button
                    onClick={() => navigate('/turfs')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--color-primary)', color: '#fff',
                      border: 'none', borderRadius: 10, padding: '9px 20px',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
                    }}
                  >
                    Browse All Turfs <RiArrowRightLine />
                  </button>
                }
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {nearbyTurfs.map((turf, i) => (
                <TurfCard key={turf.id || i} turf={turf} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PlayerDashboard;