
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useMessageModal } from '../../context/MessageModalContext';

const Bookings = () => {
  const { showMessage } = useMessageModal();

  // Mock data
  const bookings = [
    { id: 1, turf: 'Elite Turf', date: '15 Feb 2026', time: '6:00 PM - 7:00 PM', status: 'Confirmed', price: '₹800' },
    { id: 2, turf: 'GreenField', date: '18 Feb 2026', time: '8:00 PM - 9:00 PM', status: 'Pending', price: '₹700' },
  ];

  const handleCancel = (id) => {
    showMessage({
      type: 'warning',
      title: 'Cancel Booking?',
      message: 'Are you sure you want to cancel this booking?',
      primaryText: 'Yes, Cancel',
      onPrimary: () => {
        toast.success('Booking cancelled successfully');
      },
      secondaryText: 'No',
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        My Bookings
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Turf</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.turf}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>{booking.price}</TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={booking.status === 'Confirmed' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Bookings;