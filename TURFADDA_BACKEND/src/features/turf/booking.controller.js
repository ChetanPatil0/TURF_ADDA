import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import Booking from '../turf/booking.model.js';
import Slot from '../turf/slot.model.js';
import Turf from '../turf/turf.model.js';
import User from '../auth/auth.model.js';
import { razorpayInstance } from '../../utils/razorpay.js';
import { sendEmail } from '../../utils/email.js';
import { sendError, sendSuccess } from '../../utils/errorHandler.js';
import mongoose from 'mongoose';

function calculateAdvance(totalAmount, turf) {

  const type = turf?.preBookingAmountType || 'percentage'
  const value = Number(turf?.preBookingAmountValue) || 0
  const minPercent = Number(turf?.minAdvancePercentage) || 0

  let advance = 0

  if (type === 'percentage') {
    advance = totalAmount * (value / 100)
  } else {
    advance = value
  }

  const minAdvance = totalAmount * (minPercent / 100)

  advance = Math.max(advance, minAdvance)

  if (!advance || isNaN(advance)) {
    advance = totalAmount
  }

  return Math.ceil(advance)
}
const HOLD_MINUTES = 5;



export const createBooking = async (req, res) => {
  try {
    const { turfId, date, slotIds = [], sport, paymentMethod = 'online' } = req.body;

    if (!slotIds.length) return sendError(res, 400, 'At least one slot required');

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) return sendError(res, 404, 'Turf not found');

    const player = req.user;

    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const expireAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    const holdResult = await Slot.updateMany(
      {
        id: { $in: slotIds },
        turf: turf.id,
        date: requestedDate,
        status: 'available',
        $or: [
          { heldUntil: { $exists: false } },
          { heldUntil: { $lt: now } }
        ]
      },
      {
        $set: {
          status: 'held',
          heldBy: player.id,
          heldUntil: expireAt
        }
      }
    );

    if (holdResult.matchedCount !== slotIds.length) {
      return sendError(res, 410, 'Some selected slots are no longer available.');
    }

    const slots = await Slot.find({
      id: { $in: slotIds },
      turf: turf.id,
      date: requestedDate
    }).lean();

    if (!slots.length) return sendError(res, 404, 'Slots not found');

    const totalAmount = slots.reduce((sum, slot) => sum + (slot.price || 0), 0);
    const durationMinutes = slots.length * turf.slotDurationMinutes;

    let advanceRequired = calculateAdvance(totalAmount, turf);
    // let advanceRequired = 1;
    if (!advanceRequired || advanceRequired <= 0) advanceRequired = totalAmount;

    const booking = new Booking({
      id: uuidv4(),
      player: player.id,
      turf: turf.id,
      slots: slots.map(s => s._id),
      date: requestedDate,
      durationMinutes,
      sport,
      totalAmount,
      platformFee: Math.round(totalAmount * (turf.platformCommissionRate || 0.15)),
      ownerPayout: Math.round(totalAmount * (1 - (turf.platformCommissionRate || 0.15))),
      advanceRequired,
      advancePaid: 0,
      balanceDue: totalAmount,
      paymentStatus: 'pending',
      status: 'pending',
      paymentMethod,
      advancePaymentMethod: paymentMethod === 'online' ? 'online' : 'cash',
      createdBy: player.id,
      bookingSource: 'app'
    });

    let razorpayOrder = null;
    let paymentLink = null;

    if (paymentMethod === 'online') {
      const amount = Math.round(advanceRequired * 100);

      razorpayOrder = await razorpayInstance.orders.create({
        amount,
        currency: 'INR',
        receipt: `booking_${booking.id.slice(0, 12)}`,
        notes: {
          bookingId: booking.id,
          turfId: turf.id,
          playerId: player.id
        }
      });

      booking.payments.push({
        amount: advanceRequired,
        method: 'online',
        transactionId: razorpayOrder.id,
        status: 'pending'
      });

      paymentLink = `https://rzp.io/i/${razorpayOrder.id}`;
    }

    await booking.save();

    if (player.email) {
      await sendEmail({
        to: player.email,
        subject: 'Your Booking is Created – Pay Advance',
        html: `
          <h3>Booking Details</h3>
          <p>Turf: <strong>${turf.name}</strong></p>
          <p>Date: ${requestedDate.toLocaleDateString('en-IN')}</p>
          <p>Slots: ${slots.map(s => `${s.startTime}–${s.endTime}`).join(', ')}</p>
          <p>Total Amount: ₹${totalAmount}</p>
          <p>Advance Required: ₹${advanceRequired}</p>
          ${paymentLink ? `<p><a href="${paymentLink}">Pay Now</a></p>` : ``}
          <p>Booking ID: ${booking.id}</p>
        `
      });
    }

    const owner = await User.findOne({ id: turf.owner });
    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: `New Booking on ${turf.name}`,
        html: `
          <p>Player: ${player.firstName} ${player.lastName || ''}</p>
          <p>Date: ${requestedDate.toLocaleDateString('en-IN')}</p>
          <p>Total: ₹${totalAmount}</p>
          <p>Advance: ₹${advanceRequired}</p>
          <p>Booking ID: ${booking.id}</p>
        `
      });
    }

    return sendSuccess(res, {
      booking: {
        id: booking.id,
        totalAmount,
        advanceRequired,
        balanceDue: totalAmount - advanceRequired,
        paymentLink,
        razorpayOrderId: razorpayOrder?.id
      }
    }, 'Booking created');

  } catch (err) {
    return sendError(res, 500, 'Failed to create booking');
  }
};

