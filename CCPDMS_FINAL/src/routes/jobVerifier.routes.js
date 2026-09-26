'use strict';
const express = require('express');
const router  = express.Router();
const jobVerifierCtrl = require('../controllers/jobVerifier.controller');
const { protect }     = require('../middleware/auth.middleware');
const { authorize }   = require('../middleware/role.middleware');
// ── Company Reviews (Open to search) ─────────────────────────────────────────
// GET /api/student/job-verifier/company-reviews
router.get('/company-reviews', jobVerifierCtrl.getCompanyReviews);

// Protected routes
router.use(protect);

// ── Check Job Authenticity ───────────────────────────────────────────────────
// POST /api/student/job-verifier/check
router.post('/check', jobVerifierCtrl.checkJobAuthenticity);

// ── Verification History ─────────────────────────────────────────────────────
// GET /api/student/job-verifier/history
router.get('/history', jobVerifierCtrl.getVerificationHistory);

module.exports = router;