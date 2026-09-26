const Student = require('../models/Student');
const OnCampusDrive = require('../models/OnCampusDrive');
const OffCampusDrive = require('../models/OffCampusDrive');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { sendBulkEmails } = require('../services/email.service');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'DS'];
const BATCHES = [2026, 2027, 2028, 2029];
// GET /api/coordinator/dashboard
// Returns batch-wise pie chart data: for each batch → branch-level student count
// + placement percentage
// Also returns summary counts for total drives, frozen drives, etc.
exports.getDashboard = asyncHandler(async (req, res) => {
  // Fetch students in a single lightweight query
  const students = await Student.find({}, 'passedOutYear branch stats.drivesSelected').lean();

  const batchData = BATCHES.map((batch) => {
    const batchStudents = students.filter((s) => s.passedOutYear === batch);
    const branchStats = BRANCHES.map((branch) => {
      const branchStudents = batchStudents.filter((s) => s.branch === branch);
      const total = branchStudents.length;
      const selected = branchStudents.filter((s) => s.stats?.drivesSelected > 0).length;
      return {
        branch,
        total,
        selected,
        percentage: total > 0 ? parseFloat(((selected / total) * 100).toFixed(1)) : 0,
      };
    });

    const batchTotal = batchStudents.length;
    const batchSelected = batchStudents.filter((s) => s.stats?.drivesSelected > 0).length;

    return {
      batch,
      total: batchTotal,
      selected: batchSelected,
      placementPercent:
        batchTotal > 0 ? parseFloat(((batchSelected / batchTotal) * 100).toFixed(1)) : 0,
      branches: branchStats,
    };
  });

  // Summary counts
  const totalOnCampusDrives = await OnCampusDrive.countDocuments();
  const totalOffCampusDrives = await OffCampusDrive.countDocuments();
  const frozenDrives = await OnCampusDrive.countDocuments({ isFrozen: true });

  res.status(200).json(
    new ApiResponse(200, {
      batchData,
      summary: {
        totalStudents: students.length,
        totalOnCampusDrives,
        totalOffCampusDrives,
        frozenDrives,
        activeDrives: totalOnCampusDrives - frozenDrives,
      },
    })
  );
});