export const verifyOnlinePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return sendError(res, 400, 'Invalid payment signature');
    }

    const booking = await Booking.findOne({
      'payments.transactionId': razorpay_order_id,
      paymentStatus: 'pending',
    });

    if (!booking) return sendError(res, 404, 'No pending booking found for this order');

    const paymentEntry = booking.payments.find(p => p.transactionId === razorpay_order_id);
    paymentEntry.status = 'success';
    paymentEntry.paidAt = new Date();
    paymentEntry.transactionId = razorpay_payment_id;

    booking.advancePaid = booking.advanceRequired;
    booking.balanceDue = booking.totalAmount - booking.advancePaid;
    booking.paymentStatus = booking.balanceDue > 0 ? 'partial' : 'paid';
    booking.status = 'confirmed';

    await booking.save();

    const player = await User.findOne({ id: booking.player });
    const turf = await Turf.findOne({ id: booking.turf });
    const owner = await User.findOne({ id: turf.owner });

    if (player?.email) {
      await sendEmail({
        to: player.email,
        subject: 'Advance Payment Successful – Booking Confirmed',
        html: `<p>₹${booking.advancePaid} received!</p><p>Booking confirmed for ${turf.name}.</p><p>Remaining: ₹${booking.balanceDue}</p>`,
      });
    }

    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: 'Advance Received',
        html: `<p>Advance ₹${booking.advancePaid} for booking #${booking.id}</p><p>Balance due: ₹${booking.balanceDue}</p>`,
      });
    }

    sendSuccess(res, { bookingId: booking.id, status: booking.status }, 'Advance verified');
  } catch (err) {
    console.error(err);
    sendError(res, 500, 'Payment verification failed');
  }
};

