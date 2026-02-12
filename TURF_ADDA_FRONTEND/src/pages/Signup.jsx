// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';

// import {
//   Box,
//   Button,
//   Checkbox,
//   CircularProgress,
//   FormControlLabel,
//   Grid,
//   TextField,
//   ToggleButton,
//   ToggleButtonGroup,
//   Typography,
//   InputAdornment,
//   IconButton,
// } from '@mui/material';
// import { Visibility, VisibilityOff } from '@mui/icons-material';

// import AuthLayout from '../components/layout/AuthLayout';
// import { registerUser } from '../api/authApi';

// export default function Signup() {
//   const navigate = useNavigate();

//   const [role, setRole] = useState('player');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     watch,
//   } = useForm({
//     defaultValues: {
//       termsAccepted: false,
//     },
//   });

//   const password = watch('password');

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       const response = await registerUser({ ...data, role });

//       if (response?.success) {
//         localStorage.setItem('pendingMobile', data.mobile);
//         reset();
//         navigate('/verify-otp');
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout
//       title={role === 'player' ? 'Player Registration' : 'Owner Registration'}
//     >
//       <ToggleButtonGroup
//         color="primary"
//         value={role}
//         exclusive
//         onChange={(_, newRole) => {
//           if (newRole) {
//             setRole(newRole);
//             reset();
//           }
//         }}
//         aria-label="account type"
//         fullWidth
//         sx={{
//           mb: 1.5,
//           borderRadius: 2,
//           overflow: 'hidden',
//           '& .MuiToggleButton-root': {
//             py: { xs: 1.2, md: 1.4, lg: 1.6 },
//             fontSize: { xs: '0.95rem', md: '1.05rem', lg: '1.1rem' },
//             fontWeight: 600,
//             textTransform: 'none',
//             border: 'none',
//             transition: 'none',
//             '&.Mui-selected': {
//               bgcolor: 'primary.main',
//               color: 'white',
//             },
//             '&:hover': {
//               bgcolor: 'transparent',
//             },
//           },
//           '& .MuiToggleButtonGroup-grouped': {
//             margin: 0,
//             border: 0,
//             borderRadius: 0,
//             backgroundColor: 'primary.light',
//             '&:not(:last-of-type)': {
//               borderRight: '1px solid',
//               borderColor: 'divider',
//             },
//             '&.Mui-selected': {
//               backgroundColor: 'primary.main',
//             },
//           },
//         }}
//       >
//         <ToggleButton value="player">Player Registration</ToggleButton>
//         <ToggleButton value="owner">Owner Registration</ToggleButton>
//       </ToggleButtonGroup>

//       <Typography
//         variant="caption"
//         sx={{
//           display: 'block',
//           mb: 3,
//           mt: 0.5,
//           fontStyle: 'italic',
//           color: 'text.disabled',
//           fontSize: { xs: '0.8rem', sm: '0.82rem', lg: '0.875rem' },
//           textAlign: { xs: 'center', sm: 'left' },
//         }}
//       >
//         Note : Fields marked with * are mandatory
//       </Typography>

//       <form onSubmit={handleSubmit(onSubmit)} noValidate>
//         <Grid container spacing={{ xs: 1.5, md: 2 }}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               label={
//                 <span>
//                   First Name <span style={{ color: 'error.main' }}>*</span>
//                 </span>
//               }
//               {...register('firstName', { required: 'First name is required' })}
//               error={!!errors.firstName}
//               helperText={errors.firstName?.message}
//               fullWidth
//               autoFocus
//               size="medium"
//               sx={{
//                 '& .MuiInputBase-input': {
//                   fontSize: { xs: '0.95rem', lg: '1.05rem' },
//                   py: { xs: 1.4, lg: 1.6 },
//                 },
//                 '& .MuiInputLabel-root': {
//                   fontSize: { xs: '0.9rem', lg: '1rem' },
//                 },
//               }}
//             />
//           </Grid>

//           <Grid item xs={12} sm={4}>
//             <TextField
//               label="Middle Name"
//               {...register('middleName')}
//               fullWidth
//               size="medium"
//               sx={{
//                 '& .MuiInputBase-input': {
//                   fontSize: { xs: '0.95rem', lg: '1.05rem' },
//                   py: { xs: 1.4, lg: 1.6 },
//                 },
//                 '& .MuiInputLabel-root': {
//                   fontSize: { xs: '0.9rem', lg: '1rem' },
//                 },
//               }}
//             />
//           </Grid>

