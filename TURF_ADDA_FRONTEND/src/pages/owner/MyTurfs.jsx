
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useMessageModal } from '../../context/MessageModalContext';

const MyTurfs = () => {
  const { showMessage } = useMessageModal();

  // Mock data
  const turfs = [
    { id: 1, name: 'Elite Turf 1', location: 'Mandideep', status: 'Active', bookings: 45, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800' },
  ];

  const handleDelete = (id) => {
    showMessage({
      type: 'error',
      title: 'Delete Turf?',
      message: 'This action cannot be undone. All bookings will be affected.',
      primaryText: 'Delete',
      onPrimary: () => {
        toast.success('Turf deleted successfully');
      },
      secondaryText: 'Cancel',
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={700}>
          My Turfs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          onClick={() => navigate('/owner/turfs/add')}
        >
          Add New Turf
        </Button>
      </Box>

      <Grid container spacing={3}>
        {turfs.map((turf) => (
          <Grid item xs={12} md={6} lg={4} key={turf.id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardMedia component="img" height="200" image={turf.image} alt={turf.name} />
              <CardContent>
                <Typography variant="h6">{turf.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {turf.location}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label={turf.status} color="success" size="small" />
                  <Chip label={`${turf.bookings} bookings`} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    fullWidth
                    onClick={() => toast.info('Viewing details...')}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    fullWidth
                    onClick={() => toast.info('Edit mode...')}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    fullWidth
                    onClick={() => handleDelete(turf.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyTurfs;