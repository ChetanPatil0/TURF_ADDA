
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { registerUser } from '../api/authApi';
import AuthLayout from '../components/layout/AuthLayout';
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Grid,
  Typography,
} from '@mui/material';
import GoogleLoginButton from '../components/common/GoogleLoginButton';
import { useMessageModal } from '../context/MessageModalContext';

const SignupOwner = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessageModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await registerUser({ ...data, role: 'owner' });

      if (response.success) {
        localStorage.setItem('pendingMobile', data.mobile);

        showMessage({
          type: 'success',
          title: 'Success',
          message: 'Registration Successful!',
          primaryButtonText: 'Continue to OTP',
          onPrimaryClick: () => navigate('/verify-otp'),
        });
      }
    } catch (err) {
      showMessage({
        type: 'error',
        title: 'Registration Failed',
        message: err.response?.data?.message || 'Something went wrong',
        primaryButtonText: 'Try Again',
      });
    }
  };

  return (
    <AuthLayout title="Register as Turf Owner">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* First, Middle, Last Name in one row */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Middle Name (optional)"
              {...register('middleName')}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Remaining fields - same as player */}
        <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Mobile Number"
            {...register('mobile', {
              required: 'Mobile is required',
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Enter valid 10-digit mobile number',
              },
            })}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
            fullWidth
            variant="outlined"
            inputProps={{ maxLength: 10 }}
          />

          <TextField
            label="Email (optional)"
            type="email"
            {...register('email')}
            fullWidth
            variant="outlined"
          />

          <TextField
            label="Password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
            variant="outlined"
          />

          <FormControlLabel
            control={<Checkbox required />}
            label="I agree to Terms & Privacy"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{
              mt: 1,
              textTransform: 'none',
              fontWeight: 500,
              // Default MUI hover is subtle - no black overlay
            }}
          >
            Register
          </Button>
        </Box>
      </form>

      {/* Google Login */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          or register with
        </Typography>
        <GoogleLoginButton onSuccessRedirect="/" />
      </Box>
    </AuthLayout>
  );
};

export default SignupOwner;