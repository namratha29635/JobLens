const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const { sendOTPEmail } = require('../services/email.service');
const asyncHandler = require('../utils/asyncHandler');

// ── Sign JWT 
const JWT_SECRET = process.env.JWT_SECRET || 'joblens_jwt_super_secret_key_prod_dev_2026';
const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
// POST /api/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ApiError(400, 'Email and password are required'));
  
  const normalizedEmail = email.toLowerCase().trim();
  // password field is select:false
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    return next(new ApiError(404, 'Account does not exist. Please create an account first.'));
  }
  if (!(await user.comparePassword(password))) {
    return next(new ApiError(401, 'Incorrect password. Please try again.'));
  }
  if (!user.isActive)
    return next(new ApiError(403, 'Account is deactivated. Contact the placement coordinator.'));
  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  const token = signToken(user._id);
  // Attach student profile for student role
  let profile = null;
  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id });
  }
  res.status(200).json(
    new ApiResponse(200, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
      profile,
    }, 'Login successful')
  );
});
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return next(new ApiError(400, 'Both currentPassword and newPassword are required'));
  if (newPassword.length < 8)
    return next(new ApiError(400, 'New password must be at least 8 characters'));
  if (currentPassword === newPassword)
    return next(new ApiError(400, 'New password must be different from the current password'));

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword)))
    return next(new ApiError(401, 'Current password is incorrect'));

  user.password = newPassword; // pre-save hook will hash it
  user.isFirstLogin = false;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully. Please log in again.'));
});
// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ApiError(400, 'Email is required'));
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Respond generically to prevent email enumeration attacks
  if (!user) {
    return res.status(200).json(
      new ApiResponse(200, null, 'If that email exists in our system, an OTP has been sent')
    );
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  user.passwordResetOTP = otp;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });
  await sendOTPEmail(user.email, otp);
  res.status(200).json(
    new ApiResponse(200, null, 'OTP sent to your registered email address. Valid for 10 minutes.')
  );
});
// POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return next(new ApiError(400, 'email, otp, and newPassword are all required'));
  if (newPassword.length < 8)
    return next(new ApiError(400, 'Password must be at least 8 characters'));
  // Find user whose OTP has not expired
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetOTP +passwordResetExpires');
  if (!user || user.passwordResetOTP !== otp)
    return next(new ApiError(400, 'OTP is invalid or has expired. Please request a new one.'));
  user.password = newPassword; // pre-save hook hashes it
  user.isFirstLogin = false;
  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password reset successful. Please log in with your new password.')
  );
});
// GET /api/auth/me  (protected)
exports.getMe = asyncHandler(async (req, res) => {
  let profile = null;
  if (req.user.role === 'student') {
    profile = await Student.findOne({ user: req.user._id });
  }
  res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isFirstLogin: req.user.isFirstLogin,
        lastLogin: req.user.lastLogin,
        isActive: req.user.isActive,
      },
      profile,
    })
  );
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role = 'student',
    rollNumber,
    branch = 'CSE',
    passedOutYear = 2026,
    cgpa = 8.0,
    contact = '',
  } = req.body;

  if (!email || !password)
    return next(new ApiError(400, 'Email and password are required'));

  if (password.length < 6)
    return next(new ApiError(400, 'Password must be at least 6 characters'));

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser)
    return next(new ApiError(400, 'An account with this email already exists'));

  const validRoles = ['student', 'coordinator'];
  const userRole = validRoles.includes(role) ? role : 'student';

  if (userRole === 'student') {
    const studentName = (name && name.trim()) ? name.trim() : normalizedEmail.split('@')[0];
    const roll = (rollNumber && rollNumber.trim() ? rollNumber.trim() : `JL${Date.now().toString().slice(-6)}`).toUpperCase();

    const existingStudent = await Student.findOne({ rollNumber: roll });
    if (existingStudent)
      return next(new ApiError(400, 'A student with this roll number already exists'));

    const user = await User.create({
      email: normalizedEmail,
      password,
      role: 'student',
      isFirstLogin: false,
      isActive: true,
      lastLogin: new Date(),
    });

    const validBranches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'DS'];
    const chosenBranch = validBranches.includes(branch) ? branch : 'CSE';

    const profile = await Student.create({
      user: user._id,
      rollNumber: roll,
      name: studentName,
      passedOutYear: Number(passedOutYear) || 2026,
      branch: chosenBranch,
      collegeEmail: normalizedEmail,
      cgpa: Number(cgpa) ? Math.min(10, Math.max(0, Number(cgpa))) : 8.0,
      contact: contact || '',
      activeBacklogs: 0,
      totalBacklogs: 0,
    });

    const token = signToken(user._id);

    return res.status(201).json(
      new ApiResponse(201, {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
        },
        profile,
      }, 'Account registered successfully')
    );
  } else {
    // Coordinator
    const user = await User.create({
      email: normalizedEmail,
      password,
      role: 'coordinator',
      isFirstLogin: false,
      isActive: true,
      lastLogin: new Date(),
    });

    const token = signToken(user._id);

    return res.status(201).json(
      new ApiResponse(201, {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
        },
        profile: null,
      }, 'Coordinator account registered successfully')
    );
  }
});

// POST /api/auth/seed-demo
exports.seedDemoUsers = asyncHandler(async (req, res) => {
  const created = [];
  let coord = await User.findOne({ email: 'coordinator@college.edu' });
  if (!coord) {
    coord = await User.create({
      email: 'coordinator@college.edu',
      password: 'Test@123',
      role: 'coordinator',
      isFirstLogin: false,
      isActive: true,
    });
    created.push('coordinator@college.edu');
  }

  let stuUser = await User.findOne({ email: 'student@college.edu' });
  if (!stuUser) {
    stuUser = await User.create({
      email: 'student@college.edu',
      password: 'Test@123',
      role: 'student',
      isFirstLogin: false,
      isActive: true,
    });
    created.push('student@college.edu');
  }

  let stuProfile = await Student.findOne({ collegeEmail: 'student@college.edu' });
  if (!stuProfile && stuUser) {
    stuProfile = await Student.create({
      user: stuUser._id,
      rollNumber: '22CS001',
      name: 'Demo Student',
      passedOutYear: 2026,
      branch: 'CSE',
      collegeEmail: 'student@college.edu',
      cgpa: 8.5,
      activeBacklogs: 0,
      totalBacklogs: 0,
    });
    created.push('Student Profile (22CS001)');
  }

  res.status(200).json(new ApiResponse(200, { created }, 'Demo users verified/seeded'));
});