export const recordCashPayment = async (req, res) => {
  try {
    const { bookingId, amount, note = '' } = req.body;

    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) return sendError(res, 404, 'Booking not found');

    const turf = await Turf.findOne({ id: booking.turf });
    const isAuthorized =
      turf.owner === req.user.id ||
      turf.staff.includes(req.user.id) ||
      ['admin', 'superadmin'].includes(req.user.role);

    if (!isAuthorized) return sendError(res, 403, 'Not authorized to record payment');

    if (amount <= 0 || amount > booking.balanceDue) {
      return sendError(res, 400, 'Invalid payment amount');
    }

    booking.balanceDue -= amount;
    booking.payments.push({
      amount,
      method: 'cash',
      paidAt: new Date(),
      status: 'success',
      note,
    });

    if (booking.balanceDue <= 0) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
    } else if (booking.advancePaid + amount >= booking.advanceRequired) {
      booking.paymentStatus = 'partial';
      booking.status = 'confirmed';
    }

    await booking.save();

    const player = await User.findOne({ id: booking.player });
    if (player?.email) {
      await sendEmail({
        to: player.email,
        subject: 'Payment Received (Cash)',
        html: `<p>₹${amount} cash received for booking #${booking.id}.</p><p>Remaining balance: ₹${booking.balanceDue}</p>`,
      });
    }

    sendSuccess(res, { booking }, 'Cash payment recorded');
  } catch (err) {
    sendError(res, 500, 'Failed to record cash');
  }
};

export const createOfflineBookingByOwner = async (req, res) => {
  try {
    const { turfId } = req.params;
    const {
      date,
      slotIds = [],
      sport,
      playerName,
      playerMobile,
      paymentMethod = 'cash',
      advancePaidNow = 0,
    } = req.body;

    if (!slotIds.length) return sendError(res, 400, 'At least one slot required');

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) return sendError(res, 404, 'Turf not found');

    const isAuthorized =
      turf.owner === req.user.id ||
      turf.staff.includes(req.user.id) ||
      ['admin', 'superadmin'].includes(req.user.role);

    if (!isAuthorized) return sendError(res, 403, 'Not authorized');

    const slots = await Slot.find({
      id: { $in: slotIds },
      turf: turf.id,
      date: new Date(date),
      status: 'available',
    }).lean();

    if (slots.length !== slotIds.length) {
      return sendError(res, 410, 'Some slots unavailable');
    }

    const totalAmount = slots.reduce((sum, slot) => sum + slot.price, 0);
    const durationMinutes = slots.length * turf.slotDurationMinutes;

    const advanceRequired = calculateAdvance(totalAmount, turf);

    if (advancePaidNow > advanceRequired) {
      return sendError(res, 400, 'Advance paid cannot exceed required');
    }

    const booking = new Booking({
      id: uuidv4(),
      player: null,
      playerName,
      playerMobile,
      turf: turf.id,
      slots: slots.map(s => s._id),
      date: new Date(date),
      durationMinutes,
      sport,
      totalAmount,
      platformFee: Math.round(totalAmount * (turf.platformCommissionRate || 0.15)),
      ownerPayout: Math.round(totalAmount * (1 - (turf.platformCommissionRate || 0.15))),
      advanceRequired,
      advancePaid: advancePaidNow,
      balanceDue: totalAmount - advancePaidNow,
      paymentStatus: advancePaidNow >= advanceRequired ? 'partial' : 'pending',
      status: advancePaidNow >= advanceRequired ? 'confirmed' : 'pending',
      paymentMethod,
      advancePaymentMethod: paymentMethod === 'online' ? 'online' : 'cash',
      createdBy: req.user.id,
      bookingSource: 'owner',
    });

    let razorpayOrder = null;
    let paymentLink = null;

    if (paymentMethod === 'online' && advancePaidNow < advanceRequired) {
      const remaining = advanceRequired - advancePaidNow;

      razorpayOrder = await razorpayInstance.orders.create({
        amount: remaining * 100,
        currency: 'INR',
        receipt: `offline_${booking.id.slice(0, 12)}`,
        notes: {
          bookingId: booking.id,
          turfId: turf.id,
          createdBy: req.user.id,
        },
      });

      booking.payments.push({
        amount: remaining,
        method: 'online',
        transactionId: razorpayOrder.id,
        status: 'pending',
      });

      paymentLink = `https://rzp.io/i/${razorpayOrder.id}`;
    }

    if (advancePaidNow > 0) {
      booking.payments.push({
        amount: advancePaidNow,
        method: 'cash',
        paidAt: new Date(),
        status: 'success',
        note: 'Advance collected offline',
      });
    }

    await booking.save();

    await Slot.updateMany(
      { id: { $in: slotIds } },
      {
        $set: {
          status: 'booked',
          bookedBy: req.user.id,
          booking: booking._id,
        },
      }
    );

    const owner = await User.findOne({ id: turf.owner });
    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: `Offline Booking Created on ${turf.name}`,
        html: `
          <p>Created by: ${req.user.firstName || req.user.role}</p>
          <p>Date: ${new Date(date).toLocaleDateString('en-IN')}</p>
          <p>Player: ${playerName || 'Walk-in'} (${playerMobile || 'N/A'})</p>
          <p>Total: ₹${totalAmount}</p>
          <p>Advance Paid: ₹${advancePaidNow}</p>
          <p>Balance Due: ₹${booking.balanceDue}</p>
          <p>Status: ${booking.status}</p>
          <p>Booking ID: ${booking.id}</p>
          ${paymentLink ? `<p>Payment link for remaining: ${paymentLink}</p>` : ''}
        `,
      });
    }

    sendSuccess(res, {
      booking: {
        id: booking.id,
        totalAmount,
        advanceRequired,
        advancePaid: advancePaidNow,
        balanceDue: booking.balanceDue,
        paymentLink,
        razorpayOrderId: razorpayOrder?.id,
        status: booking.status,
        message: paymentMethod === 'online' && advancePaidNow < advanceRequired
          ? 'Offline booking created. Share link for remaining advance.'
          : 'Offline booking created successfully.',
      },
    }, 'Offline booking created');
  } catch (err) {
    console.error('Offline booking error:', err);
    sendError(res, 500, 'Failed to create offline booking');
  }
};

