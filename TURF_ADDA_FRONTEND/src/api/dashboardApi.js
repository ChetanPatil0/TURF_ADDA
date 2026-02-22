import api from "../lib/api";

export const geOwnerDashboardData = async () => {
  const res = await api.get('/dashboard/owner/dashboard-data');
  return res.data;
};


export const getAdminDashboardData = async () => {
  const res = await api.get('/dashboard/admin/dashboard-data');
  return res.data;
};




export const getPlayerDashboard = async (lat, lng) => {
  let url = '/dashboard/player/dashboard-data';
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    url += `?lat=${lat}&lng=${lng}`;
  }
  const res = await api.get(url);
  return res.data;
};