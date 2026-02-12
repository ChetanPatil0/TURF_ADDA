import User from './auth.model.js';
import { generateOTP, sendOTP } from '../../utils/otp.js';
import { signToken } from '../../utils/jwt.js';
import { sendError, sendSuccess } from '../../utils/errorHandler.js';
import PendingRegistration from './pendingRegistration.model.js';
import { hashPassword } from '../../utils/password.js';

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
    });

    await user.save();

    // Clean up
    await PendingRegistration.deleteOne({ _id: pendingId });

    // Use custom id field
    const token = signToken({ id: user.id, role: user.role });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,              // using custom id
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        role: user.role,
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

    const token = signToken({
      id: user.id,
      role: user.role
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        email: user.email || null,
        role: user.role
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Something went wrong');
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    if (req.file) {
      updates.profileImage = req.file.path;
    }

    delete updates.role;
    delete updates.status;

    const user = await User.findOneAndUpdate(
      { id: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      email: user.email,
      profileImage: user.profileImage,
      country: user.country,
      state: user.state,
      city: user.city,
      area: user.area,
      gender: user.gender,
      preferredSports: user.preferredSports,
    }, 'Profile updated successfully');
  } catch (error) {
    return sendError(res, 500, 'Server error');
  }
};