const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTPEmail } = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// Step 1: Send OTP for signup
exports.sendSignupOTP = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) return res.status(400).json({ message: 'Email already registered. Please login.' });

    // Remove previous unverified user and OTPs
    if (existing && !existing.isVerified) await User.deleteOne({ email });
    await OTP.deleteMany({ email, purpose: 'signup' });

    // Create unverified user
    const user = await User.create({ name, email, password, businessName, isVerified: false });

    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      purpose: 'signup',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPEmail(email, otp, 'signup');
    res.json({ message: 'OTP sent to your email. Please verify to complete registration.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// Step 2: Verify OTP and activate account
exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, purpose: 'signup', expiresAt: { $gt: new Date() } });

    if (!record) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    await OTP.deleteMany({ email, purpose: 'signup' });

    const token = signToken(user._id);
    res.json({ message: 'Account verified successfully!', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.isVerified) return res.status(401).json({ message: 'Account not verified. Please check your email.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = signToken(user._id);
    res.json({ message: 'Login successful!', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// Forgot password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isVerified: true });
    if (!user) return res.status(404).json({ message: 'No verified account found with this email.' });

    await OTP.deleteMany({ email, purpose: 'reset-password' });

    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      purpose: 'reset-password',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPEmail(email, otp, 'reset-password');
    res.json({ message: 'Password reset OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify reset OTP
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, purpose: 'reset-password', expiresAt: { $gt: new Date() } });

    if (!record) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    record.verified = true;
    await record.save();

    // Generate a short-lived reset token
    const resetToken = jwt.sign({ email, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ message: 'OTP verified. You can now reset your password.', resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OTP verification failed. Please try again.' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset token expired. Please start over.' });
    }

    if (decoded.purpose !== 'reset') return res.status(400).json({ message: 'Invalid reset token.' });

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email: decoded.email, purpose: 'reset-password' });
    res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Password reset failed. Please try again.' });
  }
};

// Change password (authenticated)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both fields are required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to change password. Please try again.' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
