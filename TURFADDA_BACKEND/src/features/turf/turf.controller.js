import Turf from '../../features/turf/turf.model.js';
import User from '../../features/auth/auth.model.js';
import Slot from '../../features/turf/slot.model.js';
import Booking from '../../features/turf/booking.model.js';
import { sendError, sendSuccess } from '../../utils/errorHandler.js';
import { haversineDistance, reverseGeocodeNominatim } from '../../utils/index.js';
import mongoose from "mongoose";

export const createTurf = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (!['owner', 'admin', 'superadmin'].includes(role)) {
      return sendError(res, 403, 'Only owners or administrators can create a turf.');
    }

    const {
      name,
      description,
      openingTime,
      closingTime,
      slotDurationMinutes,
      pricePerSlot,
      sports,
      surfaceType,
      size,
      amenities,
      platformCommissionRate,
      address,
      landmark,
      area,
      city,
      state,
      pincode,
      latitude,
      longitude,

      // ── NEW FIELDS ──
      primaryMobile,
      secondaryMobile,
      contactPersonName,
      accountNumber,
      ifscCode,
    } = req.body;

    let parsedSports = typeof sports === 'string' ? JSON.parse(sports) : sports || [];
    let parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities || [];

    const errors = [];

    // Existing validations ...
    if (!name?.trim()) errors.push('Turf name is required.');
    if (!openingTime) errors.push('Opening time is required.');
    if (!closingTime) errors.push('Closing time is required.');
    if (!pricePerSlot || Number(pricePerSlot) < 100) errors.push('Price per slot ≥ ₹100 required.');
    if (!parsedSports?.length) errors.push('Select at least one sport.');
    if (!address?.trim()) errors.push('Address is required.');
    if (!city?.trim()) errors.push('City is required.');

    // New validations
    if (!primaryMobile?.trim()) errors.push('Primary mobile number is required.');
    if (!/^[6-9]\d{9}$/.test(primaryMobile)) errors.push('Invalid primary mobile number.');
    if (secondaryMobile && !/^[6-9]\d{9}$/.test(secondaryMobile)) errors.push('Invalid secondary mobile number.');
    if (!contactPersonName?.trim()) errors.push('Contact person name is required.');
    if (!accountNumber?.trim()) errors.push('Bank account number is required.');
    if (!ifscCode?.trim()) errors.push('IFSC code is required.');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode?.toUpperCase())) errors.push('Invalid IFSC format.');

    if (errors.length > 0) {
      return sendError(res, 400, errors.join(' '));
    }

    const turfData = {
      name: name.trim(),
      owner: userId,
      description: description || '',
      openingTime,
      closingTime,
      slotDurationMinutes: Number(slotDurationMinutes) || 60,
      pricePerSlot: Number(pricePerSlot),
      sports: parsedSports,
      surfaceType: surfaceType || 'artificial_turf',
      size: size || '5-a-side',
      amenities: parsedAmenities,
      location: {
        address: address.trim(),
        landmark: landmark || '',
        area: area || '',
        city: city.trim(),
        state: state || '',
        pincode: pincode || '',
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      },
      platformCommissionRate: platformCommissionRate ? Number(platformCommissionRate) : 0.15,

      // ── NEW ──
      contact: {
        primaryMobile,
        secondaryMobile: secondaryMobile || '',
        contactPersonName: contactPersonName.trim(),
      },
      bankDetails: {
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        passbookImage: req.files?.passbookImage?.[0]?.path || undefined,
      },

      status: 'pending',
      isActive: false,
    };

    if (req.files?.images?.length) {
      turfData.images = req.files.images.map(file => file.path);
    }
    if (req.files?.videos?.length) {
      turfData.videos = req.files.videos.map(file => file.path);
    }
    if (req.files?.coverImage?.[0]) {
      turfData.coverImage = req.files.coverImage[0].path;
    }

    // Important: passbook is required
    if (!turfData.bankDetails.passbookImage) {
      return sendError(res, 400, 'Passbook or cancelled cheque image is required.');
    }

    const turf = new Turf(turfData);
    await turf.save();

    return sendSuccess(
      res,
      {
        id: turf.id,
        name: turf.name,
        slug: turf.slug,
        status: turf.status,
        message: 'Turf submitted for review. Await admin verification.',
      },
      'Turf created successfully',
      201
    );

  } catch (error) {
    console.error('Create turf error:', error);
    return sendError(res, 500, 'Failed to create turf. Try again later.');
  }
};


