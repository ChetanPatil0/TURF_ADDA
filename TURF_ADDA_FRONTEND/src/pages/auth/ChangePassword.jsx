
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { changePassword } from '../../api/authApi';

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setSuccessMsg('');

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
      await changePassword({
        currentPassword,
        newPassword,
      });
      setSuccessMsg('Password changed successfully!');
      toast.success('Password changed successfully');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 2,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#fff',
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Box
        sx={{
          maxWidth: 480,
          mx: 'auto',
          mt: 6,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: '#fff',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Change Password
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            variant="outlined"
            size="medium"
            autoFocus
          />

          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#2BB673',
                fontWeight: 600,
                mb: 0.75,
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
                <li style={{ fontSize: '0.9rem', margin: '3px 0' }}>
                  At least 6 characters
                </li>
                <li style={{ fontSize: '0.9rem', margin: '3px 0' }}>
                  At least 1 uppercase letter (A-Z)
                </li>
                <li style={{ fontSize: '0.9rem', margin: '3px 0' }}>
                  At least 1 special character (!@#$%^&*)
                </li>
              </ul>
            </Box>
          </Box>

          <TextField
            label="New Password"
            placeholder="Enter new password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            variant="outlined"
            size="medium"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" size="small">
                    {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {newPassword && (
            <Box sx={{ mt: -0.5, mb: 0.5 }}>
              {newPassword.length < 6 && <FormHelperText error>Enter at least 6 characters</FormHelperText>}
              {newPassword.length >= 6 && !/[A-Z]/.test(newPassword) && (
                <FormHelperText error>Must contain at least 1 uppercase letter</FormHelperText>
              )}
              {newPassword.length >= 6 && /[A-Z]/.test(newPassword) && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && (
                <FormHelperText error>Must contain at least 1 special character</FormHelperText>
              )}
            </Box>
          )}

          <TextField
            label="Confirm New Password"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            variant="outlined"
            size="medium"
          />

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <FormHelperText error sx={{ mt: -0.5 }}>
              Passwords do not match
            </FormHelperText>
          )}

          {successMsg && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mt: 0.5 }}>
              <CheckCircle sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2">{successMsg}</Typography>
            </Box>
          )}

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
              mt: 0.5,
            }}
            disabled={
              loading ||
              !currentPassword ||
              newPassword.length < 6 ||
              !/[A-Z]/.test(newPassword) ||
              !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ||
              newPassword !== confirmPassword
            }
          >
            {loading ? (
              <>
                Updating... <CircularProgress size={20} sx={{ ml: 1.5, color: 'white' }} />
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChangePassword;