// GET /api/coordinator/placement-stats/:batch
// Detailed stats for one passed-out year: drives, selected counts, branch breakdown
exports.getPlacementStats = asyncHandler(async (req, res, next) => {
  const batch = Number(req.params.batch);
  if (!BATCHES.includes(batch))
    return next(new ApiError(400, `Invalid batch. Allowed: ${BATCHES.join(', ')}`));

  const [students, onCampusDrives, offCampusDrives] = await Promise.all([
    Student.find({ passedOutYear: batch })
      .select('name rollNumber branch cgpa activeBacklogs stats'),
    OnCampusDrive.find({ eligibleBatches: batch })
      .populate('rounds', 'roundNumber roundName isFinalRound')
      .sort({ createdAt: -1 }),
    OffCampusDrive.find({ eligibleBatches: batch }).sort({ publishedAt: -1 }),
  ]);

  // Branch-wise breakdown
  const branchBreakdown = BRANCHES.map((branch) => {
    const branchStudents = students.filter((s) => s.branch === branch);
    const selected = branchStudents.filter((s) => s.stats?.drivesSelected > 0);
    return {
      branch,
      total: branchStudents.length,
      selected: selected.length,
      percentage: branchStudents.length > 0
        ? parseFloat(((selected.length / branchStudents.length) * 100).toFixed(1))
        : 0,
    };
  }).filter((b) => b.total > 0);

  const totalStudents = students.length;
  const totalSelected = students.filter((s) => s.stats?.drivesSelected > 0).length;

  res.status(200).json(
    new ApiResponse(200, {
      batch,
      totalStudents,
      totalSelected,
      overallPlacementPercent:
        totalStudents > 0 ? parseFloat(((totalSelected / totalStudents) * 100).toFixed(1)) : 0,
      branchBreakdown,
      onCampusDrives,
      offCampusDrives,
    })
  );
});
exports.getStudentList = asyncHandler(async (req, res) => {
  const {
    batch, branch, minCgpa, maxCgpa, maxBacklogs,
    page = 1, limit = 20,
  } = req.query;

  const filter = {};
  if (batch) filter.passedOutYear = Number(batch);
  if (branch) filter.branch = branch;
  if (minCgpa) filter.cgpa = { ...filter.cgpa, $gte: Number(minCgpa) };
  if (maxCgpa) filter.cgpa = { ...filter.cgpa, $lte: Number(maxCgpa) };
  if (maxBacklogs) filter.activeBacklogs = { $lte: Number(maxBacklogs) };

  const skip = (Number(page) - 1) * Number(limit);

  const [students, total] = await Promise.all([
    Student.find(filter)
      .select('rollNumber name branch passedOutYear cgpa activeBacklogs collegeEmail stats resume')
      .sort({ passedOutYear: 1, branch: 1, rollNumber: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Student.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      students,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  );
});
// GET /api/coordinator/students/:studentId  — Single student full profile
exports.getStudentDetail = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.studentId)
    .populate('user', 'email isActive lastLogin');
  if (!student) return next(new ApiError(404, 'Student not found'));

  const applications = await Application.find({ student: student._id })
    .populate('drive', 'companyName status isFrozen')
    .sort({ appliedAt: -1 });

  res.status(200).json(new ApiResponse(200, { student, applications }));
});
// POST /api/coordinator/notify  — Bulk email & in-app notification to batch/branch or drive applicants
exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { subject, message, batch, branch, driveId, applicationStatus, customEmails } = req.body;

  if (!subject || !message)
    return next(new ApiError(400, 'subject and message are required'));

  let targetStudents = [];

  // Custom explicit email list
  if (Array.isArray(customEmails) && customEmails.length > 0) {
    const validEmails = customEmails.filter(e => typeof e === 'string' && e.includes('@'));
    targetStudents = await Student.find({ collegeEmail: { $in: validEmails } }).select('_id user collegeEmail name');
  } else if (driveId) {
    // Target applicants of a specific drive
    const appFilter = { drive: driveId };
    if (applicationStatus) appFilter.overallStatus = applicationStatus;

    const applications = await Application.find(appFilter).populate('student', '_id user collegeEmail name');
    targetStudents = applications.map(a => a.student).filter(Boolean);
  } else {
    // Target batch/branch filtered students
    const filter = {};
    if (batch) filter.passedOutYear = Number(batch);
    if (branch) filter.branch = branch;

    targetStudents = await Student.find(filter).select('_id user collegeEmail name');
  }

  // Deduplicate target students by _id
  const seen = new Set();
  targetStudents = targetStudents.filter(s => {
    if (!s || !s._id) return false;
    const id = s._id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  if (!targetStudents.length)
    return next(new ApiError(404, 'No recipient students found matching the given filters'));

  // 1. Create In-App Notification records in MongoDB for every recipient student
  const category = subject.toLowerCase().includes('shortlist') ? 'shortlist'
    : subject.toLowerCase().includes('congrat') || subject.toLowerCase().includes('offer') ? 'offer'
    : subject.toLowerCase().includes('schedule') || subject.toLowerCase().includes('venue') ? 'schedule'
    : subject.toLowerCase().includes('reminder') ? 'reminder'
    : 'announcement';

  const notificationDocs = targetStudents.map(s => ({
    student: s._id,
    user: s.user || s._id,
    title: subject.trim(),
    message: message.trim(),
    sender: req.user?.email ? `Placement Cell (${req.user.email})` : 'Placement Cell (CCPDMS)',
    drive: driveId || undefined,
    category,
    isRead: false,
  }));

  await Notification.insertMany(notificationDocs).catch(err => console.error('[Notification] DB Insert Error:', err.message));

  // 2. Dispatch SMTP emails in the background
  const emails = targetStudents.map(s => s.collegeEmail).filter(Boolean);
  if (emails.length > 0) {
    sendBulkEmails({ to: emails, subject, text: message });
  }

  await AuditLog.create({
    user: req.user._id, action: 'NOTIFICATION_SENT',
    entity: 'Student',
    details: {
      subject,
      recipientCount: targetStudents.length,
      batch: batch || 'All',
      branch: branch || 'All',
      driveId: driveId || null,
      statusFilter: applicationStatus || 'All',
    },
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, { recipientCount: targetStudents.length },
      `Notification dispatched to ${targetStudents.length} student${targetStudents.length === 1 ? '' : 's'}`)
  );
});

