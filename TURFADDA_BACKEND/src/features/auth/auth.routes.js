import express from 'express';
import { register, verifyMobileOTP, login, updateProfile } from './auth.controller.js';
import { authCheck, authorizeRoles } from '../../middlewares/auth.js';
import { uploadFile, processUpload } from '../../middlewares/fileUpload.js';
import passport from 'passport';


const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyMobileOTP);
router.post('/login', login);

router.patch(
  '/profile',
  authCheck,
  uploadFile('profileImage'),
  processUpload,

  updateProfile
);


router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Callback (after user approves)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Successful authentication – issue your JWT
    const token = signToken({ id: req.user.id, role: req.user.role });

    // Redirect to frontend with token (or send JSON)
    // Option 1: Redirect to frontend success page with token in URL
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);

    // Option 2: Send JSON (if frontend calls this via fetch)
    // res.json({ success: true, token, user: req.user });
  }
);

export default router;