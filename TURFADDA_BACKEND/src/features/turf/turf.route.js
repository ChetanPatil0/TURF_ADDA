import express from 'express';
import {
  createTurf,
  getMyTurfs,
  getTurf,
  updateTurf,
  verifyTurf,
  assignStaff,
  removeStaff,
  getTurfStaff
} from '../turf/turf.controller.js';

import { authCheck, authorizeRoles } from '../../middlewares/auth.js';
import { uploadTurfMedia, processUpload } from '../../middlewares/fileUpload.js';
import { blockSlot, generateSlots, getAllSlots, getAvailableSlots, unblockSlot } from './slot.controller.js';

const router = express.Router();

router.get('/:identifier', getTurf);

router.post(
  '/',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  uploadTurfMedia,
  processUpload,
  createTurf
);

router.get(
  '/my',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  getMyTurfs
);

router.patch(
  '/:turfId',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  uploadTurfMedia,
  processUpload,
  updateTurf
);

router.post(
  '/:turfId/staff',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  assignStaff
);

router.delete(
  '/:turfId/staff/:staffId',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  removeStaff
);

router.get(
  '/:turfId/staff',
  authCheck,
  getTurfStaff
);

router.patch(
  '/:turfId/verify',
  authCheck,
  authorizeRoles('admin', 'superadmin'),
  verifyTurf
);

router.post(
  '/:turfId/generate-slots',
  authCheck,
  authorizeRoles('owner', 'admin', 'superadmin'),
  generateSlots
);

router.get(
  '/:turfId/available-slots',
  getAvailableSlots
);

router.get(
  '/:turfId/slots',
  authCheck,
  authorizeRoles('owner', 'staff', 'admin', 'superadmin'),
  getAllSlots
);

router.patch(
  '/slots/:slotId/block',
  authCheck,
  authorizeRoles('owner', 'staff', 'admin', 'superadmin'),
  blockSlot
);

router.patch(
  '/slots/:slotId/unblock',
  authCheck,
  authorizeRoles('owner', 'staff', 'admin', 'superadmin'),
  unblockSlot
);

export default router;