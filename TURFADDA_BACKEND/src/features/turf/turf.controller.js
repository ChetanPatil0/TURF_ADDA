import Turf from '../../features/turf/turf.model.js';
// import User from '../../features/auth/auth.model.js';

import { sendError, sendSuccess } from '../../utils/errorHandler.js';

export const createTurf = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (!['owner', 'admin', 'superadmin'].includes(role)) {
      return sendError(res, 403, 'Only turf owners or admins can create turfs');
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
      location,
      platformCommissionRate,
    } = req.body;

    if (!name || !openingTime || !closingTime || !pricePerSlot || !sports?.length || !location?.address || !location?.city) {
      return sendError(res, 400, 'Required fields missing (name, times, price, sports, location address & city)');
    }

    const turfData = {
      name,
      owner: userId,
      description: description || '',
      openingTime,
      closingTime,
      slotDurationMinutes: Number(slotDurationMinutes) || 60,
      pricePerSlot: Number(pricePerSlot),
      sports,
      surfaceType: surfaceType || 'artificial_turf',
      size: size || '5-a-side',
      amenities: amenities || [],
      location: {
        address: location.address,
        landmark: location.landmark || '',
        area: location.area || '',
        city: location.city,
        state: location.state || '',
        pincode: location.pincode || '',
        latitude: location.latitude ? Number(location.latitude) : undefined,
        longitude: location.longitude ? Number(location.longitude) : undefined,
      },
      platformCommissionRate: platformCommissionRate ? Number(platformCommissionRate) : 0.15,
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

    return sendSuccess(res, {
      id: turf.id,
      name: turf.name,
      slug: turf.slug,
      isVerified: turf.isVerified,
      owner: turf.owner,
    }, 'Turf created successfully', 201);

  } catch (error) {
    console.error('Create turf error:', error);
    return sendError(res, 500, 'Failed to create turf');
  }
};

export const getMyTurfs = async (req, res) => {
  try {
    const userId = req.user.id;

    const turfs = await Turf.find({ owner: userId })
      .select('id name slug isVerified isActive pricePerSlot sports location.city location.area images coverImage videos createdAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { turfs });
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
    })
      .select('-__v')
      .populate('owner', 'firstName lastName mobile email id');

    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    return sendSuccess(res, { turf });
  } catch (error) {
    console.error('Get turf error:', error);
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

    if (typeof isVerified !== 'boolean') {
      return sendError(res, 400, 'isVerified must be a boolean value');
    }

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) {
      return sendError(res, 404, 'Turf not found');
    }

    turf.isVerified = isVerified;
    turf.verifiedAt = isVerified ? new Date() : null;
    turf.verifiedBy = isVerified ? req.user.id : null;
    turf.verificationNotes = verificationNotes;

    await turf.save();

    return sendSuccess(res, {
      id: turf.id,
      name: turf.name,
      isVerified: turf.isVerified,
      verifiedAt: turf.verifiedAt
    }, `Turf ${isVerified ? 'verified' : 'unverified'} successfully`);

  } catch (error) {
    console.error('Verify turf error:', error);
    return sendError(res, 500, 'Verification failed');
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
