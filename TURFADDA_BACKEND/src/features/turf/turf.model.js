

import mongoose from 'mongoose';
import MongooseDelete from 'mongoose-delete';
import { v4 as uuidv4 } from 'uuid';

const turfSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Turf name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100],
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: '',
    },

    owner: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },

    staff: [
      {
        type: String,
        ref: 'User',
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, ref: 'User', default: null },
    verificationNotes: { type: String, trim: true, default: '' },

    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      landmark: { type: String, trim: true },
      area: { type: String, trim: true },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    openingTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      required: true,
    },

    closingTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      required: true,
    },

    slotDurationMinutes: {
      type: Number,
      enum: [30, 60, 90, 120],
      default: 60,
    },

    sports: [
      {
        type: String,
        enum: [
          'football',
          'cricket',
          'futsal',
          'badminton',
          'basketball',
          'volleyball',
          'tennis',
          'kabaddi',
        ],
        required: true,
      },
    ],

    surfaceType: {
      type: String,
      enum: ['natural_grass', 'artificial_turf', 'cement', 'hybrid', 'mat'],
      default: 'artificial_turf',
    },

    size: {
      type: String,
      enum: [
        '5-a-side',
        '7-a-side',
        '9-a-side',
        '11-a-side',
        'full-court',
        'other',
      ],
      default: '5-a-side',
    },

    amenities: [
      {
        type: String,
        enum: [
          'parking',
          'changing_room',
          'shower',
          'restroom',
          'lighting',
          'drinking_water',
          'seating',
          'first_aid',
          'cafeteria',
          'wifi',
          'power_backup',
          'scoreboard'
        ],
      },
    ],

    pricePerSlot: {
      type: Number,
      required: true,
      min: 100,
    },

    platformCommissionRate: {
      type: Number,
      default: 0.15,
      min: 0,
      max: 0.4,
    },

    images: [String],
    videos: [String],
    coverImage: String,

    // ──────────────────────────────────────────────
    // NEW FIELDS ADDED
    // ──────────────────────────────────────────────
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },

    lastReviewedAt: {
      type: Date,
      default: null,
    },


    preBookingAmountType: {
  type: String,
  enum: ['fixed', 'percentage'],
  default: 'percentage',
},
preBookingAmountValue: {
  type: Number,
  default: 20,         
  min: 0,
},
minAdvancePercentage: {
  type: Number,
  default: 20,
  min: 10,
  max: 100,
},
allowCashForBalance: { type: Boolean, default: true },
allowOfflineBookingByOwner: { type: Boolean, default: true },


contact: {
  primaryMobile: {
    type: String,
    required: [true, 'Primary contact number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
  },
  secondaryMobile: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    default: '',
  },
  contactPersonName: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true,
    minlength: [2, 'Name too short'],
    maxlength: [80],
  },
},

bankDetails: {
  accountNumber: {
    type: String,
    required: [true, 'Bank account number is required'],
    trim: true,
    minlength: [9, 'Account number too short'],
    maxlength: [18],
  },
  ifscCode: {
    type: String,
    required: [true, 'IFSC code is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'],
  },
  passbookImage: {
    type: String,           
    required: [true, 'Passbook or cancelled cheque image is required for verification'],
  },
},

    // ──────────────────────────────────────────────

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

turfSchema.plugin(MongooseDelete, {
  deletedAt: true,                
  deletedBy: true,                
  overrideMethods: 'all',        
  indexFields: ['deletedAt', 'deletedBy'], 
});

turfSchema.index({ isVerified: 1, isActive: 1 });
turfSchema.index({ 'location.city': 1, 'location.area': 1 });
turfSchema.index({ averageRating: -1 });     // for sorting by best rated
turfSchema.index({ reviewCount: -1 });       // for sorting by most reviewed

turfSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

export default mongoose.model('Turf', turfSchema);