//           <Grid item xs={12} sm={4}>
//             <TextField
//               label={
//                 <span>
//                   Last Name <span style={{ color: 'error.main' }}>*</span>
//                 </span>
//               }
//               {...register('lastName', { required: 'Last name is required' })}
//               error={!!errors.lastName}
//               helperText={errors.lastName?.message}
//               fullWidth
//               size="medium"
//               sx={{
//                 '& .MuiInputBase-input': {
//                   fontSize: { xs: '0.95rem', lg: '1.05rem' },
//                   py: { xs: 1.4, lg: 1.6 },
//                 },
//                 '& .MuiInputLabel-root': {
//                   fontSize: { xs: '0.9rem', lg: '1rem' },
//                 },
//               }}
//             />
//           </Grid>
//         </Grid>

//         <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: { xs: 2, lg: 2.5 } }}>
//           <TextField
//             label={
//               <span>
//                 Mobile Number <span style={{ color: 'error.main' }}>*</span>
//               </span>
//             }
//             {...register('mobile', {
//               required: 'Mobile number is required',
//               pattern: {
//                 value: /^[6-9][0-9]{9}$/,
//                 message: 'Please enter valid 10-digit number',
//               },
//             })}
//             error={!!errors.mobile}
//             helperText={errors.mobile?.message}
//             fullWidth
//             size="medium"
//             inputProps={{ maxLength: 10 }}
//             sx={{
//               '& .MuiInputBase-input': {
//                 fontSize: { xs: '0.95rem', lg: '1.05rem' },
//                 py: { xs: 1.4, lg: 1.6 },
//               },
//               '& .MuiInputLabel-root': {
//                 fontSize: { xs: '0.9rem', lg: '1rem' },
//               },
//             }}
//           />

//           <TextField
//             label="Email (optional)"
//             type="email"
//             {...register('email')}
//             fullWidth
//             size="medium"
//             sx={{
//               '& .MuiInputBase-input': {
//                 fontSize: { xs: '0.95rem', lg: '1.05rem' },
//                 py: { xs: 1.4, lg: 1.6 },
//               },
//               '& .MuiInputLabel-root': {
//                 fontSize: { xs: '0.9rem', lg: '1rem' },
//               },
//             }}
//           />

//           <TextField
//             label={
//               <span>
//                 Password <span style={{ color: 'error.main' }}>*</span>
//               </span>
//             }
//             type={showPassword ? 'text' : 'password'}
//             {...register('password', {
//               required: 'Password is required',
//               minLength: { value: 6, message: 'Minimum 6 characters' },
//             })}
//             error={!!errors.password}
//             helperText={errors.password?.message}
//             fullWidth
//             size="medium"
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton
//                     onClick={() => setShowPassword(!showPassword)}
//                     edge="end"
//                     size="medium"
//                   >
//                     {showPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//             sx={{
//               '& .MuiInputBase-input': {
//                 fontSize: { xs: '0.95rem', lg: '1.05rem' },
//                 py: { xs: 1.4, lg: 1.6 },
//               },
//               '& .MuiInputLabel-root': {
//                 fontSize: { xs: '0.9rem', lg: '1rem' },
//               },
//             }}
//           />

//           <TextField
//             label={
//               <span>
//                 Confirm Password <span style={{ color: 'error.main' }}>*</span>
//               </span>
//             }
//             type={showConfirmPassword ? 'text' : 'password'}
//             {...register('confirmPassword', {
//               required: 'Please confirm password',
//               validate: (value) => value === password || "Passwords don't match",
//             })}
//             error={!!errors.confirmPassword}
//             helperText={errors.confirmPassword?.message}
//             fullWidth
//             size="medium"
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     edge="end"
//                     size="medium"
//                   >
//                     {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//             sx={{
//               '& .MuiInputBase-input': {
//                 fontSize: { xs: '0.95rem', lg: '1.05rem' },
//                 py: { xs: 1.4, lg: 1.6 },
//               },
//               '& .MuiInputLabel-root': {
//                 fontSize: { xs: '0.9rem', lg: '1rem' },
//               },
//             }}
//           />

