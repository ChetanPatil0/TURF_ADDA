
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { MonetizationOn, TrendingUp } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Revenue = () => {
  // Mock data
  const revenue = {
    today: '₹3,200',
    thisWeek: '₹18,500',
    thisMonth: '₹48,500',
    total: '₹2,45,000',
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Revenue Overview
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.dark', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOn fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Today
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {revenue.today}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.dark', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1 }}>
                This Week
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {revenue.thisWeek}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.dark', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOn fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1 }}>
                This Month
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {revenue.thisMonth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.dark', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOn fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {revenue.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Detailed revenue reports coming soon...
        </Typography>
      </Box>
    </Box>
  );
};

export default Revenue;