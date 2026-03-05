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



// Forgot Password - Step 1: Send OTP
export const requestResetOtp = async (data) => {
  const res = await api.post('/auth/forgot-password/otp', data);
  return res.data;
};

// Forgot Password - Step 2: Verify OTP
export const verifyResetOtp = async (data) => {
  const res = await api.post('/auth/forgot-password/verify', data);
  return res.data;
};

// Forgot Password - Step 3: Set new password after OTP verification
export const resetPassword = async (data) => {
  const res = await api.post('/auth/forgot-password/reset', data);
  return res.data;
};

// Change Password (for already logged-in user)
export const changePassword = async (data) => {
  const res = await api.post('/auth/change-password', data);
  return res.data;
};