// GET /api/coordinator/notifications/history
exports.getNotificationHistory = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({ action: 'NOTIFICATION_SENT' })
    .populate('user', 'email role')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.status(200).json(new ApiResponse(200, { notifications: logs }));
});

// GET /api/coordinator/audience-count
exports.getAudienceCount = asyncHandler(async (req, res) => {
  const { batch, branch, driveId, applicationStatus } = req.query;

  let count = 0;
  if (driveId) {
    const filter = { drive: driveId };
    if (applicationStatus) filter.overallStatus = applicationStatus;
    count = await Application.countDocuments(filter);
  } else {
    const filter = {};
    if (batch) filter.passedOutYear = Number(batch);
    if (branch) filter.branch = branch;
    count = await Student.countDocuments(filter);
  }

  res.status(200).json(new ApiResponse(200, { count }));
});

// ── APPLICATIONS MANAGEMENT ──────────────────────────────────────────────────
// GET /api/coordinator/applications?driveId=&status=&batch=&branch=&search=&page=&limit=
exports.getAllApplications = asyncHandler(async (req, res) => {
  const {
    driveId, status, batch, branch, search,
    page = 1, limit = 25,
  } = req.query;

  const appFilter = {};
  if (driveId) appFilter.drive = driveId;
  if (status) appFilter.overallStatus = status;

  const skip = (Number(page) - 1) * Number(limit);

  // Populate student and drive
  let query = Application.find(appFilter)
    .populate('student', 'rollNumber name branch passedOutYear cgpa activeBacklogs collegeEmail contact resume')
    .populate('drive', 'companyName minPackage maxPackage status isFrozen selectionRatio eligibleBatches eligibleBranches')
    .sort({ appliedAt: -1 });

  const allApps = await query.lean();

  // In-memory filter for student fields (search, branch, batch) if provided
  let filtered = allApps.filter((app) => {
    if (!app.student) return false;
    if (batch && app.student.passedOutYear !== Number(batch)) return false;
    if (branch && app.student.branch !== branch) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = app.student.name?.toLowerCase().includes(q);
      const matchRoll = app.student.rollNumber?.toLowerCase().includes(q);
      const matchEmail = app.student.collegeEmail?.toLowerCase().includes(q);
      const matchCompany = app.drive?.companyName?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchEmail && !matchCompany) return false;
    }
    return true;
  });

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + Number(limit));

  // Compute status summary counts
  const summary = {
    total,
    registered: filtered.filter(a => a.overallStatus === 'registered').length,
    shortlisted: filtered.filter(a => a.overallStatus === 'shortlisted').length,
    in_progress: filtered.filter(a => a.overallStatus === 'in_progress').length,
    selected: filtered.filter(a => a.overallStatus === 'selected').length,
    rejected: filtered.filter(a => a.overallStatus === 'rejected' || a.overallStatus === 'not_shortlisted').length,
  };

  res.status(200).json(
    new ApiResponse(200, {
      applications: paginated,
      summary,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    })
  );
});

