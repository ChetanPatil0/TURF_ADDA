import api from "../lib/api";

export const getPendingVerficationTurf = async () => {
  const res = await api.get(`/turf/pending-verification`);
  console.log('Response  : ',res)
  return res.data;
};



export const verifyTurf = async (turfId, isVerified, verificationNotes = '') => {
 
  const payload = {
    isVerified: isVerified,        
  };

  if (verificationNotes.trim()) {
    payload.verificationNotes = verificationNotes.trim();
  }

  const res = await api.patch(`/turf/${turfId}/verify`, payload);
  return res.data;
};


export const getAllUsers = async (params = {}) => {
  try {
    const res = await api.get(`/auth/users`, {
      params,
  });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch users' };
  }
};


export const softDeleteUser = async (userId) => {
  console.log('Soft deleting user with ID:', userId);
  try {
    const res = await api.delete(`/auth/users/${userId}`);
    return res.data;  
  } catch (err) {
    throw err.response?.data || { message: 'Failed to deactivate user' };
  }
};


export const cancelBooking = async (bookingId, data = {}) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/cancel`, data);
    return res.data.data;
  } catch (error) {
    const msg = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Failed to cancel booking';
    console.error('cancelBooking failed:', error);
    throw new Error(msg);
  }
};