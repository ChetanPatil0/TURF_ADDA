
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Rating,
} from '@mui/material';
import { toast } from 'react-toastify';

const Favorites = () => {
  // Mock favorites
  const favorites = [
    { id: 1, name: 'Elite Turf Arena', location: 'Mandideep', rating: 4.7, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        My Favorite Turfs
      </Typography>

      {favorites.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No favorites yet
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/player/find-turfs')}
          >
            Explore Turfs
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((turf) => (
            <Grid item xs={12} sm={6} md={4} key={turf.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardMedia component="img" height="180" image={turf.image} alt={turf.name} />
                <CardContent>
                  <Typography variant="h6">{turf.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {turf.location}
                  </Typography>
                  <Rating value={turf.rating} readOnly size="small" sx={{ mt: 1 }} />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => toast.info('Opening turf details...')}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Favorites;