// PATCH /api/coordinator/applications/:id/status
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { overallStatus, eliminatedAtRound } = req.body;

  const validStatuses = ['registered', 'shortlisted', 'in_progress', 'selected', 'rejected', 'not_shortlisted'];
  if (!overallStatus || !validStatuses.includes(overallStatus)) {
    return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
  }

  const application = await Application.findById(id).populate('student', 'name stats').populate('drive', 'companyName');
  if (!application) return next(new ApiError(404, 'Application not found'));

  const prevStatus = application.overallStatus;
  application.overallStatus = overallStatus;
  if (eliminatedAtRound !== undefined) application.eliminatedAtRound = eliminatedAtRound;
  await application.save();

  // If status changed to selected, update student stats
  if (overallStatus === 'selected' && prevStatus !== 'selected' && application.student) {
    await Student.findByIdAndUpdate(application.student._id, { $inc: { 'stats.drivesSelected': 1 } });
  } else if (prevStatus === 'selected' && overallStatus !== 'selected' && application.student) {
    await Student.findByIdAndUpdate(application.student._id, { $inc: { 'stats.drivesSelected': -1 } });
  }

  await AuditLog.create({
    user: req.user._id, action: 'APPLICATION_STATUS_UPDATED',
    entity: 'Application', entityId: application._id,
    details: {
      studentId: application.student?._id,
      companyName: application.drive?.companyName,
      oldStatus: prevStatus,
      newStatus: overallStatus,
    },
    ip: req.ip,
  });

  // Create real-time student notification
  if (application.student) {
    try {
      const company = application.drive?.companyName || 'Placement Drive';
      let notifTitle = `Application Status Update: ${company}`;
      let notifMsg = `Your application status for ${company} is now ${overallStatus.toUpperCase().replace('_', ' ')}.`;
      let cat = 'reminder';

      if (overallStatus === 'shortlisted') {
        notifTitle = `🎉 Congratulations! Shortlisted for ${company}`;
        notifMsg = `Congratulations! You have been shortlisted for the next round of ${company}. Please check the drive page for schedule details.`;
        cat = 'round_shortlist';
      } else if (overallStatus === 'selected') {
        notifTitle = `🏆 Congratulations! Selected for ${company}`;
        notifMsg = `Hearty congratulations! You have been selected for ${company}. Check your student portal and email for official offer details.`;
        cat = 'round_shortlist';
      } else if (overallStatus === 'rejected' || overallStatus === 'not_shortlisted') {
        notifTitle = `Application Update: ${company}`;
        notifMsg = `Thank you for participating in the ${company} recruitment process. Unfortunately, you were not shortlisted for the subsequent round.`;
        cat = 'reminder';
      }

      await Notification.create({
        student: application.student._id,
        user: application.student.user,
        title: notifTitle,
        message: notifMsg,
        sender: 'Placement Cell',
        category: cat,
        drive: application.drive?._id,
        isRead: false,
      });
    } catch (e) {
      console.error('Failed to create status change notification:', e);
    }
  }

  res.status(200).json(new ApiResponse(200, application, `Application status updated to ${overallStatus}`));
});

// POST /api/coordinator/applications/bulk-status
exports.bulkUpdateApplications = asyncHandler(async (req, res, next) => {
  const { applicationIds, overallStatus } = req.body;

  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    return next(new ApiError(400, 'applicationIds array is required'));
  }

  const validStatuses = ['registered', 'shortlisted', 'in_progress', 'selected', 'rejected', 'not_shortlisted'];
  if (!overallStatus || !validStatuses.includes(overallStatus)) {
    return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
  }

  const result = await Application.updateMany(
    { _id: { $in: applicationIds } },
    { $set: { overallStatus } }
  );

  await AuditLog.create({
    user: req.user._id, action: 'BULK_APPLICATIONS_UPDATED',
    entity: 'Application',
    details: { count: applicationIds.length, newStatus: overallStatus },
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, { modifiedCount: result.modifiedCount }, `Updated ${result.modifiedCount} applications to ${overallStatus}`)
  );
});

// GET /api/coordinator/auditlogs Section
exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { entity, action, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (entity) filter.entity = entity;
  if (action) filter.action = action;

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  );
});

