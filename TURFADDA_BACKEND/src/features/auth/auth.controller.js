import User from './auth.model.js';
import mongoose from 'mongoose';
import { generateOTP, sendOTP } from '../../utils/otp.js';
import { signToken } from '../../utils/jwt.js';
import { sendError, sendSuccess } from '../../utils/errorHandler.js';
import PendingRegistration from './pendingRegistration.model.js';
import { hashPassword } from '../../utils/password.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../utils/email.js';

export const register = async (req, res) => {
  try {
    const { firstName, middleName, lastName, mobile, email, password, role } = req.body;

    if (!['player', 'owner', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Mobile already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await PendingRegistration.deleteOne({ mobile });

    const pending = new PendingRegistration({
      firstName,
      middleName,
      lastName,
      mobile,
      email,
      password,
      role,
      otp,
      otpExpiry,
    });

    await pending.save();

    await sendOTP(mobile, otp);

    return res.status(201).json({
      success: true,
      pendingId: pending._id.toString(),
      message: 'OTP sent to your mobile number',
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const verifyMobileOTP = async (req, res) => {
  try {
    const { pendingId, otp } = req.body;

    if (!pendingId || !otp) {
      return res.status(400).json({ success: false, message: 'pendingId and otp required' });
    }

    const pending = await PendingRegistration.findById(pendingId);
    if (!pending) {
      return res.status(404).json({ success: false, message: 'Session expired or invalid' });
    }

    if (pending.otp !== otp || pending.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Create real user
    const user = new User({
      firstName: pending.firstName,
      middleName: pending.middleName,
      lastName: pending.lastName,
      mobile: pending.mobile,
      email: pending.email || null,
      password: pending.password,
      role: pending.role,
      isVerifiedMobile: true,
      lastLogin: new Date(), 
    });

    await user.save();

    // Clean up
    await PendingRegistration.deleteOne({ _id: pendingId });

    // Use custom id field
    const token = signToken({ id: user.id, role: user.role });
    const userData = user.toObject();
delete userData.password; 

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,             
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        mobile: user.mobile,
        email: user.email,
        isVerifiedMobile: user.isVerifiedMobile,
        isVerifiedEmail: user.isVerifiedEmail,
        profileImage: user.profileImage,
        gender: user.gender,
        country: user.country,
        state: user.state,
        city: user.city,
        area: user.area,
        preferredSports: user.preferredSports,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      message: 'Registration completed, logged in successfully',
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
  

    if (!identifier ) {
      return sendError(res, 400, 'Mobile/Email  are required');
    }
    if(!password){
       return sendError(res, 400, 'Password are required');   
    }



    const user = await User.findOne({
      $or: [
        { mobile: identifier },
        { email: identifier.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return sendError(res, 401, 'No account found');
    }

    if (!user.isVerifiedMobile) {
      return sendError(res, 403, 'Please verify your mobile number first');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return sendError(res, 401, 'Incorrect password');
    }

     user.lastLogin = new Date();
    await user.save();

    const token = signToken({
      id: user.id,
      role: user.role
    });

    return sendSuccess(res, {
      token,
      user: {
       id: user.id,             
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        mobile: user.mobile,
        email: user.email,
        isVerifiedMobile: user.isVerifiedMobile,
        isVerifiedEmail: user.isVerifiedEmail,
        profileImage: user.profileImage,
        gender: user.gender,
        country: user.country,
        state: user.state,
        city: user.city,
        area: user.area,
        preferredSports: user.preferredSports,
        role: user.role,
        lastLogin: user.lastLogin,
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Something went wrong');
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select(
        'id firstName middleName lastName mobile email role status ' +
        'isVerifiedMobile isVerifiedEmail country state city area ' +
        'lastLogin createdAt profileImage'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let updates = { ...req.body };

    if (req.file) {
      updates.profileImage = req.file.path;
    }

    // Prevent changing protected fields
    delete updates.role;
    delete updates.status;
    delete updates.isVerifiedMobile;
    delete updates.isVerifiedEmail;

    // Fix gender - convert empty string to null
    if (updates.gender === '' || updates.gender === undefined) {
      updates.gender = null;
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return full consistent shape
    res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName || '',
        middleName: updatedUser.middleName || '',
        lastName: updatedUser.lastName || '',
        mobile: updatedUser.mobile || '',
        email: updatedUser.email || '',
        isVerifiedMobile: !!updatedUser.isVerifiedMobile,
        isVerifiedEmail: !!updatedUser.isVerifiedEmail,
        profileImage: updatedUser.profileImage || '',
        gender: updatedUser.gender || null,
        country: updatedUser.country || '',
        state: updatedUser.state || '',
        city: updatedUser.city || '',
        area: updatedUser.area || '',
        preferredSports: updatedUser.preferredSports || [],
        role: updatedUser.role || 'player',
        lastLogin: updatedUser.lastLogin || null,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 

  
    const user = await User.findOne({ id: userId }).select(
      'id firstName middleName lastName mobile email isVerifiedMobile isVerifiedEmail role profileImage gender country state city area preferredSports status lastLogin createdAt updatedAt'
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Return success response
    return sendSuccess(res, {
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        mobile: user.mobile,
        email: user.email || null,
        isVerifiedMobile: user.isVerifiedMobile,
        isVerifiedEmail: user.isVerifiedEmail,
        role: user.role,
        profileImage: user.profileImage || '',
        gender: user.gender || null,
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        area: user.area || '',
        preferredSports: user.preferredSports || [],
        status: user.status,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }, 'Profile fetched successfully');

  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 500, 'Failed to fetch profile', error.message);
  }
};



export const requestResetOtp = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email or mobile is required' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { mobile: identifier.trim() }
      ]
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, OTP has been sent'
      });
    }

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    let channel = null;
    let sendTo = null;

    if (user.email && user.email.toLowerCase() === identifier.toLowerCase().trim()) {
      channel = 'email';
      sendTo = user.email;
    } else if (user.mobile === identifier.trim()) {
      channel = 'mobile';
      sendTo = user.mobile;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid identifier' });
    }

    user.resetPasswordToken = hashedOtp;
    user.resetPasswordExpires = expires;
    user.resetChannel = channel;

    await user.save();

    if (channel === 'email') {
      await sendEmail({
        to: sendTo,
        subject: 'Turfadda Password Reset OTP',
        html: `
          <p>Use this code to reset your password:</p>
          <h2>${otp}</h2>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } else {
      await sendOTP(sendTo, otp);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Reset OTP request error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { mobile: identifier.trim() }
      ],
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Reset OTP verify error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;

    if (!identifier || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Valid identifier and password (min 8 characters) required'
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { mobile: identifier.trim() }
      ],
      resetPasswordExpires: { $gt: new Date() },
      resetPasswordToken: { $exists: true }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Session expired or invalid. Please request a new OTP.'
      });
    }

    user.password = newPassword;
    user.lastPasswordReset = new Date();

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetChannel = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const softDeleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

 
  if (user.role === 'superadmin') {
    res.status(403);
    throw new Error('Cannot delete superadmin account');
  }

  if (user.isDeleted) {
    res.status(400);
    throw new Error('User is already deleted');
  }

  await user.softDelete();

  res.status(200).json({
    success: true,
    message: 'User account has been deactivated',
    userId: user._id || user.id
  });
};


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    let user;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ id: userId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const isSamePassword = await user.comparePassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as current password'
      });
    }

    user.password = newPassword;
    user.lastPasswordReset = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



