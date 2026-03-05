import axios from "axios";

export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export async function reverseGeocodeNominatim(lat, lng) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TurfBookingApp/1.0 (contact@yourdomain.com)',
          'Referer': 'https://yourdomain.com'
        },
        timeout: 6000
      }
    );

    const data = response.data;

    if (!data?.address) {
      return { city: null, state: null };
    }

    const addr = data.address;

    return {
      city: addr.city || addr.town || addr.village || addr.suburb || null,
      state: addr.state || addr.state_district || addr.region || null
    };
  } catch (err) {
    console.error('Nominatim error:', err.message);
    return { city: null, state: null };
  }
}
