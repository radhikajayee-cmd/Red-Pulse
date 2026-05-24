import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donor from '../models/Donor.js';

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'blood_bank_jwt_secret_key_2026_modern_secure', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Donor or Hospital)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, ...donorFields } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    // If registering as a donor, automatically create a Donor record linking to this user
    if (role === 'donor') {
      const { age, gender, bloodGroup, lastDonationDate, medicalStatus } = donorFields;
      await Donor.create({
        name,
        email,
        phone: phone || 'N/A',
        age: age || 18,
        gender: gender || 'Other',
        bloodGroup: bloodGroup || 'O+',
        address: address || 'N/A',
        lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
        medicalStatus: medicalStatus || 'Healthy',
        userId: user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch related donor profile if donor role
    let donorProfile = null;
    if (user.role === 'donor') {
      // Find donor where email = user.email or userId = user._id
      donorProfile = await Donor.findOne({ $or: [{ userId: user._id }, { email: user.email }] });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
      },
      donorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, address, profileImage } = req.body;

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();

    // If donor, update the linked donor record too
    if (user.role === 'donor') {
      const donor = await Donor.findOne({ $or: [{ userId: user._id }, { email: user.email }] });
      if (donor) {
        donor.name = name || donor.name;
        donor.phone = phone || donor.phone;
        donor.address = address || donor.address;
        await donor.save();
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Provide current and new password' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // In mock mode, the object retrieved might not have bcrypt methods or password field if not loaded,
    // but findById returns the raw mock object which DOES contain password.
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
