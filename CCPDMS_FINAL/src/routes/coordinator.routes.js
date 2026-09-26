const express = require('express');
const router  = express.Router();
const coordCtrl    = require('../controllers/coordinator.controller');
const { protect }  = require('../middleware/auth.middleware');
const { authorize }= require('../middleware/role.middleware');
// All coordinator routes require coordinator role
router.use(protect, authorize('coordinator'));
// Dashboard — batch-wise pie chart data
router.get('/dashboard', coordCtrl.getDashboard);
// Detailed placement stats for a batch
router.get('/placement-stats/:batch', coordCtrl.getPlacementStats);
// Student list with filters (CGPA, batch, branch, backlogs)
router.get('/students', coordCtrl.getStudentList);
// Single student full profile
router.get('/students/:studentId', coordCtrl.getStudentDetail);
// Applications Management
router.get('/applications', coordCtrl.getAllApplications);
router.patch('/applications/:id/status', coordCtrl.updateApplicationStatus);
router.post('/applications/bulk-status', coordCtrl.bulkUpdateApplications);
// Bulk notification email & history
router.post('/notify', coordCtrl.sendNotification);
router.get('/notifications/history', coordCtrl.getNotificationHistory);
router.get('/audience-count', coordCtrl.getAudienceCount);
// Audit logs
router.get('/audit-logs', coordCtrl.getAuditLogs);
module.exports = router;