export const getMyTurfs = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('user id  : ',userId)

    const turfs = await Turf.find({
      $or: [
        { owner: userId },
        { staff: userId }
      ]
    })
      .select(`
        id 
        name 
        slug 
        owner
        staff
        isVerified 
        isActive 
        status 
        pricePerSlot 
        sports 
        location.city 
        location.area 
        images 
        coverImage 
        videos 
        createdAt
      `)
      .sort({ createdAt: -1 })
      .lean(); // better performance

    const formattedTurfs = turfs.map(turf => ({
      ...turf,
      role: turf.owner === userId ? 'owner' : 'staff'
    }));

    return sendSuccess(res, { turfs: formattedTurfs });

  } catch (error) {
    console.error('Get my turfs error:', error);
    return sendError(res, 500, 'Server error');
  }
};


export const getDiscoverTurfs = async (req, res) => {
  try {
    let userId = null;
    let userCity = null;
    let userState = null;
    let searchLat = null;
    let searchLng = null;

    if (!req.user || !req.user.id) {
      const popular = await Turf.find({
        isActive: true,
        status: 'active'
      })
        .select(`
          id name slug sports pricePerSlot 
          location.city location.area location.state 
          coverImage averageRating reviewCount isVerified
        `)
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(12)
        .lean();

      return sendSuccess(res, {
        sections: [
          {
            title: 'Most Popular Across India',
            turfs: popular
          }
        ],
        message: 'Sign in to see turfs near you and personalized recommendations.',
        type: 'general'
      });
    }

    userId = req.user.id;

    let user = await User.findOne({ id: userId })
      .select('city state')
      .lean();

    if (user) {
      userCity = user.city;
      userState = user.state;
    }

    const { lat, lng, search, all } = req.query;

    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        searchLat = parsedLat;
        searchLng = parsedLng;
      }
    }

    if (searchLat && searchLng && (!userCity || !userState)) {
      const geo = await reverseGeocodeNominatim(searchLat, searchLng);
      if (geo.city || geo.state) {
        userCity = userCity || geo.city;
        userState = userState || geo.state;
      }
    }

    const baseFilter = {
      isActive: true,
      status: 'active'
    };

    const selectFields = `
      id name slug sports pricePerSlot 
      location.city location.area location.state 
      coverImage averageRating reviewCount isVerified
    `;

    const escapeRegExp = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (all === 'true' || all === '1') {
      const turfs = await Turf.find(baseFilter)
        .select(selectFields)
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(120)
        .lean();

      return sendSuccess(res, {
        turfs,
        total: turfs.length,
        type: 'all',
        message: turfs.length === 0 ? 'No active turfs available.' : null
      });
    }

    if (search) {
      const regex = new RegExp(escapeRegExp(search.trim()), 'i');

      const searchFilter = {
        ...baseFilter,
        $or: [
          { name: regex },
          { slug: regex },
          { 'location.city': regex },
          { 'location.area': regex },
          { 'location.state': regex },
          { sports: regex }
        ]
      };

      const turfs = await Turf.find(searchFilter)
        .select(selectFields)
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(60)
        .lean();

      return sendSuccess(res, {
        turfs,
        total: turfs.length,
        type: 'search',
        message: turfs.length === 0
          ? 'No turfs found. Try a different location or sport.'
          : null
      });
    }

    const sections = [];
    let message = null;
    const seenTurfIds = new Set();

    const bookedTurfIds = await Booking.distinct('turf', { player: userId });

    if (bookedTurfIds.length > 0) {
      const prevBooked = await Turf.find({
        ...baseFilter,
        id: { $in: bookedTurfIds }
      })
        .select(selectFields)
        .sort({ averageRating: -1 })
        .limit(8)
        .lean();

      if (prevBooked.length > 0) {
        prevBooked.forEach(t => seenTurfIds.add(t.id));
        sections.push({
          title: 'Your Previous Turfs',
          turfs: prevBooked
        });
      }
    }

    if (searchLat && searchLng) {
      const MAX_DISTANCE_KM = 30;

      const turfsWithCoords = await Turf.find({
        ...baseFilter,
        'location.latitude': { $exists: true, $ne: null },
        'location.longitude': { $exists: true, $ne: null },
        id: { $nin: [...seenTurfIds] }
      })
        .select(selectFields + ' location.latitude location.longitude')
        .lean();

      const nearby = turfsWithCoords
        .map(t => {
          const dist = haversineDistance(
            searchLat,
            searchLng,
            t.location.latitude,
            t.location.longitude
          );
          return { ...t, distanceKm: dist ? Math.round(dist * 10) / 10 : null };
        })
        .filter(t => t.distanceKm !== null && t.distanceKm <= MAX_DISTANCE_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 12);

      if (nearby.length > 0) {
        sections.push({
          title: 'Nearby Turfs',
          turfs: nearby
        });
        nearby.forEach(t => seenTurfIds.add(t.id));
      }
    }
    else if (userCity) {
      const cityRegex = new RegExp(`^${escapeRegExp(userCity)}$`, 'i');
      const cityFilter = {
        ...baseFilter,
        'location.city': cityRegex,
        id: { $nin: [...seenTurfIds] }
      };

      if (userState) {
        cityFilter['location.state'] = new RegExp(`^${escapeRegExp(userState)}$`, 'i');
      }

      const cityPopular = await Turf.find(cityFilter)
        .select(selectFields)
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(12)
        .lean();

      if (cityPopular.length > 0) {
        sections.push({
          title: `Popular in ${userCity}`,
          turfs: cityPopular
        });
        cityPopular.forEach(t => seenTurfIds.add(t.id));
      } else {
        message = `No turfs found in your area right now. Here are some popular ones across India.`;
      }
    }

    const nationwide = await Turf.find({
      ...baseFilter,
      id: { $nin: [...seenTurfIds] }
    })
      .select(selectFields)
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(12)
      .lean();

    if (nationwide.length > 0) {
      sections.push({
        title: 'Most Popular Across India',
        turfs: nationwide
      });
    }

    if (!searchLat && !searchLng && !userCity && !userState) {
      message = 'Please add your city and state for more personalized recommendations.';
    }

    return sendSuccess(res, {
      sections,
      message,
      type: 'personalized'
    });
  } catch (error) {
    console.error('Get discover turfs error:', error);
    return sendError(res, 500, 'Server error');
  }
};




