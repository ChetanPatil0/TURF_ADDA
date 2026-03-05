import api from "../lib/api";


export const createTurf = async (formData) => {
  const res = await api.post('/turf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getMyTurfs = async () => {
  const res = await api.get('/turf/my');
  return res.data;
};

export const getTurfById = async (identifier) => {
  const res = await api.get(`/turf/${identifier}`);
  return res.data;
};

// Soft delete turf
export const deleteTurf = async (id) => {
  const res = await api.delete(`/turf/${id}`);
  return res.data;
};

// Hard delete turf (superadmin only)
export const hardDeleteTurf = async (id) => {
  const res = await api.delete(`/turf/${id}/hard`);
  return res.data;
};

export const getDiscoverTurfs = async (params = {}) => {
  try {
    const response = await api.get('/turf/discover', { params });
    return response.data;
  } catch (error) {
    console.error('getDiscoverTurfs error:', error);
    const msg = error.response?.data?.message || error.message || 'Failed to load turfs';
    throw new Error(msg);
  }
};

export const updateTurf = async (turfId, formData) => {
  const res = await api.patch(`/turf/${turfId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const assignStaffToTurf = async (turfId, staffId) => {
  const res = await api.post(`/turf/${turfId}/staff`, { staffId });
  return res.data;
};

export const removeStaffFromTurf = async (turfId, staffId) => {
  const res = await api.delete(`/turf/${turfId}/staff/${staffId}`);
  return res.data;
};

export const getTurfStaff = async (turfId) => {
  const res = await api.get(`/turf/${turfId}/staff`);
  return res.data;
};

export const generateSlots = async (turfId, days = 30) => {
  const res = await api.post(`/turf/${turfId}/generate-slots`, { days });
  return res.data;
};

export const getAvailableSlots = async (turfId, date) => {
  const res = await api.get(`/turf/${turfId}/available-slots`, {
    params: { date },
  });
  return res.data;
};

export const blockSlot = async (slotId, reason = 'Maintenance') => {
  const res = await api.patch(`/slots/${slotId}/block`, { reason });
  return res.data;
};

export const unblockSlot = async (slotId) => {
  const res = await api.patch(`/slots/${slotId}/unblock`);
  return res.data;
};