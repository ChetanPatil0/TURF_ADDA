import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/layout/AuthLayout';
import { verifyResetOtp, resetPassword, requestResetOtp } from '../../api/authApi';

const ForgotPasswordVerify = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [step, setStep] = useState('otp');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const identifier = localStorage.getItem('resetIdentifier');

  useEffect(() => {
    if (!identifier) {
      toast.error('Session expired. Please try again.');
      navigate('/forgot-password');
    }
  }, [identifier, navigate]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return toast.error('Please enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await verifyResetOtp({ identifier, otp });
      if (res.success) {
        toast.success('OTP verified');
        setStep('password');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendLoading(true);
    try {
      const res = await requestResetOtp({ identifier });
      if (res.success) {
        toast.success('New OTP sent');
        setResendTimer(60);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setSuccessMsg('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Must contain at least 1 uppercase letter');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError('Must contain at least 1 special character');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ identifier, newPassword });
      if (res.success) {
        setSuccessMsg('Password reset successfully!');
        toast.success('Password reset successful! Redirecting...');
        localStorage.removeItem('resetIdentifier');
        setTimeout(() => navigate('/login', { replace: true }), 1800);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={step === 'otp' ? 'Verify OTP' : 'Set New Password'}>
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {step === 'otp' ? (
          <>
            <Typography variant="body1" align="center" color="text.secondary">
              Enter 6-digit code sent to <strong>{identifier}</strong>
            </Typography>

            <TextField
              label="Enter OTP"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
              }}
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', letterSpacing: '10px', fontSize: '1.8rem' },
              }}
              fullWidth
              variant="outlined"
              autoFocus
            />

            <Button
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
              }}
              disabled={loading || otp.length !== 6}
              onClick={handleVerifyOtp}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Didn't receive code?{' '}
                {resendTimer > 0 ? (
                  <span style={{ color: '#6B7280' }}>
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </Button>
                )}
              </Typography>
            </Box>
          </>
        ) : (
          <>
            {/* Password Guide - Centered, above field */}
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#2BB673',
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Password must contain:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStylePosition: 'inside',
                    color: '#2BB673',
                    textAlign: 'left',
                    maxWidth: '340px',
                  }}
                >
                  <li style={{ fontSize: '0.875rem', margin: '2px 0' }}>
                    At least 6 characters
                  </li>
                  <li style={{ fontSize: '0.875rem', margin: '2px 0' }}>
                    At least 1 uppercase letter (A-Z)
                  </li>
                  <li style={{ fontSize: '0.875rem', margin: '2px 0' }}>
                    At least 1 special character (!@#$%^&*)
                  </li>
                </ul>
              </Box>
            </Box>

            {/* New Password field */}
            <TextField
              label="New Password"
              placeholder="Enter new password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              variant="outlined"
              size="medium"
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!!passwordError}
            />

            {/* Validation errors - very close to field */}
            {newPassword && (
              <Box sx={{ mt: -1, mb: 0.5 }}>
                {newPassword.length < 6 && (
                  <FormHelperText error>Enter at least 6 characters</FormHelperText>
                )}
                {newPassword.length >= 6 && !/[A-Z]/.test(newPassword) && (
                  <FormHelperText error>Must contain at least 1 uppercase letter</FormHelperText>
                )}
                {newPassword.length >= 6 && /[A-Z]/.test(newPassword) && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && (
                  <FormHelperText error>Must contain at least 1 special character</FormHelperText>
                )}
              </Box>
            )}

            {/* Confirm field - close spacing */}
            <TextField
              label="Confirm New Password"
              placeholder="Confirm new password"
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              variant="outlined"
              size="medium"
            />

            {/* Match error - tight */}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <FormHelperText error sx={{ mt: -1, mb: 0.5 }}>
                Passwords do not match
              </FormHelperText>
            )}

            {/* Success message */}
            {successMsg && (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mt: 0.5 }}>
                <CheckCircle sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2">{successMsg}</Typography>
              </Box>
            )}

            {/* Reset Password button */}
            <Button
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
                mt: 0.5,
              }}
              disabled={
                loading ||
                newPassword.length < 6 ||
                !/[A-Z]/.test(newPassword) ||
                !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ||
                newPassword !== confirmPassword
              }
              onClick={handleResetPassword}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            {/* Back to Login / Cancel button - visible only in password step */}
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              size="large"
              sx={{
                mt: 1,
                textTransform: 'none',
                borderColor: '#9e9e9e',
                color: '#424242',
                '&:hover': {
                  borderColor: '#757575',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                },
              }}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </>
        )}
      </Box>
    </AuthLayout>
  );
};

export default ForgotPasswordVerify;