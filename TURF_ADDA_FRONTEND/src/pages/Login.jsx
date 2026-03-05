import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';

import AuthLayout from '../components/layout/AuthLayout';
import { loginUser } from '../api/authApi';
import useAuthStore from '../store/authStore';
import GoogleLoginButton from '../components/common/GoogleLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    const loginData = {
      identifier: data.identifier.trim(),
      password: data.password,
    };

    try {
      const res = await loginUser(loginData);
      console.log("Login response:", res.data);

      if (res?.success === true) {
        setAuth(res.data.user, res.data.token);
        toast.success('You’re logged in successfully');

        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        toast.error(res?.message || 'Login failed. Please check your details.');
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
    <AuthLayout title="Welcome Back">
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Sign in to continue your journey
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            <TextField
              label="Mobile or Email"
              fullWidth
              {...register('identifier', {
                required: 'Mobile number or email is required',
                validate: (value) => {
                  const trimmed = value.trim();
                  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
                  const isMobile = /^[6-9][0-9]{9}$/.test(trimmed);
                  return isEmail || isMobile || 'Enter a valid mobile number or email';
                },
              })}
              error={!!errors.identifier}
              helperText={errors.identifier?.message}
              placeholder="Enter mobile or email"
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              {...register('password', {
                required: 'Password is required',
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <MuiLink
              component={Link}
              to="/forgot-password"
              variant="body2"
              sx={{
                textAlign: 'right',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot Password?
            </MuiLink>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Login'}
            </Button>

            <Divider>OR</Divider>

            <Box sx={{ width: '100%' }}>
              <GoogleLoginButton onSuccessRedirect="/" />
            </Box>

            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
              Don’t have an account?{' '}
              <MuiLink
                component={Link}
                to="/signup"
                sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Register
              </MuiLink>
            </Typography>
          </Box>
        </form>
      </Box>
    </AuthLayout>
  );
};

export default Login;