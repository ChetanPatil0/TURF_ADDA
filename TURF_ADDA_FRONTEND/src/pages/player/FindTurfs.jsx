
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Rating,
  Stack,
} from '@mui/material';
import { Search, LocationOn, FilterList } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useMessageModal } from '../../context/MessageModalContext';

const FindTurfs = () => {
  const { showMessage } = useMessageModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [turfs] = useState([
    { id: 1, name: 'Elite Turf', location: 'Mandideep', price: '₹800/hr', rating: 4.7 },
    { id: 2, name: 'GreenField', location: 'Bhopal', price: '₹700/hr', rating: 4.5 },
  ]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showMessage({
        type: 'warning',
        title: 'Search Required',
        message: 'Please enter a location, sport, or turf name to search.',
        primaryText: 'OK',
      });
      return;
    }
    toast.info(`Searching for "${searchQuery}"...`);
    // TODO: API call
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Find Turfs
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search by location, sport, or turf name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <Button variant="contained" size="small" onClick={handleSearch}>
                <Search />
              </Button>
            ),
          }}
        />
        <Button variant="outlined" startIcon={<FilterList />}>
          Filters
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {turfs.map((turf) => (
          <Grid item xs={12} sm={6} md={4} key={turf.id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">{turf.name}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">{turf.location}</Typography>
                </Stack>
                <Rating value={turf.rating} readOnly size="small" sx={{ mt: 1 }} />
                <Typography variant="body1" fontWeight={600} sx={{ mt: 2 }}>
                  {turf.price}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => toast.success(`Selected ${turf.name}`)}
                >
                  View & Book
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FindTurfs;