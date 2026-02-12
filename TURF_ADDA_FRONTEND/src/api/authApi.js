import api from '../lib/api';

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await api.post('/auth/verify-otp', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.patch('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};