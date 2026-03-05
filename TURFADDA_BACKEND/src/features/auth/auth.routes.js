import express from 'express';
import passport from 'passport';

import {
  register,
  verifyMobileOTP,
  login,
  updateProfile,
  getProfile,
  getAllUsers,
  requestResetOtp,
  verifyResetOtp,
  resetPassword,
  changePassword,
  softDeleteUser,
} from './auth.controller.js';

import { authCheck, authorizeRoles } from '../../middlewares/auth.js';
import { uploadFile, processUpload } from '../../middlewares/fileUpload.js';
import { signToken } from '../../utils/jwt.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyMobileOTP);
router.post('/login', login);

router.post('/forgot-password/otp', requestResetOtp);
router.post('/forgot-password/verify', verifyResetOtp);
router.post('/forgot-password/reset', resetPassword);
router.post('/change-password', authCheck, changePassword);

router.get('/profile', authCheck, getProfile);

router.patch(
  '/profile',
  authCheck,
  uploadFile('profileImage'),
  processUpload,
  updateProfile
);

router.get(
  '/users',
  authCheck,
  authorizeRoles('admin', 'superadmin'),
  getAllUsers
);

router.delete(
  '/users/:id',
  authCheck,
  authorizeRoles('admin', 'superadmin'),
  softDeleteUser
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    const token = signToken({
      id: req.user.id,
      role: req.user.role,
    });

    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
  }
);

export default router;