//           <Box sx={{ mt: 2, mb: 1 }}>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   {...register('termsAccepted', {
//                     required: 'You must agree to the Terms and Privacy Policy to register',
//                   })}
//                   size="medium"
//                   sx={{
//                     '& .MuiSvgIcon-root': { fontSize: { xs: 22, lg: 26 } },
//                     color: 'text.secondary',
//                     '&.Mui-checked': { color: 'primary.main' },
//                   }}
//                 />
//               }
//               label={
//                 <Typography
//                   component="span"
//                   variant="body1"
//                   sx={{
//                     fontSize: { xs: '0.9rem', lg: '1rem' },
//                     lineHeight: 1.5,
//                     color: 'text.primary',
//                     display: 'flex',
//                     alignItems: 'center',
//                     flexWrap: 'wrap',
//                     gap: 0.5,
//                   }}
//                 >
//                   I agree to the{' '}
//                   <Typography
//                     component="a"
//                     href="/terms"
//                     color="primary"
//                     sx={{
//                       fontWeight: 600,
//                       textDecoration: 'underline',
//                       '&:hover': { textDecoration: 'none' },
//                     }}
//                   >
//                     Terms
//                   </Typography>{' '}
//                   and{' '}
//                   <Typography
//                     component="a"
//                     href="/privacy-policy"
//                     color="primary"
//                     sx={{
//                       fontWeight: 600,
//                       textDecoration: 'underline',
//                       '&:hover': { textDecoration: 'none' },
//                     }}
//                   >
//                     Privacy Policy
//                   </Typography>
//                   <Typography
//                     component="span"
//                     color="error.main"
//                     sx={{ ml: 0.5, fontWeight: 500 }}
//                   >
//                     *
//                   </Typography>
//                 </Typography>
//               }
//               sx={{
//                 alignItems: 'flex-start',
//                 ml: 0,
//                 mr: 0,
//                 '& .MuiFormControlLabel-label': { ml: 1 },
//               }}
//             />
//             {errors.termsAccepted && (
//               <Typography
//                 variant="caption"
//                 color="error"
//                 sx={{ ml: { xs: 0, sm: 4 }, mt: 0.5, display: 'block' }}
//               >
//                 {errors.termsAccepted.message}
//               </Typography>
//             )}
//           </Box>

//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             fullWidth
//             disabled={loading}
//             sx={{
//               mt: 1.5,
//               py: { xs: 1.3, lg: 1.6 },
//               fontSize: { xs: '0.95rem', lg: '1.1rem' },
//               fontWeight: 600,
//               borderRadius: 2,
//               boxShadow: 2,
//               '&:hover': {
//                 bgcolor: '#249a62',
//                 boxShadow: 4,
//               },
//             }}
//           >
//             {loading ? (
//               <CircularProgress size={28} color="inherit" />
//             ) : (
//               `Register as ${role === 'player' ? 'Player' : 'Owner'}`
//             )}
//           </Button>
//         </Box>
//       </form>

//       <Typography
//         variant="body1"
//         align="center"
//         sx={{
//           mt: 2.5,
//           fontSize: { xs: '0.9rem', lg: '1rem' },
//           color: 'text.secondary',
//         }}
//       >
//         Already have an account?{' '}
//         <Typography
//           component="a"
//           href="/login"
//           color="primary"
//           sx={{ fontWeight: 600, textDecoration: 'none' }}
//         >
//           Sign in
//         </Typography>
//       </Typography>

     
//     </AuthLayout>
//   );
// }