export const razorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body;
  const { payload } = event;

  try {
    if (event.event === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.order_id;

      const booking = await Booking.findOne({
        'payments.transactionId': orderId,
        paymentStatus: { $in: ['pending', 'partial'] },
      });

      if (booking) {
        const paymentEntry = booking.payments.find(p => p.transactionId === orderId);
        if (paymentEntry) {
          paymentEntry.status = 'success';
          paymentEntry.paidAt = new Date();
          paymentEntry.transactionId = paymentId;
          paymentEntry.gatewayResponse = payload.payment.entity;
        }

        booking.advancePaid = booking.advanceRequired;
        booking.balanceDue = booking.totalAmount - booking.advancePaid;
        booking.paymentStatus = booking.balanceDue > 0 ? 'partial' : 'paid';
        booking.status = 'confirmed';

        await booking.save();

        const player = await User.findOne({ id: booking.player });
        const turf = await Turf.findOne({ id: booking.turf });
        const owner = await User.findOne({ id: turf.owner });

        if (player?.email) {
          await sendEmail({
            to: player.email,
            subject: 'Payment Successful – Booking Confirmed',
            html: `<p>₹${booking.advancePaid} received!</p><p>Booking confirmed for ${turf.name}.</p><p>Remaining: ₹${booking.balanceDue}</p>`,
          });
        }

        if (owner?.email) {
          await sendEmail({
            to: owner.email,
            subject: 'Advance Received',
            html: `<p>₹${booking.advancePaid} for booking #${booking.id}</p><p>Balance due: ₹${booking.balanceDue}</p>`,
          });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ success: false });
  }
};


