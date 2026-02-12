
import { Box, Typography, Avatar, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import useAuthStore from '../store/authStore';
import { useEffect } from 'react';
import { getProfile } from '../api/authApi';

const Profile = () => {
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success) {
          setAuth(res.user, localStorage.getItem('token'));
        }
      } catch (err) {
        console.error('Profile fetch failed', err);
      }
    };

    if (!user) {
      fetchProfile();
    }
  }, [user, setAuth]);

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Avatar
          src={user.profileImage || ''}
          sx={{ width: 120, height: 120, mb: 2 }}
        />
        <Typography variant="h5" fontWeight="bold">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Typography>
      </Box>

      <List sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <ListItem>
          <ListItemText primary="Mobile" secondary={user.mobile} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Email" secondary={user.email || 'Not added'} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="City" secondary={user.city || 'Not set'} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Preferred Sports" secondary={user.preferredSports?.join(', ') || 'None'} />
        </ListItem>
      </List>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="outlined" fullWidth>
          Edit Profile
        </Button>
        <Button variant="outlined" color="error" fullWidth>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;