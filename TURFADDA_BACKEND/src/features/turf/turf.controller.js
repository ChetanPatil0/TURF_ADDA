import Turf from '../../features/turf/turf.model.js';
import User from '../../features/auth/auth.model.js';

import { sendError, sendSuccess } from '../../utils/errorHandler.js';
export const createTurf = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (!['owner', 'admin', 'superadmin'].includes(role)) {
      return sendError(
        res,
        403,
        'You do not have permission to create a turf. Only owners or administrators can perform this action.'
      );
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
    } = req.body;

    let parsedSports = sports;
    let parsedAmenities = amenities;

    if (typeof sports === 'string') {
      try {
        parsedSports = JSON.parse(sports);
      } catch {
        parsedSports = [];
      }
    }

    if (typeof amenities === 'string') {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch {
        parsedAmenities = [];
      }
    }

    const errors = [];

    if (!name?.trim()) errors.push('Please enter the turf name.');
    if (!openingTime) errors.push('Please select the opening time.');
    if (!closingTime) errors.push('Please select the closing time.');
    if (!pricePerSlot) errors.push('Please enter the price per slot.');
    if (!parsedSports || !Array.isArray(parsedSports) || parsedSports.length === 0) {
      errors.push('Please select at least one sport.');
    }
    if (!address?.trim()) errors.push('Please enter the turf address.');
    if (!city?.trim()) errors.push('Please enter the city.');

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (openingTime && !timeRegex.test(openingTime)) {
      errors.push('Opening time must be in valid HH:MM format (e.g., 06:00).');
    }
    if (closingTime && !timeRegex.test(closingTime)) {
      errors.push('Closing time must be in valid HH:MM format (e.g., 22:00).');
    }

    if (pricePerSlot && Number(pricePerSlot) < 100) {
      errors.push('Price per slot must be at least ₹100.');
    }

    if (
      platformCommissionRate &&
      (Number(platformCommissionRate) < 0 || Number(platformCommissionRate) > 0.4)
    ) {
      errors.push('Platform commission rate must be between 0% and 40%.');
    }

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
      amenities: parsedAmenities || [],
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

      // NEW: Pending until verified
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

    const turf = new Turf(turfData);
    await turf.save();

    return sendSuccess(
      res,
      {
        id: turf.id,
        name: turf.name,
        slug: turf.slug,
        status: turf.status,
        isActive: turf.isActive,
        message: 'Your turf has been submitted successfully. It is now pending verification by our admin team. You will be notified once approved.',
      },
      'Turf submitted for review',
      201
    );

  } catch (error) {
    console.error('Create turf error:', error);
    return sendError(
      res,
      500,
      'Something went wrong while submitting your turf. Please try again later.'
    );
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


export const getTurf = async (req, res) => {
  try {
    const { identifier } = req.params;

    const turf = await Turf.findOne({
      $or: [{ id: identifier }, { slug: identifier }]
    }).lean();

    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    let ownerData = null;

    if (turf.owner) {
      const owner = await User.findOne({ id: turf.owner })
        .select('id firstName lastName mobile email profileImage gender city state country status createdAt')
        .lean();

      if (owner) {
        ownerData = {
          id: owner.id,
          firstName: owner.firstName || '',
          lastName: owner.lastName || '',
          fullName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || null,
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
      }
    }

    const formattedTurf = {
      ...turf,
      owner: ownerData
    };

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
    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    if (turf.owner !== userId && !['admin', 'superadmin'].includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to update this turf');
    }

    const allowedUpdates = [
      'name', 'description', 'openingTime', 'closingTime', 'slotDurationMinutes',
      'pricePerSlot', 'sports', 'surfaceType', 'size', 'amenities', 'location',
      'platformCommissionRate'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (req.files?.images?.length) {
      updates.images = req.files.images.map(file => file.path);
    }
    if (req.files?.videos?.length) {
      updates.videos = req.files.videos.map(file => file.path);
    }
    if (req.files?.coverImage?.[0]) {
      updates.coverImage = req.files.coverImage[0].path;
    }

    Object.assign(turf, updates);
    await turf.save();

    return sendSuccess(res, {
      id: turf.id,
      name: turf.name,
      slug: turf.slug,
      isVerified: turf.isVerified
    }, 'Turf updated successfully');

  } catch (error) {
    console.error('Update turf error:', error);
    return sendError(res, 500, 'Failed to update turf');
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
