
import api from "../lib/api";

export const createBooking = async (data) => {
  console.log('createBooking response:', data);
  try {
    const res = await api.post('/booking', data);

    return res.data;
  } catch (error) {
    console.error('createBooking error:', error);
    const msg = error.response?.data?.message || error.message || 'Failed to create booking';
    throw new Error(msg);
  }
};


export const recordCashPayment = async (bookingId, amount, note = '') => {
  try {
    const res = await api.post('/booking/cash-payment', {
      bookingId,
      amount,
      note,
    });
    return res.data;
  } catch (error) {
    console.error('recordCashPayment error:', error);
    const msg = error.response?.data?.message || error.message || 'Failed to record cash payment';
    throw new Error(msg);
  }
};


export const verifyRazorpayPayment = async (paymentResponse) => {
  try {
    const res = await api.post('/booking/verify-payment', {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    });
    return res.data;
  } catch (error) {
    console.error('verifyRazorpayPayment error:', error);
    const msg = error.response?.data?.message || error.message || 'Failed to verify payment';
    throw new Error(msg);
  }
};

export const createOfflineBooking = async (turfId, data) => {
  try {
    const res = await api.post(`/bookings/offline-booking/${turfId}`, data);
    return res.data;
  } catch (error) {
    console.error('createOfflineBooking error:', error);
    const msg = error.response?.data?.message || error.message || 'Failed to create offline booking';
    throw new Error(msg);
  }
};



// export const getBookingDetails = async (bookingId) => {
//   try {
//     const res = await api.get(`/bookings/${bookingId}`);
//     return res.data.data;
//   } catch (error) {
//     console.error('getBookingDetails error:', error);
//     const msg = error.response?.data?.message || 'Failed to load booking details';
//     throw new Error(msg);
//   }
// };
export const getMyBookings = async (params = {}) => {
  try {
    const res = await api.get('/booking/my-bookings', { params });
    return res.data.data;
  } catch (error) {
    const msg = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Failed to load bookings';
    console.error('getMyBookings failed:', error);
    throw new Error(msg);
  }
};

export const payBalance = async (bookingId, payload) => {
  try {
    const res = await api.post(`/booking/${bookingId}/pay-balance`, payload);
    return res.data.data;
  } catch (error) {
    const msg = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Failed to process payment';
    console.error('payBalance failed:', error);
    throw new Error(msg);
  }
};

export const getUpcomingBookings = async () => {
  try {
    const res = await api.get('/booking/upcoming');
    return res.data.data.bookings || [];
  } catch (error) {
    const msg = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Failed to load upcoming bookings';
    console.error('getUpcomingBookings failed:', error);
    throw new Error(msg);
  }
};

export const markOfflinePayment = async (bookingId, payload) => {
  try {
    const res = await api.post(`/booking/${bookingId}/mark-offline-payment`, payload);
    return res.data.data;
  } catch (error) {
    const msg = error.response?.data?.message 
      || error.response?.data?.error 
      || error.message 
      || 'Failed to record offline payment';
    console.error('markOfflinePayment failed:', error);
    throw new Error(msg);
  }
};