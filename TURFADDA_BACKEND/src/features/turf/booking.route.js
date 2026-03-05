import express from 'express';
import {
  createBooking,
  verifyOnlinePayment,
  recordCashPayment,
  createOfflineBookingByOwner,
  razorpayWebhook,
  getMyBookings,
  cancelBooking,
  getUpcomingBookings,
  markOfflinePaymentReceived,
  payBookingBalance,
} from '../turf/booking.controller.js';
import { authCheck, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/', authCheck, createBooking);
router.post('/verify-payment', verifyOnlinePayment);
router.post('/cash-payment', authCheck, recordCashPayment);
router.post('/offline-booking/:turfId', authCheck, authorizeRoles('owner', 'staff', 'admin', 'superadmin'), createOfflineBookingByOwner);
router.post('/razorpay-webhook', razorpayWebhook);
router.get('/my-bookings', authCheck, getMyBookings);
router.post('/:bookingId/pay-balance',authCheck, payBookingBalance);
router.post('/:bookingId/mark-offline-payment',authCheck, authorizeRoles('owner', 'staff', 'admin', 'superadmin'), markOfflinePaymentReceived);
router.post('/:bookingId/cancel', authCheck, authorizeRoles('owner', 'staff', 'admin', 'superadmin'), cancelBooking);
router.get('/upcoming', authCheck, getUpcomingBookings);

export default router;