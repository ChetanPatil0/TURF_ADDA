
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useMessageModal } from '../../context/MessageModalContext';

const AddTurf = () => {
  const { showMessage } = useMessageModal();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pricePerHour: '',
    sportType: '',
    amenities: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.pricePerHour) {
      showMessage({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please fill all required fields',
        primaryText: 'OK',
      });
      return;
    }

    toast.success('Turf added successfully!');
    // TODO: API call
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Add New Turf
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Turf Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location / Address *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price per Hour (₹) *"
              name="pricePerHour"
              type="number"
              value={formData.pricePerHour}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sport Type *</InputLabel>
              <Select
                name="sportType"
                value={formData.sportType}
                label="Sport Type *"
                onChange={handleChange}
                required
              >
                <MenuItem value="football">Football (5-a-side / 7-a-side)</MenuItem>
                <MenuItem value="cricket">Cricket Nets</MenuItem>
                <MenuItem value="multi">Multi-Sport</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Amenities
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {['Parking', 'Washroom', 'Lighting', 'Changing Room', 'Water', 'Seating'].map((amenity) => (
                <FormControlLabel
                  key={amenity}
                  control={
                    <Checkbox
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                    />
                  }
                  label={amenity}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3, py: 1.8 }}
            >
              Add Turf
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AddTurf;