export const payBookingBalance = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, method = 'online', notes } = req.body;

    const booking = await Booking.findOne({
      id: bookingId,
      player: req.user.id,
    }).populate('turf');

    if (!booking) {
      return sendError(res, 404, 'Booking not found or access denied');
    }

    if (booking.balanceDue <= 0) {
      return sendError(res, 400, 'No remaining balance due');
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0 || payAmount > booking.balanceDue) {
      return sendError(res, 400, 'Invalid payment amount');
    }

    let razorpayOrder = null;
    let paymentLink = null;
    let transactionId = null;

    if (method === 'online') {
      const razorAmount = Math.round(payAmount * 100);

      razorpayOrder = await razorpayInstance.orders.create({
        amount: razorAmount,
        currency: 'INR',
        receipt: `balance_${booking.id.slice(0, 12)}`,
        notes: {
          bookingId: booking.id,
          type: 'balance_payment',
          playerId: req.user.id,
        },
      });

      transactionId = razorpayOrder.id;
      paymentLink = `https://rzp.io/i/${razorpayOrder.id}`;
    } else {
      transactionId = `manual_${uuidv4().slice(0, 12)}`;
    }

    booking.payments.push({
      amount: payAmount,
      method,
      transactionId,
      status: method === 'online' ? 'pending' : 'success',
      paidAt: new Date(),
      note: notes || '',
      gatewayResponse: razorpayOrder ? { orderId: razorpayOrder.id } : null,
    });

    if (method !== 'online') {
      booking.advancePaid += payAmount;
      booking.balanceDue -= payAmount;

      if (booking.balanceDue <= 0) {
        booking.paymentStatus = 'paid';
      } else {
        booking.paymentStatus = 'partial';
      }

      await booking.save();

      const player = req.user;
      const owner = await User.findOne({ id: booking.turf.owner });

      if (player?.email) {
        await sendEmail({
          to: player.email,
          subject: `Balance Payment Received - ${booking.id}`,
          html: `
            <p>You paid ₹${payAmount} (${method}) for booking <strong>${booking.id}</strong></p>
            <p>Remaining balance: ₹${booking.balanceDue}</p>
          `,
        });
      }

      if (owner?.email) {
        await sendEmail({
          to: owner.email,
          subject: `Balance Paid (${method}) - ${booking.id}`,
          html: `
            <p>Player paid ₹${payAmount} (${method}) for booking <strong>${booking.id}</strong></p>
            <p>Remaining: ₹${booking.balanceDue}</p>
          `,
        });
      }
    }

    return sendSuccess(res, {
      bookingId: booking.id,
      amountPaid: payAmount,
      method,
      balanceDue: booking.balanceDue,
      paymentStatus: booking.paymentStatus,
      razorpayOrderId: razorpayOrder?.id || null,
      paymentLink,
      transactionId,
    }, method === 'online' ? 'Payment initiated – complete on Razorpay' : 'Payment recorded successfully');

  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Failed to process balance payment');
  }
};


export const markOfflinePaymentReceived = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, method = 'cash', notes, receivedBy } = req.body;

    const booking = await Booking.findOne({ id: bookingId })
      .populate({
        path: 'turf',
        foreignField: 'id',           
        select: 'name owner staff',  
      });

    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    const isAuthorized =
      booking.turf.owner === req.user.id ||
      booking.turf.staff.includes(req.user.id) ||
      ['admin', 'superadmin'].includes(req.user.role);

    if (!isAuthorized) {
      return sendError(res, 403, 'Only turf owner, staff, admin or superadmin can mark offline payment');
    }

    const receiveAmount = Number(amount);
    if (isNaN(receiveAmount) || receiveAmount <= 0 || receiveAmount > booking.balanceDue) {
      return sendError(res, 400, 'Invalid amount');
    }

    booking.payments.push({
      amount: receiveAmount,
      method,
      transactionId: `owner_${uuidv4().slice(0, 12)}`,
      status: 'success',
      paidAt: new Date(),
      note: notes || '',
      receivedBy: receivedBy || req.user.id,
    });

    booking.advancePaid += receiveAmount;
    booking.balanceDue -= receiveAmount;

    if (booking.balanceDue <= 0) {
      booking.paymentStatus = 'paid';
    } else {
      booking.paymentStatus = 'partial';
    }

    await booking.save();

    const player = await User.findOne({ id: booking.player });
    if (player?.email) {
      await sendEmail({
        to: player.email,
        subject: `Payment Received (${method}) - ${booking.id}`,
        html: `
          <p>Turf marked ₹${receiveAmount} as received (${method})</p>
          <p>Booking ID: ${booking.id}</p>
          <p>Remaining balance: ₹${booking.balanceDue}</p>
        `,
      });
    }

    return sendSuccess(res, {
      bookingId: booking.id,
      amountReceived: receiveAmount,
      balanceDue: booking.balanceDue,
      paymentStatus: booking.paymentStatus,
      method,
    }, 'Offline payment recorded');

  } catch (err) {
    console.error('markOfflinePaymentReceived error:', err);
    return sendError(res, 500, 'Failed to record offline payment');
  }
};


