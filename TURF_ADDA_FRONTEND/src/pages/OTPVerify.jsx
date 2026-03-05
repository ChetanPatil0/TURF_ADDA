import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, TextField, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import AuthLayout from '../components/layout/AuthLayout';
import { verifyOtp } from '../api/authApi';
import useAuthStore from '../store/authStore';

const OTPVerify = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const pendingId = localStorage.getItem('pendingRegistrationId');
      if (!pendingId) {
        throw new Error('No active registration session found. Please try registering again.');
      }

      const res = await verifyOtp({ pendingId, otp });

      if (res?.success) {
        setAuth(res.user, res.token);
        localStorage.removeItem('pendingRegistrationId');

        toast.success('OTP verified! Logging you in...');

        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        toast.error(res?.message || 'Verification failed');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify Mobile Number">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body1" align="center" color="text.secondary">
          Enter 6-digit code sent to your mobile
        </Typography>

        <TextField
          label="OTP"
          value={otp}
          onChange={handleChange}
          inputProps={{
            maxLength: 6,
            style: { textAlign: 'center', letterSpacing: '12px', fontSize: '1.5rem' },
          }}
          fullWidth
          variant="outlined"
          autoFocus
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <>
              Verifying... <CircularProgress size={20} sx={{ ml: 1.5, color: 'white' }} />
            </>
          ) : (
            'Verify OTP'
          )}
        </Button>

        <Typography variant="body2" align="center">
          Didn't receive code?{' '}
          <Button variant="text" color="primary" sx={{ textTransform: 'none' }}>
            Resend
          </Button>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default OTPVerify;