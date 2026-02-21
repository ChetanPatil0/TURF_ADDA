import api from "../lib/api";

export const geOwnerDashboardData = async () => {
  const res = await api.get('/dashboard/owner/dashboard-data');
  return res.data;
};


export const getAdminDashboardData = async () => {
  const res = await api.get('/dashboard/admin/dashboard-data');
  return res.data;
};