export const getTurf = async (req, res) => {
  try {
    const { identifier } = req.params;

    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { $or: [{ _id: identifier }, { id: identifier }, { slug: identifier }] }
      : { $or: [{ id: identifier }, { slug: identifier }] };

    const turf = await Turf.findOne(query).lean();

    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    let ownerData = null;

    if (turf.owner) {
      const owner = await User.findOne({ id: turf.owner })
        .select('id firstName lastName mobile email isVerifiedMobile isVerifiedEmail profileImage gender city state country status createdAt')
        .lean();

      if (owner) {
        ownerData = {
          id: owner.id,
          firstName: owner.firstName || '',
          lastName: owner.lastName || '',
          fullName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || null,
          profileImage: owner.profileImage ?? null,
          email: owner.email ?? null,
          mobile: owner.mobile ?? null,
          isVerifiedMobile: owner.isVerifiedMobile ?? null,
          isVerifiedEmail: owner.isVerifiedEmail ?? null,
          gender: owner.gender ?? null,
          city: owner.city ?? null,
          state: owner.state ?? null,
          country: owner.country ?? null,
          status: owner.status ?? null,
          createdAt: owner.createdAt ?? null
        };
      }
    }

    const formattedTurf = {
      ...turf,
      owner: ownerData
    };

    const currentUser = req.user;
    const role = currentUser?.role || 'player';

    const isOwner = role === 'owner' && currentUser?.id === turf.owner;
    const isStaff = role === 'staff' && turf.staff?.includes(currentUser?.id);
    const isAdmin = role === 'admin' || role === 'superadmin';

    if (role === 'player') {
      formattedTurf.owner = null;
    } else if (isStaff) {
      if (formattedTurf.owner) {
        delete formattedTurf.owner.mobile;
        delete formattedTurf.owner.email;
      }
    }

    if (isOwner || isStaff || isAdmin) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayBookings = await Booking.countDocuments({
        turf: turf.id,
        date: { $gte: today, $lt: tomorrow }
      });

      const upcomingBookings = await Booking.countDocuments({
        turf: turf.id,
        date: { $gt: today },
        status: { $in: ['pending', 'confirmed'] }
      });

      const totalBookings = await Booking.countDocuments({ turf: turf.id });

      const totalRevenueResult = await Booking.aggregate([
        { $match: { turf: turf.id, status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      formattedTurf.stats = {
        todayBookings,
        upcomingBookings,
        totalBookings,
        totalRevenue: totalRevenueResult[0]?.total || 0,
        averageRating: turf.averageRating || 0,
        reviewCount: turf.reviewCount || 0,
      };

      let verifiedByData = null;
      if (turf.verifiedBy) {
        const verifier = await User.findOne({ id: turf.verifiedBy })
          .select('firstName lastName')
          .lean();

        if (verifier) {
          verifiedByData = {
            fullName: `${verifier.firstName || ''} ${verifier.lastName || ''}`.trim() || 'Admin'
          };
        }
      }

      formattedTurf.verification = {
        isVerified: turf.isVerified || false,
        verifiedAt: turf.verifiedAt || null,
        verifiedBy: verifiedByData,
        verificationNotes: turf.verificationNotes || ''
      };
    }

    return sendSuccess(res, { turf: formattedTurf });

  } catch (error) {
    console.error('Get turf error:', error);
    return sendError(res, 500, 'Server error');
  }
};




export const getAllPendingVerificationTurfs = async (req, res) => {
  try {
    const pendingTurfs = await Turf.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();

    if (!pendingTurfs.length) {
      return sendSuccess(res, { pendingTurfs: [] });
    }

    const ownerIds = [
      ...new Set(pendingTurfs.map(t => t.owner).filter(Boolean))
    ];

    const owners = await User.find({ id: { $in: ownerIds } })
      .select(
        'id firstName lastName mobile email profileImage gender city state country status createdAt'
      )
      .lean();

    const ownerMap = owners.reduce((map, owner) => {
      map[owner.id] = {
        id: owner.id,
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        fullName:
          `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || null,
        mobile: owner.mobile ?? null,
        email: owner.email ?? null,
        profileImage: owner.profileImage ?? null,
        gender: owner.gender ?? null,
        city: owner.city ?? null,
        state: owner.state ?? null,
        country: owner.country ?? null,
        status: owner.status ?? null,
        createdAt: owner.createdAt ?? null
      };
      return map;
    }, {});

    const formattedTurfs = pendingTurfs.map(turf => ({
      ...turf,
      owner: ownerMap[turf.owner] || null,
    }));

    return sendSuccess(res, { pendingTurfs: formattedTurfs });
  } catch (error) {
    console.error('Get all pending verification turfs error:', error);
    return sendError(res, 500, 'Server error');
  }
};


export const updateTurf = async (req, res) => {
  try {
    const { turfId } = req.params;
    const userId = req.user.id;

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) return sendError(res, 404, 'Turf not found');

    if (turf.owner !== userId && !['admin', 'superadmin'].includes(req.user.role)) {
      return sendError(res, 403, 'No permission');
    }

    const updates = {};

    // Handle normal fields
    ['name', 'description', 'openingTime', 'closingTime', 'slotDurationMinutes',
     'pricePerSlot', 'surfaceType', 'size', 'platformCommissionRate',
     'preBookingAmountType', 'preBookingAmountValue', 'minAdvancePercentage',
     'allowCashForBalance', 'allowOfflineBookingByOwner'].forEach(key => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    // Handle location object
    if (req.body.location) {
      updates.location = typeof req.body.location === 'string' 
        ? JSON.parse(req.body.location) 
        : req.body.location;
    }

    // Handle contact object
    if (req.body.contact) {
      updates.contact = typeof req.body.contact === 'string' 
        ? JSON.parse(req.body.contact) 
        : req.body.contact;
    }

    // Handle bankDetails object
    if (req.body.bankDetails) {
      updates.bankDetails = typeof req.body.bankDetails === 'string' 
        ? JSON.parse(req.body.bankDetails) 
        : req.body.bankDetails;
    }

    // Handle arrays correctly (most important fix)
    if (req.body.sports) {
      updates.sports = Array.isArray(req.body.sports) 
        ? req.body.sports 
        : typeof req.body.sports === 'string' 
          ? JSON.parse(req.body.sports) 
          : req.body.sports.split(',');
    }

    if (req.body.amenities) {
      updates.amenities = Array.isArray(req.body.amenities) 
        ? req.body.amenities 
        : typeof req.body.amenities === 'string' 
          ? JSON.parse(req.body.amenities) 
          : req.body.amenities.split(',');
    }

    // Files
    if (req.files?.images?.length) {
      updates.images = req.files.images.map(f => f.path);
    }
    if (req.files?.videos?.length) {
      updates.videos = req.files.videos.map(f => f.path);
    }
    if (req.files?.coverImage?.[0]) {
      updates.coverImage = req.files.coverImage[0].path;
    }
    if (req.files?.passbookImage?.[0]) {
      updates.bankDetails = {
        ...(turf.bankDetails || {}),
        passbookImage: req.files.passbookImage[0].path
      };
    }

    // Force pending status on update
    updates.status = 'pending';
    updates.isVerified = false;
    updates.verifiedAt = null;
    updates.verifiedBy = null;

    Object.assign(turf, updates);
    await turf.save();

    return sendSuccess(res, {
      id: turf.id,
      name: turf.name,
      slug: turf.slug,
      status: turf.status,
      isVerified: turf.isVerified,
      message: 'Turf updated successfully. Now pending re-verification.'
    }, 200);

  } catch (error) {
    console.error('Update turf error:', error);
    return sendError(res, 500, error.message || 'Failed to update turf');
  }
};





export const deleteTurf = async (req, res) => {
  const turfIdentifier = req.params.id;
  const userRole = req.user.role;
  const currentUserId = req.user.id;

  try {
    const query = mongoose.Types.ObjectId.isValid(turfIdentifier)
      ? { $or: [{ _id: turfIdentifier }, { id: turfIdentifier }] }
      : { id: turfIdentifier };

    const turf = await Turf.findOne(query);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found",
      });
    }

    const isOwner = turf.owner.toString() === currentUserId.toString();
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this turf",
      });
    }

    await turf.delete();

    return res.status(200).json({
      success: true,
      message: "Turf deleted successfully",
    });
  } catch (error) {
    console.error("Soft delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting turf",
    });
  }
};


export const hardDeleteTurf = async (req, res) => {
  const turfId = req.params.id;
  const userRole = req.user.role;

  if (userRole !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Permanent deletion is restricted to superadmin only',
    });
  }

  try {
  
    const deletedTurf = await Turf.findByIdAndDelete(turfId, { override: true });

    if (!deletedTurf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Turf permanently deleted from database',
      deletedTurfId: turfId,
    });
  } catch (error) {
    console.error('Hard delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during permanent deletion',
      error: error.message,
    });
  }
};

export const verifyTurf = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { isVerified, verificationNotes = '' } = req.body;
    console.log('isverified',req.body)

    if (typeof isVerified !== 'boolean') {
      return sendError(res, 400, 'Invalid verification status.');
    }

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) {
      return sendError(res, 404, 'Turf not found.');
    }

    turf.isVerified = isVerified;
    turf.verifiedAt = isVerified ? new Date() : null;
    turf.verifiedBy = isVerified ? req.user.id : null;
    turf.verificationNotes = verificationNotes;

    if (isVerified) {
      turf.status = 'active';
      turf.isActive = true;
    } else {
      turf.status = 'rejected';
      turf.isActive = false;
    }

    await turf.save();

    return sendSuccess(
      res,
      {
        id: turf.id,
        name: turf.name,
        isVerified: turf.isVerified,
        status: turf.status,
        isActive: turf.isActive,
        verifiedAt: turf.verifiedAt
      },
      isVerified
        ? 'Turf approved successfully.'
        : 'Turf rejected successfully.'
    );

  } catch (error) {
    console.error('Verify turf error:', error);
    return sendError(res, 500, 'Something went wrong. Please try again.');
  }
};


export const assignStaff = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return sendError(res, 400, 'staffId is required');
    }

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    const isOwner = turf.owner === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Only the turf owner or admin can assign staff');
    }

    const staffUser = await User.findOne({ id: staffId });
    if (!staffUser) {
      return sendError(res, 404, 'Staff user not found');
    }
    if (staffUser.role !== 'staff') {
      return sendError(res, 400, 'Only users with role "staff" can be assigned');
    }

    if (turf.staff.includes(staffId)) {
      return sendError(res, 400, 'This staff is already assigned to the turf');
    }

    turf.staff.push(staffId);
    await turf.save();

    return sendSuccess(res, {
      turfId: turf.id,
      name: turf.name,
      staffCount: turf.staff.length,
      assignedStaff: staffId
    }, 'Staff assigned successfully');

  } catch (error) {
    console.error('Assign staff error:', error);
    return sendError(res, 500, 'Failed to assign staff');
  }
};

export const removeStaff = async (req, res) => {
  try {
    const { turfId, staffId } = req.params;

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    const isOwner = turf.owner === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Only the turf owner or admin can remove staff');
    }

    if (!turf.staff.includes(staffId)) {
      return sendError(res, 400, 'This staff is not assigned to the turf');
    }

    turf.staff = turf.staff.filter(id => id !== staffId);
    await turf.save();

    return sendSuccess(res, {
      turfId: turf.id,
      name: turf.name,
      staffCount: turf.staff.length
    }, 'Staff removed successfully');

  } catch (error) {
    console.error('Remove staff error:', error);
    return sendError(res, 500, 'Failed to remove staff');
  }
};

export const getTurfStaff = async (req, res) => {
  try {
    const { turfId } = req.params;

    const turf = await Turf.findOne({ id: turfId })
      .populate('staff', 'id firstName lastName mobile role');

    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    const isOwner = turf.owner === req.user.id;
    const isAssignedStaff = turf.staff.includes(req.user.id);
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAssignedStaff && !isAdmin) {
      return sendError(res, 403, 'You do not have permission to view staff list');
    }

    return sendSuccess(res, {
      turfId: turf.id,
      name: turf.name,
      staff: turf.staff
    }, 'Staff list fetched successfully');

  } catch (error) {
    console.error('Get turf staff error:', error);
    return sendError(res, 500, 'Server error');
  }
};
