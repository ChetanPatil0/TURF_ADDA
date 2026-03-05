import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
      index: true,
    },

    player: {
      type: String,
      ref: 'User',
      required: false,
      index: true,
    },

    playerName: {
      type: String,
      trim: true,
      required: false,
    },

    playerMobile: {
      type: String,
      trim: true,
      required: false,
    },

    turf: {
      type: String,
      ref: 'Turf',
      required: true,
      index: true,
    },

    slots: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    }],

    date: {
      type: Date,
      required: true,
      index: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 30,
    },

    sport: {
      type: String,
      enum: ['football', 'cricket', 'futsal', 'badminton', 'basketball', 'volleyball', 'tennis', 'kabaddi'],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    ownerPayout: {
      type: Number,
      default: 0,
      min: 0,
    },

    advanceRequired: {
      type: Number,
      required: true,
      min: 0,
    },

    advancePaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    advancePaymentMethod: {
      type: String,
      enum: ['online', 'cash', 'none'],
      default: 'none',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'failed', 'refunded', 'partial_refund'],
      default: 'pending',
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ['online', 'cash', 'upi', 'card', 'wallet'],
      default: 'online',
    },

    payments: [{
      amount: { type: Number, required: true },
      method: { type: String, enum: ['online', 'cash', 'upi', 'card', 'wallet'] },
      transactionId: String,
      paidAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'success', 'failed'] },
      gatewayResponse: mongoose.Schema.Types.Mixed,
      note: { type: String, trim: true, default: '' },
    }],

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show', 'disputed'],
      default: 'pending',
      index: true,
    },

    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: String, ref: 'User', default: null },
    cancellationReason: { type: String, trim: true, default: '' },

    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'not_applicable'],
      default: 'not_applicable',
    },

    refundAmount: { type: Number, default: 0 },
    refundTransactionId: String,

    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },

    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },

    bookingSource: {
      type: String,
      enum: ['app', 'website', 'whatsapp', 'call', 'walkin', 'owner'],
      default: 'app',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ player: 1, status: 1, createdAt: -1 });
bookingSchema.index({ turf: 1, date: 1, status: 1 });
bookingSchema.index({ turf: 1, paymentStatus: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });
bookingSchema.index({ status: 1, date: 1 });

export default mongoose.model('Booking', bookingSchema);