export const getMyBookings = async (req, res) => {
  try {
    const playerId = req.user.id;
    const { status, startDate, endDate, limit = 20, page = 1 } = req.query;

    const query = { player: playerId };

    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'turf',
        foreignField: 'id',           // ← FIXED here
        justOne: true,
        select:
          'name slug location.address location.landmark location.area location.city location.state location.pincode location.latitude location.longitude contact.primaryMobile contact.secondaryMobile contact.contactPersonName images coverImage id',
      })
      .populate({
        path: 'slots',
        select: 'startTime endTime price',
      })
      .lean();

    const total = await Booking.countDocuments(query);

    const formattedBookings = bookings.map(booking => {
      // Format slots
      const slotTimes = booking.slots?.map(s => ({
        start: s.startTime,
        end: s.endTime,
        price: s.price,
      })) || [];

      let combinedTime = '';
      let totalHours = 0;

      if (slotTimes.length > 0) {
        const startTimes = slotTimes.map(s => s.start).sort();
        const endTimes = slotTimes.map(s => s.end).sort();
        combinedTime = `${startTimes[0]} – ${endTimes[endTimes.length - 1]}`;

        totalHours = slotTimes.reduce((sum, s) => {
          const [sh, sm] = s.start.split(':').map(Number);
          const [eh, em] = s.end.split(':').map(Number);
          return sum + (eh + em / 60 - sh - sm / 60);
        }, 0);
      }

      // Payment details enhancement
      const paymentDetails = {
        totalAmount: booking.totalAmount || 0,
        advancePaid: booking.advancePaid || 0,
        balanceDue: booking.balanceDue || 0,
        advanceRequired: booking.advanceRequired || 0,
        paymentStatus: booking.paymentStatus || 'pending',
        paymentMethod: booking.paymentMethod || 'online',
        advancePaymentMethod: booking.advancePaymentMethod || 'none',
        payments: (booking.payments || []).map(p => ({
          amount: p.amount,
          method: p.method,
          transactionId: p.transactionId || null,
          paidAt: p.paidAt ? p.paidAt.toISOString() : null,
          status: p.status,
          note: p.note || '',
        })),
        totalPaid: (booking.payments || []).reduce((sum, p) => {
          return p.status === 'success' ? sum + p.amount : sum;
        }, 0),
        lastPaymentDate: booking.payments?.length > 0
          ? booking.payments
              .filter(p => p.status === 'success')
              .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))[0]?.paidAt?.toISOString() || null
          : null,
      };

      return {
        id: booking.id,
        turf: {
          id: booking.turf?.id,
          name: booking.turf?.name || 'Unknown Turf',
          location: {
            address: booking.turf?.location?.address || '',
            landmark: booking.turf?.location?.landmark || '',
            area: booking.turf?.location?.area || '',
            city: booking.turf?.location?.city || '',
            state: booking.turf?.location?.state || '',
            pincode: booking.turf?.location?.pincode || '',
            latitude: booking.turf?.location?.latitude || null,
            longitude: booking.turf?.location?.longitude || null,
          },
          contact: {
            primaryMobile: booking.turf?.contact?.primaryMobile || '',
            secondaryMobile: booking.turf?.contact?.secondaryMobile || '',
            contactPersonName: booking.turf?.contact?.contactPersonName || '',
          },
          image: booking.turf?.coverImage || booking.turf?.images?.[0] || null,
        },
        date: booking.date?.toISOString().split('T')[0] || '',
        slots: slotTimes.map(s => ({
          time: `${s.start} – ${s.end}`,
          price: s.price,
        })),
        totalTime: combinedTime,
        totalHours: parseFloat(totalHours.toFixed(2)),
        sport: booking.sport,
        ...paymentDetails,
        status: booking.status,
        createdAt: booking.createdAt?.toISOString(),
        canCancel:
          ['pending', 'confirmed'].includes(booking.status) &&
          new Date(booking.date) > new Date(),
      };
    });

    return sendSuccess(res, {
      bookings: formattedBookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('getMyBookings error:', err);
    return sendError(res, 500, 'Failed to fetch bookings');
  }
};

