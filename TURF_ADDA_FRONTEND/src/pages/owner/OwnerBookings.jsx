
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

const OwnerBookings = () => {
  const { showMessage } = useMessageModal();

  const bookings = [
    { id: 1, player: 'Rohit S.', turf: 'Elite Turf 1', date: '15 Feb', time: '6-7 PM', status: 'Confirmed', amount: '₹800' },
  ];

  const handleConfirm = (id) => {
    showMessage({
      type: 'success',
      title: 'Confirm Booking',
      message: 'Do you want to confirm this booking?',
      primaryText: 'Confirm',
      onPrimary: () => toast.success('Booking confirmed'),
      secondaryText: 'Cancel',
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        All Bookings
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Turf</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.player}</TableCell>
                <TableCell>{booking.turf}</TableCell>
                <TableCell>{booking.date} • {booking.time}</TableCell>
                <TableCell>{booking.amount}</TableCell>
                <TableCell>
                  <Chip label={booking.status} color="success" />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => handleConfirm(booking.id)}
                  >
                    Confirm
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

export default OwnerBookings;