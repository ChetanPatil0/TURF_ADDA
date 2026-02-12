
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  MonetizationOn,
  CalendarToday,
  SportsSoccer,
  AddCircleOutline,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Mock stats (replace with real API data later)
  const stats = {
    todayBookings: 12,
    upcomingBookings: 28,
    monthlyRevenue: '₹48,500',
    totalTurfs: 3,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user?.profileImage}
          sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
        >
          {user?.firstName?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your turfs and bookings
          </Typography>
        </Box>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CalendarToday color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {stats.todayBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CalendarToday color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {stats.upcomingBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <MonetizationOn color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {stats.monthlyRevenue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Month Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <SportsSoccer color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {stats.totalTurfs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Turfs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddCircleOutline />}
            onClick={() => navigate('/owner/turfs/add')}
            fullWidth
            sx={{ py: 2, borderRadius: 2 }}
          >
            Add New Turf
          </Button>

          <Button
            variant="outlined"
            color="primary"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/owner/bookings')}
            fullWidth
            sx={{ py: 2, borderRadius: 2 }}
          >
            View All Bookings
          </Button>

          <Button
            variant="outlined"
            color="success"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/owner/revenue')}
            fullWidth
            sx={{ py: 2, borderRadius: 2 }}
          >
            Check Revenue
          </Button>
        </Stack>
      </Box>

      {/* Recent Bookings / Upcoming (placeholder) */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Upcoming Bookings (Today & Tomorrow)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Replace with real list later */}
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography>No upcoming bookings yet</Typography>
            <Button
              variant="text"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/owner/bookings')}
            >
              View All Bookings
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OwnerDashboard;