
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },

  // Name fields
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
  },
  middleName: {
    type: String,
    default: '',
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
  },

  // Contact & Verification
  mobile: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  email: {
     type: String,
  unique: true,
  sparse: true,  
  lowercase: true,
  trim: true
  },
  isVerifiedMobile: {
    type: Boolean,
    default: false,
  },
  isVerifiedEmail: {
    type: Boolean,
    default: false,
  },

  mobileOtp: { type: String },
  mobileOtpExpiry: { type: Date },
  emailOtp: { type: String },
  emailOtpExpiry: { type: Date },
  // Authentication
  password: {
    type: String,
  },

  // Roles
  role: {
    type: String,
    enum: ['player', 'owner', 'staff', 'admin', 'superadmin'],
    default: 'player',
  },

  // Profile
  profileImage: {
    type: String,
    default: '',
  },

  // Personal details
  gender: {
    type: String,
    enum: ['male', 'female', 'other', null],
    default: null,
  },

  // Location 
  country: {
    type: String,
      default: 'india',
    trim: true,
  },
  state: {
    type: String,
    default: '',
    trim: true,
  },
  city: {
    type: String,
    default: '',
    trim: true,
  },
  area: {
    type: String,
    default: '',
    trim: true,
  },

  // Preferences
  preferredSports: {
    type: [String],
    default: [],
  },

  // Admin & Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  },
  lastLogin: {
  type: Date,
  default: null,
},


resetPasswordToken: {
  type: String,
  sparse: true,
},
resetPasswordExpires: {
  type: Date,
  sparse: true,
},
resetChannel: {
  type: String,
  enum: ['email', 'mobile', null],
  default: null,
  sparse: true,
},
lastPasswordReset: {
  type: Date,
  default: null,
},

isDeleted: {
    type: Boolean,
    default: false,
    select: false,         
  },

  deletedAt: {
    type: Date,
    default: null,
    select: false,
  },

  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    select: false,
  },

}, {
  timestamps: true,
});

userSchema.index({ role: 1 });
userSchema.index({ country: 1, state: 1, city: 1, area: 1 }); 
userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });



userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
//   next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);