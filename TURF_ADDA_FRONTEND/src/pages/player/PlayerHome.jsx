
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Chip,
  Stack,
} from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMessageModal } from '../../context/MessageModalContext';


const PlayerHome = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessageModal();

  const [featuredTurfs, setFeaturedTurfs] = useState([]);

  useEffect(() => {
    // TODO: Replace with real API call
    setFeaturedTurfs([
      { id: 1, name: 'Elite Turf Arena', location: 'Mandideep', price: '₹800/hr', rating: 4.7, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800' },
      { id: 2, name: 'GreenField Sports', location: 'Hoshangabad Rd', price: '₹700/hr', rating: 4.5, image: 'https://images.unsplash.com/photo-1570549717488-8d3d8a3c9e5f?w=800' },
    ]);

    // Example: show welcome toast once
    toast.success('Welcome to Turfadda Player Dashboard!', { autoClose: 3000 });
  }, []);

  const handleQuickSearch = () => {
    showMessage({
      type: 'info',
      title: 'Search Turfs',
      message: 'Enter location, date, or sport to find available turfs nearby.',
      primaryText: 'Search Now',
      onPrimary: () => navigate('/player/find-turfs'),
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Hero */}
      <Box
        sx={{
          mb: 5,
          textAlign: 'center',
          bgcolor: 'primary.light',
          borderRadius: 3,
          p: { xs: 4, md: 6 },
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Find & Book Your Turf
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Play football, cricket or any sport – book in seconds
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Search />}
          onClick={handleQuickSearch}
          sx={{ py: 1.8, px: 5, borderRadius: 3 }}
        >
          Search Nearby Turfs
        </Button>
      </Box>

      {/* Featured Turfs */}
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Recommended Turfs Near Mandideep
      </Typography>

      <Grid container spacing={3}>
        {featuredTurfs.map((turf) => (
          <Grid item xs={12} sm={6} md={4} key={turf.id}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
              }}
            >
              <CardMedia component="img" height="200" image={turf.image} alt={turf.name} />
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  {turf.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {turf.location}
                  </Typography>
                </Stack>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Rating value={turf.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {turf.price}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      toast.info(`Booking ${turf.name}... (coming soon)`);
                      // navigate(`/turf/${turf.id}`);
                    }}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlayerHome;