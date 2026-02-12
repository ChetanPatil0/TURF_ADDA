
import mongoose from 'mongoose';

const pendingRegistrationSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  password: { type: String, required: true }, 
  role: { 
    type: String, 
    enum: ['player', 'owner', 'staff'], 
    required: true 
  },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: '60m'  
  }
}, { timestamps: true });

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);

export default PendingRegistration;