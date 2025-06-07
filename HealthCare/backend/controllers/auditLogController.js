// HealthCare/backend/controllers/auditLogController.js

const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog'); // Assuming you have an AuditLog model

// @desc    Create a new audit log entry
// @route   POST /api/auditlogs
// @access  Private (Any authenticated user can log their action)
const createAuditLog = asyncHandler(async (req, res) => {
    const { action, details } = req.body;

    // The userId should be available from the 'protect' middleware (req.user._id)
    const userId = req.user ? req.user._id : 'anonymous'; // Fallback if no user is authenticated (shouldn't happen with 'protect')

    if (!action) {
        res.status(400);
        throw new Error('Audit log action is required.');
    }

    const auditLog = await AuditLog.create({
        userId,
        action,
        details: details || {}, // Store details as an empty object if not provided
        timestamp: new Date()
    });

    if (auditLog) {
        res.status(201).json({
            message: 'Audit log created successfully',
            data: auditLog
        });
    } else {
        res.status(400);
        throw new Error('Failed to create audit log.');
    }
});

// @desc    Get all audit log entries
// @route   GET /api/auditlogs
// @access  Private (Admin only)
const getAllAuditLogs = asyncHandler(async (req, res) => {
    // Audit logs fetched from oldest to newest (default sort order)
    // If you need newest first, add .sort({ timestamp: -1 })
    const auditLogs = await AuditLog.find({}); // You might want to add pagination later for large logs
    res.status(200).json(auditLogs);
});

module.exports = {
    createAuditLog,
    getAllAuditLogs
};