// ────────────────────────────────────────────────────────────────
// cancelBooking
// ────────────────────────────────────────────────────────────────
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      id: bookingId,
      player: req.user.id,
    });

    if (!booking) {
      return sendError(res, 404, 'Booking not found or you do not have access');
    }

    const allowedStatuses = ['pending', 'confirmed'];
    if (!allowedStatuses.includes(booking.status)) {
      return sendError(res, 400, `Cannot cancel a booking in ${booking.status} status`);
    }

    if (new Date(booking.date) <= new Date()) {
      return sendError(res, 400, "Cannot cancel past or today's bookings");
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.id;
    booking.cancellationReason = req.body.reason || 'Cancelled by player';

    await booking.save();

    await Slot.updateMany(
      { booking: booking._id },
      {
        $set: {
          status: 'available',
          bookedBy: null,
          booking: null,
          heldBy: null,
          heldUntil: null,
        },
      }
    );

    if (req.user.email) {
      await sendEmail({
        to: req.user.email,
        subject: `Booking Cancelled - ${booking.id}`,
        html: `
          <p>Your booking for ${booking.date.toLocaleDateString('en-IN')} has been cancelled.</p>
          <p>Booking ID: ${booking.id}</p>
          <p>Reason: ${booking.cancellationReason}</p>
        `,
      });
    }

    return sendSuccess(res, {
      bookingId: booking.id,
      status: booking.status,
      cancelledAt: booking.cancelledAt,
    }, 'Booking cancelled successfully');

  } catch (err) {
    console.error('cancelBooking error:', err);
    return sendError(res, 500, 'Failed to cancel booking');
  }
};

// ────────────────────────────────────────────────────────────────
// getUpcomingBookings
// ────────────────────────────────────────────────────────────────
export const getUpcomingBookings = async (req, res) => {
  try {
    const playerId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      player: playerId,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] },
    })
      .sort({ date: 1, createdAt: -1 })
      .populate({
        path: 'turf',
        foreignField: 'id',           // ← FIXED here
        select: 'name slug location.city coverImage images id',
      })
      .populate({
        path: 'slots',
        select: 'startTime endTime price',
      })
      .lean();

    const formatted = bookings.map(booking => ({
      id: booking.id,
      turf: {
        id: booking.turf?.id,
        name: booking.turf?.name || 'Unknown',
        city: booking.turf?.location?.city || '',
        image: booking.turf?.coverImage || booking.turf?.images?.[0] || null,
      },
      date: booking.date.toISOString().split('T')[0],
      slots: booking.slots.map(s => ({
        time: `${s.startTime} – ${s.endTime}`,
      })),
      sport: booking.sport,
      totalAmount: booking.totalAmount,
      advancePaid: booking.advancePaid,
      balanceDue: booking.balanceDue,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      canPayBalance: booking.balanceDue > 0 && ['pending', 'partial'].includes(booking.paymentStatus),
    }));

    return sendSuccess(res, {
      bookings: formatted,
      count: formatted.length,
    }, 'Upcoming bookings fetched');

  } catch (err) {
    console.error('getUpcomingBookings error:', err);
    return sendError(res, 500, 'Failed to fetch upcoming bookings');
  }
};