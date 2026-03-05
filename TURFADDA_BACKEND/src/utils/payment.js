
// import { razorpayInstance } from './razorpay.js';

// export const createRazorpayOrder = async (amount, receipt, notes = {}) => {
//   try {
//     const order = await razorpayInstance.orders.create({
//       amount: Math.round(amount * 100),
//       currency: 'INR',
//       receipt: receipt || `order_${Date.now()}`,
//       notes,
//     });
//     return order;
//   } catch (err) {
//     throw new Error(`Razorpay order creation failed: ${err.message}`);
//   }
// };

// export const generatePaymentLink = (orderId) => {
//   return `https://rzp.io/i/${orderId}`;
// };

// export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
//   const shasum = crypto.createHmac('sha256', secret);
//   shasum.update(`${orderId}|${paymentId}`);
//   const digest = shasum.digest('hex');
//   return digest === signature;
// };