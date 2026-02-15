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