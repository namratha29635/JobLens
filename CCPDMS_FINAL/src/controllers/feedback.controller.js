const Feedback = require('../models/Feedback');
const Application = require('../models/Application');
const Student = require('../models/Student');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
// POST /api/feedback  — Student submits anonymous feedback
//  • Student identity NEVER stored in a way that is returned via API
exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id }).select('_id passedOutYear');
  if (!student) return next(new ApiError(404, 'Student profile not found'));

  const { driveId, driveType = 'on-campus', companyName, role, rounds, outcome } = req.body;
  if (!companyName || !companyName.trim()) {
    return next(new ApiError(400, 'Company name is required'));
  }

  const mongoose = require('mongoose');
  const validDriveId = (driveId && mongoose.Types.ObjectId.isValid(driveId))
    ? driveId
    : new mongoose.Types.ObjectId();

  const validDriveType = ['on-campus', 'off-campus', 'general', 'internship', 'referral'].includes(driveType)
    ? driveType
    : 'on-campus';

  // If application exists for this on-campus drive, mark feedback submitted
  if (driveId && mongoose.Types.ObjectId.isValid(driveId)) {
    await Application.updateOne(
      { student: student._id, drive: driveId },
      { $set: { feedbackSubmitted: true } }
    ).catch(() => {});
  }

  const sanitizedRounds = Array.isArray(rounds)
    ? rounds
        .map(r => ({
          roundName: (r.roundName || '').trim(),
          description: (r.description || '').trim(),
          challenges: (r.challenges || '').trim(),
        }))
        .filter(r => r.roundName || r.description || r.challenges)
    : [];

  const createdFeedback = await Feedback.create({
    driveRef: {
      driveId: validDriveId,
      driveType: validDriveType,
    },
    student: student._id,          // select:false — never returned in GET
    companyName: companyName.trim(),
    role: (role || '').trim(),
    passedOutYear: student.passedOutYear || new Date().getFullYear(),
    rounds: sanitizedRounds,
    outcome: ['selected', 'rejected', 'in_progress'].includes(outcome) ? outcome : 'selected',
  });

  res.status(201).json(
    new ApiResponse(201, createdFeedback, 'Thank you! Your interview experience has been shared anonymously.')
  );
});
// GET /api/feedback/companies  — All company names that have at least 1 feedback
exports.getCompaniesWithFeedback = asyncHandler(async (req, res) => {
  const companies = await Feedback.aggregate([
    {
      $group: {
        _id: '$companyName',
        count: { $sum: 1 },
        driveTypes: { $addToSet: '$driveRef.driveType' },
        latestYear: { $max: '$passedOutYear' },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        companyName: '$_id',
        count: 1,
        driveTypes: 1,
        latestYear: 1,
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, companies));
});
// GET /api/feedback/company/:companyName  — Paginated anonymous feedbacks
// student field is excluded via select('-student') — extra safety layer
exports.getFeedbackByCompany = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const regex = new RegExp(req.params.companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const [feedbacks, total] = await Promise.all([
    Feedback.find({ companyName: regex })
      .select('-student')              // NEVER return student identity
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Feedback.countDocuments({ companyName: regex }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      feedbacks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  );
});
// GET /api/feedback/drive/:driveId  — All feedbacks for a specific drive
exports.getFeedbackByDrive = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ 'driveRef.driveId': req.params.driveId })
    .select('-student')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { count: feedbacks.length, feedbacks }));
});
