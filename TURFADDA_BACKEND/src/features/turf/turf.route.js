import express from 'express';
import {
  createTurf,
  getMyTurfs,
  getTurf,
  updateTurf,
  verifyTurf,
  assignStaff,
  removeStaff,
  getTurfStaff,
  getAllPendingVerificationTurfs
} from '../turf/turf.controller.js';

import { authCheck, authorizeRoles } from '../../middlewares/auth.js';
import { uploadTurfMedia, processUpload } from '../../middlewares/fileUpload.js';
import { blockSlot, generateSlots, getAllSlots, getAvailableSlots, unblockSlot } from './slot.controller.js';

const router = express.Router();

// ---------------------- TURF ROUTES ----------------------

// Create a turf
router.post(
  '/',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  uploadTurfMedia,
  processUpload,
  createTurf
);

// Get my turfs
router.get(
  '/my',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  getMyTurfs
);

// Get all pending verification turfs
router.get(
  '/pending-verification',
  authCheck,
  authorizeRoles('admin', 'superadmin'),
  getAllPendingVerificationTurfs
);

// Update a turf
router.patch(
  '/:turfId',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  uploadTurfMedia,
  processUpload,
  updateTurf
);

// Verify a turf
router.patch(
  '/:turfId/verify',
  authCheck,
  authorizeRoles('admin', 'superadmin'),
  verifyTurf
);

// Assign staff to a turf
router.post(
  '/:turfId/staff',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  assignStaff
);

// Remove staff from a turf
router.delete(
  '/:turfId/staff/:staffId',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  removeStaff
);

// Get all staff of a turf
router.get(
  '/:turfId/staff',
  authCheck,
  getTurfStaff
);

// Generate slots for a turf
router.post(
  '/:turfId/generate-slots',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  generateSlots
);

// Get available slots for a turf
router.get(
  '/:turfId/available-slots',
  getAvailableSlots
);

// Get all slots for a turf
router.get(
  '/:turfId/slots',
  authCheck,
  authorizeRoles('owner', 'staff', 'admin', 'superadmin'),
  getAllSlots
);

// Block a slot
router.patch(
  '/slots/:slotId/block',
  authCheck,
  authorizeRoles('owner', 'staff', 'admin', 'superadmin'),
  blockSlot
);

// Unblock a slot
router.patch(
  '/slots/:slotId/unblock',
  authCheck,
  authorizeRoles('owner', 'staff', 'admin', 'superadmin'),
  unblockSlot
);

// Get a single turf by identifier (must come last to avoid catching other routes)
router.get('/:identifier', getTurf);

export default router;