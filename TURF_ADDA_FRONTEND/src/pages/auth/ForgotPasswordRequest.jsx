// src/pages/auth/ForgotPasswordRequest.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/layout/AuthLayout';
import { requestResetOtp } from '../../api/authApi';

const ForgotPasswordRequest = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation logic: exactly 10 digits OR valid email
  const isValidInput = useMemo(() => {
    const trimmed = identifier.trim();

    // Case 1: exactly 10 digits (mobile)
    const isValidMobile = /^\d{10}$/.test(trimmed);

    // Case 2: basic email format
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    return isValidMobile || isValidEmail;
  }, [identifier]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidInput) {
      toast.error('Please enter a valid 10-digit mobile number or email');
      return;
    }

    setLoading(true);

    try {
      const res = await requestResetOtp({ identifier: identifier.trim() });
      if (res.success) {
        localStorage.setItem('resetIdentifier', identifier.trim());
        toast.success('OTP sent (if account exists)');
        navigate('/forgot-password/verify');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body1" align="center" color="text.secondary">
          Enter Email or Mobile Number
        </Typography>

        <TextField
          label="Enter Email or Mobile Number"
          placeholder="example@gmail.com or 9876543210"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          fullWidth
          variant="outlined"
          autoFocus
          helperText={
            identifier.trim() && !isValidInput
              ? "Enter exactly 10 digits (mobile) or valid email"
              : " "
          }
          error={identifier.trim() && !isValidInput}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            '&:hover': {
              backgroundColor: '#2BB673 !important',
              boxShadow: 'none',
              opacity: 0.94,
            },
            '&:active': {
              boxShadow: 'none',
            },
            // Optional: make disabled button look more disabled
            opacity: !isValidInput && !loading ? 0.6 : 1,
          }}
          disabled={loading || !isValidInput}
        >
          {loading ? (
            <>
              Sending... <CircularProgress size={20} sx={{ ml: 1.5, color: 'white' }} />
            </>
          ) : (
            'Send OTP'
          )}
        </Button>

        <Button
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ alignSelf: 'center' }}
        >
          Back to Login
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPasswordRequest;