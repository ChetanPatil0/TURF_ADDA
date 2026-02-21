// src/models/Booking.js
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
      required: true,
      index: true,
    },

   
    turf: {
      type: String,
      ref: 'Turf',
      required: true,
      index: true,
    },

  
    slots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true,
      },
    ],

  
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },

   
    sport: {
      type: String,
      enum: [
        'football', 'cricket', 'futsal', 'badminton',
        'basketball', 'volleyball', 'tennis', 'kabaddi',
      ],
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

  
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cash', 'upi', 'card', 'wallet'],
      default: 'online',
    },
    paymentId: {
      type: String,       
      trim: true,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },

  
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
      index: true,
    },

  
    cancelledAt:     { type: Date,   default: null },
    cancelledBy:     { type: String, ref: 'User', default: null },
    cancellationNote:{ type: String, trim: true,  default: '' },
    refundAmount:    { type: Number, default: 0 },

    playerNote: { type: String, trim: true, default: '' },
    ownerNote:  { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,   
  }
);


bookingSchema.index({ turf: 1, date: 1 });
bookingSchema.index({ turf: 1, status: 1, date: 1 });
bookingSchema.index({ player: 1, status: 1 });
bookingSchema.index({ turf: 1, paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);