// HealthCare/backend/routes/auditLogRoutes.js

const express = require('express');
const router = express.Router();
const {
    createAuditLog,
    getAllAuditLogs
} = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/auditlogs
// @desc    Create a new audit log entry
// @access  Private (Typically only accessible by backend services or specific roles for logging)
// It's crucial for logging that this route is available, but who can CALL it needs thought.
// For simplicity, we'll allow all authenticated users to log their actions.
router.post('/', protect, createAuditLog);

// @route   GET /api/auditlogs
// @desc    Get all audit log entries
// @access  Private (Admin only)
router.get('/', protect, authorize(['admin']), getAllAuditLogs);

module.exports = router;