import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import AuthLayout from '../components/layout/AuthLayout';
import { registerUser } from '../api/authApi';

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState('player');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      termsAccepted: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await registerUser({ ...data, role });

      if (response?.success) {
        // Save pendingId instead of mobile
        localStorage.setItem('pendingRegistrationId', response.pendingId);
        reset();
        navigate('/verify-otp');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthLayout
      title={role === 'player' ? 'Player Registration' : 'Owner Registration'}
    >
      <ToggleButtonGroup
        color="primary"
        value={role}
        exclusive
        onChange={(_, newRole) => {
          if (newRole) {
            setRole(newRole);
            reset();
          }
        }}
        aria-label="account type"
        fullWidth
        sx={{
          mb: 1.5,
          borderRadius: 2,
          overflow: 'hidden',
          '& .MuiToggleButton-root': {
            py: { xs: 1.2, md: 1.4, lg: 1.6 },
            fontSize: { xs: '0.95rem', md: '1.05rem', lg: '1.1rem' },
            fontWeight: 600,
            textTransform: 'none',
            border: 'none',
            transition: 'none',
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white',
            },
            '&:hover': {
              bgcolor: 'transparent',
            },
          },
          '& .MuiToggleButtonGroup-grouped': {
            margin: 0,
            border: 0,
            borderRadius: 0,
            backgroundColor: 'primary.light',
            '&:not(:last-of-type)': {
              borderRight: '1px solid',
              borderColor: 'divider',
            },
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
            },
          },
        }}
      >
        <ToggleButton value="player">Player Registration</ToggleButton>
        <ToggleButton value="owner">Owner Registration</ToggleButton>
      </ToggleButtonGroup>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 3,
          mt: 0.5,
          fontStyle: 'italic',
          color: 'text.disabled',
          fontSize: { xs: '0.8rem', sm: '0.82rem', lg: '0.875rem' },
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        Note : Fields marked with * are mandatory
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label={
                <span>
                  First Name <span style={{ color: 'error.main' }}>*</span>
                </span>
              }
              {...register('firstName', { required: 'First name is required' })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
              autoFocus
              size="medium"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.95rem', lg: '1.05rem' },
                  py: { xs: 1.4, lg: 1.6 },
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.9rem', lg: '1rem' },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Middle Name"
              {...register('middleName')}
              fullWidth
              size="medium"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.95rem', lg: '1.05rem' },
                  py: { xs: 1.4, lg: 1.6 },
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.9rem', lg: '1rem' },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label={
                <span>
                  Last Name <span style={{ color: 'error.main' }}>*</span>
                </span>
              }
              {...register('lastName', { required: 'Last name is required' })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
              size="medium"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.95rem', lg: '1.05rem' },
                  py: { xs: 1.4, lg: 1.6 },
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.9rem', lg: '1rem' },
                },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: { xs: 2, lg: 2.5 } }}>
          <TextField
            label={
              <span>
                Mobile Number <span style={{ color: 'error.main' }}>*</span>
              </span>
            }
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[6-9][0-9]{9}$/,
                message: 'Please enter valid 10-digit number',
              },
            })}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
            fullWidth
            size="medium"
            inputProps={{ maxLength: 10 }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.95rem', lg: '1.05rem' },
                py: { xs: 1.4, lg: 1.6 },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.9rem', lg: '1rem' },
              },
            }}
          />

          <TextField
            label="Email (optional)"
            type="email"
            {...register('email')}
            fullWidth
            size="medium"
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.95rem', lg: '1.05rem' },
                py: { xs: 1.4, lg: 1.6 },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.9rem', lg: '1rem' },
              },
            }}
          />

          <TextField
            label={
              <span>
                Password <span style={{ color: 'error.main' }}>*</span>
              </span>
            }
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
            size="medium"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="medium"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.95rem', lg: '1.05rem' },
                py: { xs: 1.4, lg: 1.6 },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.9rem', lg: '1rem' },
              },
            }}
          />

          <TextField
            label={
              <span>
                Confirm Password <span style={{ color: 'error.main' }}>*</span>
              </span>
            }
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: (value) => value === password || "Passwords don't match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            fullWidth
            size="medium"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="medium"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.95rem', lg: '1.05rem' },
                py: { xs: 1.4, lg: 1.6 },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.9rem', lg: '1rem' },
              },
            }}
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  {...register('termsAccepted', {
                    required: 'You must agree to the Terms and Privacy Policy to register',
                  })}
                  size="medium"
                  sx={{
                    '& .MuiSvgIcon-root': { fontSize: { xs: 22, lg: 26 } },
                    color: 'text.secondary',
                    '&.Mui-checked': { color: 'primary.main' },
                  }}
                />
              }
              label={
                <Typography
                  component="span"
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.9rem', lg: '1rem' },
                    lineHeight: 1.5,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 0.5,
                  }}
                >
                  I agree to the{' '}
                  <Typography
                    component="a"
                    href="/terms"
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'underline',
                      '&:hover': { textDecoration: 'none' },
                    }}
                  >
                    Terms
                  </Typography>{' '}
                  and{' '}
                  <Typography
                    component="a"
                    href="/privacy-policy"
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'underline',
                      '&:hover': { textDecoration: 'none' },
                    }}
                  >
                    Privacy Policy
                  </Typography>
                  <Typography
                    component="span"
                    color="error.main"
                    sx={{ ml: 0.5, fontWeight: 500 }}
                  >
                    *
                  </Typography>
                </Typography>
              }
              sx={{
                alignItems: 'flex-start',
                ml: 0,
                mr: 0,
                '& .MuiFormControlLabel-label': { ml: 1 },
              }}
            />
            {errors.termsAccepted && (
              <Typography
                variant="caption"
                color="error"
                sx={{ ml: { xs: 0, sm: 4 }, mt: 0.5, display: 'block' }}
              >
                {errors.termsAccepted.message}
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1.5,
              py: { xs: 1.3, lg: 1.6 },
              fontSize: { xs: '0.95rem', lg: '1.1rem' },
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                bgcolor: '#249a62',
                boxShadow: 4,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : (
              `Register as ${role === 'player' ? 'Player' : 'Owner'}`
            )}
          </Button>
        </Box>
      </form>

      <Typography
        variant="body1"
        align="center"
        sx={{
          mt: 2.5,
          fontSize: { xs: '0.9rem', lg: '1rem' },
          color: 'text.secondary',
        }}
      >
        Already have an account?{' '}
        <Typography
          component="a"
          href="/login"
          color="primary"
          sx={{ fontWeight: 600, textDecoration: 'none' }}
        >
          Sign in
        </Typography>
      </Typography>
    </AuthLayout>
  );
}