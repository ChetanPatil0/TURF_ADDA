import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTurfById } from '../../api/turfApi';
import Loader from '../../components/common/Loader';
import {
  RiMapPinLine,
  RiStarFill,
  RiStarHalfFill,
  RiStarLine,
  RiFootballLine,
  RiMoneyRupeeCircleLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiImageLine,
  RiGroupLine,
  RiShieldCheckLine,
  RiParkingBoxLine,
  RiWaterFlashLine,
  RiLightbulbLine,
  RiWifiLine,
  RiChatCheckLine,
} from 'react-icons/ri';
import { formatRupee } from '../../utils';
import { BASE_URL_MEDIA } from '../../const';

/* ── Star Rating Component ───────────────────────────────────────────── */
const StarRating = ({ rating = 0, size = 18 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[...Array(full)].map((_, i) => (
        <RiStarFill key={i} style={{ color: '#F59E0B', fontSize: size }} />
      ))}
      {half && <RiStarHalfFill style={{ color: '#F59E0B', fontSize: size }} />}
      {[...Array(empty)].map((_, i) => (
        <RiStarLine key={i} style={{ color: '#D4D4D4', fontSize: size }} />
      ))}
      <span style={{ marginLeft: 8, fontSize: size - 2, fontWeight: 600, color: '#4B5563' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

/* ── Amenity with Icon ───────────────────────────────────────────────── */
const AmenityItem = ({ name }) => {
  const iconMap = {
    parking: <RiParkingBoxLine />,
    seating: <RiGroupLine />,
    drinking_water: <RiWaterFlashLine />,
    lighting: <RiLightbulbLine />,
    wifi: <RiWifiLine />,
    scoreboard: <RiChatCheckLine />,
    // add more as needed
  };

  const icon = iconMap[name] || <RiCheckLine />;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(43, 182, 115, 0.08)',
        color: 'var(--color-primary)',
        padding: '8px 16px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {icon}
      <span style={{ textTransform: 'capitalize' }}>{name.replace(/_/g, ' ')}</span>
    </div>
  );
};

/* ── No Image Placeholder ────────────────────────────────────────────── */
const NoImagePlaceholder = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
    }}
  >
    <RiImageLine style={{ fontSize: 64, opacity: 0.6 }} />
    <span style={{ marginTop: 16, fontSize: 18, fontWeight: 500 }}>
      No cover image available
    </span>
  </div>
);

/* ── Main Turf Detail Page ───────────────────────────────────────────── */
const TurfDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        setLoading(true);
        const response = await getTurfById(id);
        setTurf(response.data?.turf || response.turf || null);
      } catch (err) {
        setError(err.message || 'Failed to load turf details');
      } finally {
        setLoading(false);
      }
    };
    fetchTurf();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader />
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div style={{ minHeight: '100vh', padding: 40, textAlign: 'center' }}>
        <RiErrorWarningLine style={{ fontSize: 64, color: '#EF4444', marginBottom: 24 }} />
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>Oops!</h2>
        <p style={{ color: '#6B7280', marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          {error || "We couldn't find this turf."}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '14px 36px',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const {
    name,
    coverImage,
    location = {},
    openingTime,
    closingTime,
    pricePerSlot,
    sports = [],
    amenities = [],
    surfaceType,
    size,
    isVerified,
    description,
    reviewCount = 0,
    averageRating = 0,
  } = turf;

  const mainImage = coverImage ? `${BASE_URL_MEDIA}${coverImage}` : null;

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>

      {/* Hero Section */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 20,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          <RiArrowLeftLine style={{ fontSize: 26 }} />
        </button>

        <div style={{ height: 'clamp(280px, 50vh, 420px)', position: 'relative', overflow: 'hidden' }}>
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.7s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <NoImagePlaceholder />
          )}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '0 24px 32px',
            }}
          >
            <div style={{ maxWidth: 900 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ color: 'white', fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 800, margin: 0 }}>
                  {name}
                </h1>
                {isVerified && <RiShieldCheckLine style={{ fontSize: 32, color: '#10B981' }} title="Verified Turf" />}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, color: '#E5E7EB', fontSize: 17 }}>
                <RiMapPinLine style={{ fontSize: 20 }} />
                <span>{location.area ? `${location.area}, ` : ''}{location.city || 'Unknown location'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        {/* Quick Stats Bar */}
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            padding: '24px',
            marginBottom: 40,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <StarRating rating={averageRating} />
            <div style={{ marginTop: 6, color: '#6B7280', fontSize: 14 }}>
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-primary)' }}>
            {formatRupee(pricePerSlot)} <span style={{ fontSize: 16, fontWeight: 500, color: '#6B7280' }}>/ slot</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16 }}>
            <RiTimeLine style={{ color: 'var(--color-primary)', fontSize: 22 }} />
            {openingTime} – {closingTime}
          </div>

          <button
            onClick={() => navigate(`/book/${id}`)}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(43,182,115,0.25)',
            }}
          >
            Book Now
          </button>
        </div>

        {/* Description */}
        {description && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>About this turf</h2>
            <p style={{ lineHeight: 1.8, color: '#374151', fontSize: 16 }}>{description}</p>
          </section>
        )}

        {/* Sports & Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <RiFootballLine style={{ fontSize: 24 }} /> Sports Available
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {sports.map((sport) => (
                <span
                  key={sport}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#2563EB',
                    padding: '8px 20px',
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {sport === 'football' && <RiFootballLine />}
                  {sport === 'cricket' && <RiFootballLine style={{ transform: 'rotate(45deg)' }} />}
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Turf Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15, color: '#374151' }}>
              <div><strong>Surface:</strong> {surfaceType?.replace('_', ' ').toUpperCase() || '—'}</div>
              <div><strong>Size:</strong> {size || '—'}</div>
              <div><strong>Slot Duration:</strong> {turf.slotDurationMinutes || 60} minutes</div>
            </div>
          </section>
        </div>

        {/* Amenities */}
        {amenities?.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Facilities & Amenities</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              {amenities.map((amenity) => (
                <AmenityItem key={amenity} name={amenity} />
              ))}
            </div>
          </section>
        )}

        {/* Location Placeholder */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Location</h2>
          <div
            style={{
              background: '#EFF6FF',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              color: '#1E40AF',
              fontSize: 17,
              minHeight: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <RiMapPinLine style={{ fontSize: 48, color: '#3B82F6' }} />
            <div>
              <strong>{location.address || 'Address not provided'}</strong><br />
              {location.area}, {location.city}, {location.state} {location.pincode}
            </div>
            <p style={{ color: '#1E3A8A', opacity: 0.9 }}>Interactive map & directions coming soon</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TurfDetail;