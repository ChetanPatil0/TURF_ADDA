import { GoogleLogin } from '@react-oauth/google';
import { Box } from '@mui/material';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ onSuccessRedirect = '/' }) => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      const res = await api.post('/auth/google-login', { idToken });

      if (res.data.success) {
        setAuth(res.data.user, res.data.token);
        navigate(onSuccessRedirect);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Google login failed');
    }
  };

  const handleError = () => {
    alert('Google login failed');
  };

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        text="continue_with"
        shape="rectangular"
        theme="filled_black"
        size="large"
        width="100%"
      />
    </Box>
  );
};

export default GoogleLoginButton;
