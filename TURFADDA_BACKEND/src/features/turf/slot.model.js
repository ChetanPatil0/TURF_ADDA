import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const slotSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },
  turf: {
    type: String,
    ref: 'Turf',
    required: true,
    index: true,
  },
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
    enum: [30, 60, 90, 120],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked', 'completed', 'cancelled'],
    default: 'available',
    index: true,
  },
  bookedBy: {
    type: String,
    ref: 'User',
    sparse: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    sparse: true,
  },
  blockedReason: {
    type: String,
    trim: true,
    default: '',
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

slotSchema.index({ turf: 1, date: 1, startTime: 1 }, { unique: true });
slotSchema.index({ turf: 1, status: 1, date: 1 });

export default mongoose.model('Slot', slotSchema);