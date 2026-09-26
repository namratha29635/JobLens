const Student = require('../models/Student');
const Application = require('../models/Application');
const OnCampusDrive = require('../models/OnCampusDrive');
const OffCampusDrive = require('../models/OffCampusDrive');
const Notification = require('../models/Notification');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { extractTextFromFile, parseResumeText } = require('../services/resumeParser.service');
// PROFILE
// GET /api/student/profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate('user', 'email role lastLogin isActive');
  if (!student) return next(new ApiError(404, 'Student profile not found'));
  res.status(200).json(new ApiResponse(200, student));
});
// PATCH /api/student/profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // Only these fields are student-editable
  const EDITABLE = [
    'personalEmail', 'contact', 'address',
    'skills', 'projects', 'internships',
    'certifications', 'academicAchievements',
    'codingProfiles', 'profileSummary', 'education',
  ];
  const updates = {};
  EDITABLE.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  if (!Object.keys(updates).length)
    return next(new ApiError(400, 'No valid fields provided for update'));

  // Sanitize education fields if provided
  if (updates.education) {
    const cleanEntry = (entry) => {
      if (!entry || typeof entry !== 'object') return {};
      const res = {};
      if (entry.institutionName !== undefined) res.institutionName = String(entry.institutionName || '').trim();
      
      const p = (entry.percentage !== '' && entry.percentage !== null && entry.percentage !== undefined) ? Number(entry.percentage) : null;
      res.percentage = (p !== null && !isNaN(p)) ? p : null;

      const c = (entry.cgpa !== '' && entry.cgpa !== null && entry.cgpa !== undefined) ? Number(entry.cgpa) : null;
      res.cgpa = (c !== null && !isNaN(c)) ? c : null;

      const y = (entry.yearOfCompletion !== '' && entry.yearOfCompletion !== null && entry.yearOfCompletion !== undefined) ? Number(entry.yearOfCompletion) : null;
      res.yearOfCompletion = (y !== null && !isNaN(y)) ? y : null;

      return res;
    };

    const currentStudent = await Student.findOne({ user: req.user._id });
    if (!currentStudent) return next(new ApiError(404, 'Student profile not found'));

    const currentEdu = currentStudent.education || {};
    const sanitizedEdu = {
      btech: updates.education.btech ? cleanEntry(updates.education.btech) : currentEdu.btech,
      intermediate: updates.education.intermediate ? cleanEntry(updates.education.intermediate) : currentEdu.intermediate,
      secondary: updates.education.secondary ? cleanEntry(updates.education.secondary) : currentEdu.secondary,
    };
    updates.education = sanitizedEdu;

    if (sanitizedEdu.btech?.cgpa !== null && sanitizedEdu.btech?.cgpa !== undefined && sanitizedEdu.btech.cgpa > 0) {
      updates.cgpa = sanitizedEdu.btech.cgpa;
    }
    if (sanitizedEdu.btech?.yearOfCompletion !== null && sanitizedEdu.btech?.yearOfCompletion !== undefined && sanitizedEdu.btech.yearOfCompletion > 2000) {
      updates.passedOutYear = sanitizedEdu.btech.yearOfCompletion;
    }
  }

  // Sanitize skills if provided
  if (updates.skills !== undefined) {
    if (Array.isArray(updates.skills)) {
      updates.skills = [...new Set(updates.skills.map(s => String(s).trim()).filter(Boolean))];
    } else if (typeof updates.skills === 'string') {
      updates.skills = [...new Set(updates.skills.split(',').map(s => s.trim()).filter(Boolean))];
    }
  }

  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!student) return next(new ApiError(404, 'Student profile not found'));
  res.status(200).json(new ApiResponse(200, student, 'Profile updated successfully'));
});
// RESUME
// POST /api/student/resume
exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'Resume file (PDF) is required'));
  const resumeUrl = `/uploads/resumes/${req.file.filename}`;
  const filePath = req.file.path;

  // 1. Parse text from the uploaded resume
  let parsedDetails = {};
  try {
    const rawText = await extractTextFromFile(filePath);
    parsedDetails = parseResumeText(rawText);
  } catch (err) {
    console.error('[uploadResume] Parsing error:', err.message);
  }

  // 2. Fetch current student profile
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return next(new ApiError(404, 'Student profile not found'));

  // Update resume metadata
  student.resume = {
    url: resumeUrl,
    uploadedAt: new Date(),
  };
  student.lastResumeReminderSent = new Date();

  // 3. Auto-populate profile fields from parsed resume
  // Skills
  if (parsedDetails.skills && parsedDetails.skills.length > 0) {
    const combined = new Set([...(student.skills || []), ...parsedDetails.skills]);
    student.skills = Array.from(combined);
  }

  // Education
  if (parsedDetails.education) {
    if (!student.education) student.education = {};

    const btechParsed = parsedDetails.education.btech || {};
    student.education.btech = {
      institutionName: btechParsed.institutionName || student.education.btech?.institutionName || '',
      cgpa: btechParsed.cgpa || student.education.btech?.cgpa || student.cgpa,
      percentage: btechParsed.percentage || student.education.btech?.percentage || null,
      yearOfCompletion: btechParsed.yearOfCompletion || student.education.btech?.yearOfCompletion || student.passedOutYear,
    };
    if (btechParsed.cgpa) {
      student.cgpa = btechParsed.cgpa;
    }
    if (btechParsed.yearOfCompletion) {
      student.passedOutYear = btechParsed.yearOfCompletion;
    }

    const interParsed = parsedDetails.education.intermediate || {};
    student.education.intermediate = {
      institutionName: interParsed.institutionName || student.education.intermediate?.institutionName || '',
      percentage: interParsed.percentage || student.education.intermediate?.percentage || null,
      cgpa: interParsed.cgpa || student.education.intermediate?.cgpa || null,
      yearOfCompletion: interParsed.yearOfCompletion || student.education.intermediate?.yearOfCompletion || null,
    };

    const secParsed = parsedDetails.education.secondary || {};
    student.education.secondary = {
      institutionName: secParsed.institutionName || student.education.secondary?.institutionName || '',
      percentage: secParsed.percentage || student.education.secondary?.percentage || null,
      cgpa: secParsed.cgpa || student.education.secondary?.cgpa || null,
      yearOfCompletion: secParsed.yearOfCompletion || student.education.secondary?.yearOfCompletion || null,
    };
  }

  // Projects
  if (parsedDetails.projects && parsedDetails.projects.length > 0) {
    // If student currently has no projects, or parsed projects are richer, update
    if (!student.projects || student.projects.length === 0) {
      student.projects = parsedDetails.projects;
    } else {
      // Append new projects
      const existingTitles = new Set(student.projects.map(p => p.title.toLowerCase()));
      parsedDetails.projects.forEach(p => {
        if (!existingTitles.has(p.title.toLowerCase())) {
          student.projects.push(p);
        }
      });
    }
  }

  // Internships / Professional Experience
  if (parsedDetails.internships && parsedDetails.internships.length > 0) {
    if (!student.internships || student.internships.length === 0) {
      student.internships = parsedDetails.internships;
    } else {
      const existingComps = new Set(student.internships.map(i => i.company.toLowerCase()));
      parsedDetails.internships.forEach(i => {
        if (!existingComps.has(i.company.toLowerCase())) {
          student.internships.push(i);
        }
      });
    }
  }

  // Certifications
  if (parsedDetails.certifications && parsedDetails.certifications.length > 0) {
    const existingCerts = new Set(student.certifications || []);
    parsedDetails.certifications.forEach(c => existingCerts.add(c));
    student.certifications = Array.from(existingCerts);
  }

  // Coding Profiles
  if (parsedDetails.codingProfiles) {
    student.codingProfiles = {
      github: parsedDetails.codingProfiles.github || student.codingProfiles?.github || '',
      leetcode: parsedDetails.codingProfiles.leetcode || student.codingProfiles?.leetcode || '',
      hackerrank: parsedDetails.codingProfiles.hackerrank || student.codingProfiles?.hackerrank || '',
      others: student.codingProfiles?.others || [],
    };
  }

  // Summary
  if (parsedDetails.profileSummary && (!student.profileSummary || student.profileSummary.length < 20)) {
    student.profileSummary = parsedDetails.profileSummary;
  }

  // Contact & Personal Email
  if (parsedDetails.contact && !student.contact) {
    student.contact = parsedDetails.contact;
  }
  if (parsedDetails.personalEmail && !student.personalEmail) {
    student.personalEmail = parsedDetails.personalEmail;
  }

  await student.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        resumeUrl,
        uploadedAt: student.resume.uploadedAt,
        parsedDetails,
        student,
      },
      'Resume uploaded and profile details auto-populated successfully!'
    )
  );
});
// DASHBOARD — statistics + drive history
// GET /api/student/dashboard
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id })
    .select('name rollNumber branch passedOutYear cgpa activeBacklogs stats resume');
  if (!student) return next(new ApiError(404, 'Student profile not found'));
  const applications = await Application.find({ student: student._id })
    .populate('drive', 'companyName minPackage maxPackage status isFrozen selectionRatio')
    .sort({ appliedAt: -1 });
  // Status breakdown for pie/bar charts on frontend
  const statusBreakdown = {
    registered: 0, shortlisted: 0, in_progress: 0,
    selected: 0, rejected: 0, not_shortlisted: 0,
  };
  const driveHistory = applications.map((app) => {
    if (statusBreakdown[app.overallStatus] !== undefined) {
      statusBreakdown[app.overallStatus]++;
    }
    return {
      applicationId: app._id,
      driveId: app.drive?._id,
      companyName: app.drive?.companyName,
      overallStatus: app.overallStatus,
      eliminatedAtRound: app.eliminatedAtRound,
      roundStatuses: app.roundStatuses,
      appliedAt: app.appliedAt,
      feedbackPending:
        !app.feedbackSubmitted &&
        ['selected', 'rejected', 'not_shortlisted'].includes(app.overallStatus),
    };
  });
  res.status(200).json(
    new ApiResponse(200, {
      student: {
        name: student.name, rollNumber: student.rollNumber,
        branch: student.branch, passedOutYear: student.passedOutYear,
        cgpa: student.cgpa, activeBacklogs: student.activeBacklogs,
        hasResume: !!student.resume?.url,
      },
      stats: student.stats,
      statusBreakdown,
      driveHistory,
      totalApplications: applications.length,
    })
  );
});
// ON-CAMPUS DRIVE VISIBILITY (Active + Past)
// GET /api/student/drives/oncampus
// Implements full SRS FR-13 logic:
//  • Drives where batch/branch doesn't match → excluded entirely
//  • CGPA < cutoff OR backlogs > allowed → Past Drives ("Not eligible")
//  • Eligible + not applied → Active Drives (registration open)
//  • overallStatus: registered / shortlisted / in_progress → Active Drives
//  • overallStatus: not_shortlisted / rejected / selected → Past Drives
exports.getOnCampusDrives = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return next(new ApiError(404, 'Student profile not found'));

  const { college } = req.query;
  const filter = {
    eligibleBatches: student.passedOutYear,
    eligibleBranches: student.branch,
  };

  if (college && college !== 'All Colleges' && college !== 'all') {
    filter.$or = [
      { collegeName: new RegExp(college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { collegeName: 'All Colleges' },
      { collegeName: { $exists: false } },
    ];
  }

  // Only drives targeting this student's batch AND branch
  const drives = await OnCampusDrive.find(filter)
    .populate({
      path: 'rounds',
      select: 'roundNumber roundName date venue description isFinalRound eligibleList attendedList qualifiedList eligibleEmailSent resultEmailSent',
    })
    .sort({ createdAt: -1 });
  const activeDrives = [];
  const pastDrives = [];
  for (const drive of drives) {
    const application = await Application.findOne({
      student: student._id,
      drive: drive._id,
    });
    const meetsEligibility =
      student.cgpa >= (drive.cgpaCutOff ?? 0) &&
      student.activeBacklogs <= (drive.backlogsAllowed ?? 999);

    const driveObj = drive.toObject();
    driveObj.applicationId = application?._id || null;
    driveObj.overallStatus = application?.overallStatus || null;
    driveObj.roundStatuses = application?.roundStatuses || [];
    driveObj.eliminatedAtRound = application?.eliminatedAtRound || null;
    driveObj.feedbackSubmitted = application?.feedbackSubmitted || false;
    driveObj.feedbackPending =
      application &&
      !application.feedbackSubmitted &&
      ['selected', 'rejected', 'not_shortlisted'].includes(application?.overallStatus);
    if (!meetsEligibility) {
      // Fails CGPA or backlog criteria → Past Drives
      driveObj.visibilityReason = 'Not eligible — CGPA or active backlogs criteria not met';
      pastDrives.push(driveObj);
      continue;
    }
    if (!application) {
      // Eligible, not yet applied → Active (registration open card)
      driveObj.visibilityReason = 'Registration open';
      activeDrives.push(driveObj);
      continue;
    }
    switch (application.overallStatus) {
      case 'registered':
        driveObj.visibilityReason = 'Registered — awaiting Round 1 shortlist';
        activeDrives.push(driveObj);
        break;
      case 'shortlisted':
        driveObj.visibilityReason = 'Shortlisted for Round 1';
        activeDrives.push(driveObj);
        break;
      case 'in_progress':
        driveObj.visibilityReason = `Round ${application.roundStatuses.length} cleared — next round pending`;
        activeDrives.push(driveObj);
        break;
      case 'not_shortlisted':
        driveObj.visibilityReason = 'Not shortlisted for Round 1';
        pastDrives.push(driveObj);
        break;
      case 'rejected':
        driveObj.visibilityReason = `Not qualified in Round ${application.eliminatedAtRound}`;
        pastDrives.push(driveObj);
        break;
      case 'selected':
        driveObj.visibilityReason = 'SELECTED';
        driveObj.isSelected = true;
        pastDrives.push(driveObj);
        break;
      default:
        pastDrives.push(driveObj);
    }
  }
  res.status(200).json(new ApiResponse(200, { activeDrives, pastDrives }));
});
// APPLY TO DRIVE
// POST /api/student/drives/oncampus/:driveId/apply
exports.applyToDrive = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return next(new ApiError(404, 'Student profile not found'));
  // Resume is mandatory before applying
  if (!student.resume?.url)
    return next(new ApiError(400, 'Please upload your resume before applying to any drive'));
  const drive = await OnCampusDrive.findById(req.params.driveId);
  if (!drive) return next(new ApiError(404, 'On-campus drive not found'));
  if (drive.isFrozen || drive.status === 'frozen')
    return next(new ApiError(400, 'Registration is closed — drive results have been declared'));
  if (drive.registrationDeadline && new Date() > new Date(drive.registrationDeadline))
    return next(new ApiError(400, 'Registration deadline has passed for this drive'));
  // Batch / branch check
  if (!drive.eligibleBatches.includes(student.passedOutYear))
    return next(new ApiError(403, `Your batch (${student.passedOutYear}) is not eligible for this drive`));
  if (!drive.eligibleBranches.includes(student.branch))
    return next(new ApiError(403, `Your branch (${student.branch}) is not eligible for this drive`));
  // CGPA check
  if (student.cgpa < (drive.cgpaCutOff ?? 0))
    return next(new ApiError(403, `Your CGPA (${student.cgpa}) is below the required cutoff (${drive.cgpaCutOff})`));
  // Backlog check
  if (student.activeBacklogs > (drive.backlogsAllowed ?? 999))
    return next(new ApiError(403, `Your active backlogs (${student.activeBacklogs}) exceed the allowed limit (${drive.backlogsAllowed})`));
  // Duplicate application guard (also enforced by DB index)
  const existing = await Application.findOne({ student: student._id, drive: drive._id });
  if (existing) return next(new ApiError(409, 'You have already applied to this drive'));
  const application = await Application.create({
    student: student._id,
    drive: drive._id,
    overallStatus: 'registered',
    resumeSnapshot: student.resume.url,
    appliedAt: new Date(),
  });
  await Student.findByIdAndUpdate(student._id, { $inc: { 'stats.drivesApplied': 1 } });
  res.status(201).json(
    new ApiResponse(201, application, `Successfully applied to ${drive.companyName}`)
  );
});
// APPLICATION STATUS for a specific drive
// GET /api/student/drives/oncampus/:driveId/status
exports.getApplicationStatus = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id }).select('_id');
  if (!student) return next(new ApiError(404, 'Student profile not found'));
  const application = await Application.findOne({
    student: student._id,
    drive: req.params.driveId,
  })
    .populate('drive', 'companyName minPackage maxPackage status isFrozen selectionRatio description')
    .populate('roundStatuses.round', 'roundName roundNumber date venue description');
  if (!application)
    return next(new ApiError(404, 'No application found for this drive'));
  res.status(200).json(new ApiResponse(200, application));
});
// OFF-CAMPUS DRIVES (student feed with resume matching)
// GET /api/student/drives/offcampus?category=&matchResume=true&page=&limit=
exports.getOffCampusFeed = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id }).select('passedOutYear branch skills cgpa');
  if (!student) return next(new ApiError(404, 'Student profile not found'));

  const { category, page = 1, limit = 20, matchResume } = req.query;
  const filter = {
    eligibleBatches: student.passedOutYear,
    eligibleBranches: student.branch,
  };
  if (category) filter.driveCategory = category;

  const studentSkills = (student.skills || []).map(s => s.trim());
  const studentSkillsLower = studentSkills.map(s => s.toLowerCase());

  let dbDrives = await OffCampusDrive.find(filter).sort({ publishedAt: -1 }).lean();

  const curatedDrives = [
    {
      _id: 'job_goog_01',
      companyName: 'Google',
      driveName: 'Software Engineering Graduate (2026 Batch)',
      driveCategory: 'job',
      description: 'Design and build large-scale distributed systems using C++, Java, Python, and cloud infrastructure. Work on Search, Android, and Cloud.',
      applyLink: 'https://careers.google.com/jobs/results/?q=software%20engineer',
      lastDateToApply: new Date(Date.now() + 45 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '28 - 45 LPA',
    },
    {
      _id: 'job_msft_02',
      companyName: 'Microsoft',
      driveName: 'Software Engineer - Azure Cloud & AI',
      driveCategory: 'job',
      description: 'Develop next-generation cloud architectures, microservices, and AI integrations using C#, TypeScript, Python, React, and Azure.',
      applyLink: 'https://careers.microsoft.com/us/en/search-results?keywords=software%20engineer',
      lastDateToApply: new Date(Date.now() + 40 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '24 - 42 LPA',
    },
    {
      _id: 'job_amzn_03',
      companyName: 'Amazon',
      driveName: 'Software Development Engineer - SDE 1',
      driveCategory: 'job',
      description: 'Architect resilient backend services and e-commerce scale architectures using Java, Python, AWS, Docker, and distributed algorithms.',
      applyLink: 'https://www.amazon.jobs/en/job_categories/software-development',
      lastDateToApply: new Date(Date.now() + 35 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'AIDS', 'AIML', 'DS'],
      salary: '22 - 38 LPA',
    },
    {
      _id: 'job_tcs_04',
      companyName: 'TCS',
      driveName: 'TCS Digital & Prime Hiring Drive',
      driveCategory: 'job',
      description: 'Enterprise full stack and cloud development hiring across Java, Python, Spring Boot, React, SQL, and Data Analytics.',
      applyLink: 'https://www.tcs.com/careers',
      lastDateToApply: new Date(Date.now() + 25 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027, 2028],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'DS'],
      salary: '7 - 11.5 LPA',
    },
    {
      _id: 'job_infy_05',
      companyName: 'Infosys',
      driveName: 'Specialist Programmer (SP) & Digital Specialist (DSE)',
      driveCategory: 'job',
      description: 'High-impact coding roles focused on Data Structures, Python, Java, Algorithms, System Design, and Full Stack Web development.',
      applyLink: 'https://www.infosys.com/careers.html',
      lastDateToApply: new Date(Date.now() + 30 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'AIDS', 'AIML', 'DS'],
      salary: '9.5 - 12 LPA',
    },
    {
      _id: 'job_acc_06',
      companyName: 'Accenture',
      driveName: 'Advanced Application Engineering Analyst',
      driveCategory: 'job',
      description: 'Build enterprise web platforms and microservices with JavaScript, React, Node.js, SQL, Java, and Cloud platforms.',
      applyLink: 'https://www.accenture.com/in-en/careers',
      lastDateToApply: new Date(Date.now() + 28 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'DS'],
      salary: '6.5 - 10 LPA',
    },
    {
      _id: 'job_zoho_07',
      companyName: 'Zoho Corporation',
      driveName: 'Software Developer - Web & Product Development',
      driveCategory: 'job',
      description: 'Hands-on product development using Java, C++, JavaScript, React, SQL, HTML/CSS, and proprietary database architectures.',
      applyLink: 'https://www.zoho.com/careers/',
      lastDateToApply: new Date(Date.now() + 50 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027, 2028],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'DS'],
      salary: '8.5 - 15 LPA',
    },
    {
      _id: 'job_flip_08',
      companyName: 'Flipkart',
      driveName: 'Associate Software Development Engineer',
      driveCategory: 'job',
      description: 'High-throughput e-commerce systems, order pipelines, and responsive frontend applications using React, Node.js, Java, and Kafka.',
      applyLink: 'https://www.flipkartcareers.com/',
      lastDateToApply: new Date(Date.now() + 32 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '18 - 32 LPA',
    },
    {
      _id: 'job_swig_09',
      companyName: 'Swiggy',
      driveName: 'Full Stack Engineer - Consumer Apps',
      driveCategory: 'job',
      description: 'Build hyper-local delivery apps using React, React Native, Node.js, Go, Python, MongoDB, and Redis caching architectures.',
      applyLink: 'https://careers.swiggy.com/',
      lastDateToApply: new Date(Date.now() + 38 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '16 - 28 LPA',
    },
    {
      _id: 'job_nvda_10',
      companyName: 'NVIDIA',
      driveName: 'AI / Deep Learning Software Engineer',
      driveCategory: 'job',
      description: 'Accelerated computing, CUDA, GPU algorithms, Machine Learning, PyTorch, TensorFlow, Python, and C++ optimization.',
      applyLink: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
      lastDateToApply: new Date(Date.now() + 45 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '22 - 40 LPA',
    },
    {
      _id: 'job_ora_11',
      companyName: 'Oracle',
      driveName: 'Cloud Infrastructure & Database Engineer',
      driveCategory: 'job',
      description: 'Next-gen cloud database engines, SQL, Java, Linux, Python, and distributed cloud computing services.',
      applyLink: 'https://www.oracle.com/careers/',
      lastDateToApply: new Date(Date.now() + 36 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'AIDS', 'AIML', 'DS'],
      salary: '14 - 24 LPA',
    },
    {
      _id: 'job_cis_12',
      companyName: 'Cisco Systems',
      driveName: 'Software Engineer - Networking & Cybersecurity',
      driveCategory: 'job',
      description: 'Network protocols, secure socket programming, Python, C++, Linux, Docker, and enterprise cloud security.',
      applyLink: 'https://jobs.cisco.com/',
      lastDateToApply: new Date(Date.now() + 42 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'AIDS', 'AIML', 'DS'],
      salary: '15 - 26 LPA',
    },
    {
      _id: 'job_wip_13',
      companyName: 'Wipro',
      driveName: 'Wipro Elite & Turbo National Talent Hunt',
      driveCategory: 'job',
      description: 'Developer positions across Full Stack Web Development (React/Node), Java, Python, Cloud, and Software Testing.',
      applyLink: 'https://careers.wipro.com/',
      lastDateToApply: new Date(Date.now() + 20 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027, 2028],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'DS'],
      salary: '6.5 - 9.5 LPA',
    },
    {
      _id: 'job_cog_14',
      companyName: 'Cognizant',
      driveName: 'GenC Next - Digital & Full Stack Developer',
      driveCategory: 'job',
      description: 'Digital engineering roles in React, JavaScript, Java, Spring Boot, Python, SQL, and AWS Cloud technologies.',
      applyLink: 'https://careers.cognizant.com/in/en',
      lastDateToApply: new Date(Date.now() + 22 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'AIDS', 'AIML', 'DS'],
      salary: '7 - 10 LPA',
    },
    {
      _id: 'job_del_15',
      companyName: 'Deloitte',
      driveName: 'Analyst - Technology & Data Engineering',
      driveCategory: 'job',
      description: 'Data analytics, SQL queries, Python data analysis, Power BI, cloud integration, and business technology consulting.',
      applyLink: 'https://www2.deloitte.com/in/en/careers.html',
      lastDateToApply: new Date(Date.now() + 34 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'DS'],
      salary: '8 - 14 LPA',
    },
    {
      _id: 'job_adbe_16',
      companyName: 'Adobe',
      driveName: 'Member of Technical Staff - Creative Cloud',
      driveCategory: 'job',
      description: 'Web & desktop graphics rendering, C++, JavaScript, WebAssembly, React, algorithms, and UI engineering.',
      applyLink: 'https://www.adobe.com/careers.html',
      lastDateToApply: new Date(Date.now() + 48 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '22 - 36 LPA',
    },
    {
      _id: 'job_sfdc_17',
      companyName: 'Salesforce',
      driveName: 'Associate Software Engineer - Platform & APIs',
      driveCategory: 'job',
      description: 'Enterprise SaaS architecture, Java, Python, React, REST APIs, microservices, and database performance optimization.',
      applyLink: 'https://www.salesforce.com/company/careers/',
      lastDateToApply: new Date(Date.now() + 44 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '20 - 34 LPA',
    },
    {
      _id: 'job_uber_18',
      companyName: 'Uber',
      driveName: 'Software Engineer - Mobility & Maps Platform',
      driveCategory: 'job',
      description: 'Real-time routing, distributed systems, Golang, Java, Python, Kafka, Docker, and geospatial algorithms.',
      applyLink: 'https://www.uber.com/in/en/careers/',
      lastDateToApply: new Date(Date.now() + 39 * 86400000),
      isVerified: true,
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
      salary: '26 - 48 LPA',
    },
  ];

  // Merge database drives with curated drives ensuring uniqueness by companyName + driveName
  const existingKeys = new Set(dbDrives.map(d => `${(d.companyName||'').toLowerCase()}_${(d.driveName||'').toLowerCase()}`));
  const combinedDrives = [...dbDrives];
  for (const cd of curatedDrives) {
    const key = `${cd.companyName.toLowerCase()}_${cd.driveName.toLowerCase()}`;
    if (!existingKeys.has(key)) {
      combinedDrives.push(cd);
      existingKeys.add(key);
    }
  }

  // Calculate resume match for each drive
  let drives = combinedDrives.map((drive) => {
    const textToMatch = `${drive.companyName || ''} ${drive.driveName || ''} ${drive.description || ''}`.toLowerCase();
    
    // Find matching skills
    const matched = [];
    const missing = [];

    studentSkills.forEach((skill) => {
      const lower = skill.toLowerCase();
      if (textToMatch.includes(lower)) {
        matched.push(skill);
      }
    });

    // Score based on skills and criteria
    let score = 55; // baseline for branch/batch eligibility
    if (studentSkills.length > 0) {
      const matchedRatio = matched.length / Math.min(3, studentSkills.length);
      score = Math.min(98, Math.round(55 + matchedRatio * 43));
    }
    if (matched.length >= 3) score = Math.max(88, score);
    else if (matched.length >= 1) score = Math.max(72, score);

    return {
      ...drive,
      resumeMatchScore: score,
      matchedSkills: matched.slice(0, 6),
      matchLevel: score >= 75 ? 'HIGH MATCH' : score >= 60 ? 'GOOD MATCH' : 'ELIGIBLE',
    };
  });

  // If matchResume requested, sort by match score descending
  if (matchResume === 'true' || matchResume === true || !category) {
    drives.sort((a, b) => b.resumeMatchScore - a.resumeMatchScore);
  }

  res.status(200).json(
    new ApiResponse(200, {
      drives,
      studentSkills,
      pagination: {
        total: drives.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(drives.length / Number(limit)) || 1,
      },
    })
  );
});

// AI JOB-SEARCH LINK GENERATOR (FR-21)
// POST /api/student/job-links
exports.generateJobLinks = asyncHandler(async (req, res) => {
  const {
    role = '',
    location = '',
    experience = '0',
  } = req.body;
  const encodedRole = encodeURIComponent(role.trim());
  const encodedLocation = encodeURIComponent(location.trim());
  const slugRole = role.trim().toLowerCase().replace(/\s+/g, '-');
  const slugLoc = location.trim().toLowerCase().replace(/\s+/g, '-');
  const links = {
    linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedRole}&location=${encodedLocation}`,
    naukri: `https://www.naukri.com/${slugRole}-jobs-in-${slugLoc || 'india'}`,
    unstop: `https://unstop.com/jobs?search=${encodedRole}`,
    indeed: `https://in.indeed.com/jobs?q=${encodedRole}&l=${encodedLocation}`,
    internshala: `https://internshala.com/internships/${slugRole}-internship`,
    glassdoor: `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${encodedRole}&locKeyword=${encodedLocation}`,
    wellfound: `https://wellfound.com/jobs?query=${encodedRole}`,
    hirist: `https://www.hirist.tech/j/${slugRole}-jobs`,
  };
  res.status(200).json(
    new ApiResponse(200, { role, location, experience, links }, 'Job search links generated')
  );
});

// AI RESUME–JOB MATCH & ATS ANALYZER
// POST /api/student/resume-match
exports.resumeMatch = asyncHandler(async (req, res, next) => {
  const { jobDescription } = req.body;
  const student = await Student.findOne({ user: req.user._id })
    .select('skills certifications internships projects profileSummary resume branch cgpa');
  if (!student) return next(new ApiError(404, 'Student profile not found'));
  if (!jobDescription)
    return next(new ApiError(400, 'jobDescription is required'));

  const studentSkills = student.skills || [];
  const jdText = jobDescription.toLowerCase();

  // Extract skills from JD using catalog
  const { SKILLS_CATALOG } = require('../services/resumeParser.service');
  const matched = [];
  const missing = [];

  studentSkills.forEach((s) => {
    if (jdText.includes(s.toLowerCase())) {
      matched.push(s);
    } else {
      missing.push(s);
    }
  });

  // Also check if any common in-demand JD skills are missing from student's profile
  const commonTech = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS', 'Data Structures', 'REST API', 'Java', 'MongoDB'];
  const missingFromStudent = [];
  commonTech.forEach((t) => {
    if (jdText.includes(t.toLowerCase()) && !studentSkills.some(s => s.toLowerCase() === t.toLowerCase())) {
      missingFromStudent.push(t);
    }
  });

  // Calculate ATS Fit Score (0-100)
  const baseRatio = studentSkills.length > 0 ? (matched.length / Math.max(1, matched.length + missingFromStudent.length)) : 0.4;
  let fitScore = Math.min(95, Math.max(25, Math.round(baseRatio * 100)));
  if (student.projects && student.projects.length >= 2) fitScore = Math.min(98, fitScore + 8);
  if (student.internships && student.internships.length >= 1) fitScore = Math.min(98, fitScore + 7);

  // Generate ATS keywords, strengths, gaps, preparation plan
  const strengths = [
    matched.length > 0 ? `Strong alignment on core tech: ${matched.slice(0, 4).join(', ')}` : 'Relevant engineering branch foundation',
    student.projects?.length > 0 ? `Portfolio contains ${student.projects.length} academic/practical projects` : 'Foundation coursework aligned with technology fundamentals',
    student.cgpa >= 8.0 ? `Strong academic standing (${student.cgpa} CGPA)` : 'Eligible academic background',
  ];

  const gaps = [
    missingFromStudent.length > 0
      ? `Job description prioritizes: ${missingFromStudent.slice(0, 3).join(', ')} which are not prominent on your profile`
      : 'Include more quantitative outcomes and metrics in project descriptions',
    'Review behavioral and company-specific architecture patterns before technical rounds',
  ];

  const preparationPlan = [
    missingFromStudent.length > 0
      ? `Brush up on ${missingFromStudent[0]} fundamentals and build a mini proof-of-concept project`
      : 'Review data structures & algorithm complexities (Time & Space)',
    'Tailor resume bullet points with action verbs (Architected, Deployed, Reduced)',
    'Practice 5 mock coding problems directly related to this role on LeetCode/HackerRank',
    'Prepare 2 STAR-method stories discussing challenges solved in your projects',
  ];

  const summary = `Your profile shows a ${fitScore}% match for this position. You have confirmed skills in ${matched.slice(0, 3).join(', ') || 'foundational engineering'}, and addressing ${missingFromStudent[0] || 'advanced system design'} will elevate your interview shortlisting chances.`;

  res.status(200).json(
    new ApiResponse(200, {
      fitScore,
      jobFitScore: fitScore,
      matchedSkills: matched,
      missingSkills: missingFromStudent.length > 0 ? missingFromStudent : missing.slice(0, 4),
      missingInJD: missing,
      strengths,
      gaps,
      atsKeywords: [...new Set([...matched, ...missingFromStudent])],
      preparationPlan,
      summary,
      suggestion: `Your profile matches ${fitScore}% of the job description. Focus on: ${missingFromStudent.slice(0, 3).join(', ') || 'All major skills are covered'}.`,
    })
  );
});

// NOTIFICATIONS
// GET /api/student/notifications
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });
  
  // Find notifications by student id or user id or broadcast
  const query = {
    $or: [
      { user: req.user._id },
      ...(student ? [{ student: student._id }] : [])
    ]
  };

  const notifications = await Notification.find(query)
    .populate('drive', 'companyName jobTitle driveType')
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
    })
  );
});

// PATCH /api/student/notifications/:id/read
exports.markNotificationRead = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });
  
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      $or: [
        { user: req.user._id },
        ...(student ? [{ student: student._id }] : [])
      ]
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new ApiError(404, 'Notification not found'));
  }

  res.status(200).json(new ApiResponse(200, notification, 'Marked as read'));
});

// PATCH /api/student/notifications/read-all
exports.markAllNotificationsRead = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });
  
  const query = {
    $or: [
      { user: req.user._id },
      ...(student ? [{ student: student._id }] : [])
    ]
  };

  await Notification.updateMany(query, { isRead: true });

  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

// DELETE /api/student/notifications/:id
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });
  
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    $or: [
      { user: req.user._id },
      ...(student ? [{ student: student._id }] : [])
    ]
  });

  if (!notification) {
    return next(new ApiError(404, 'Notification not found'));
  }

  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});
