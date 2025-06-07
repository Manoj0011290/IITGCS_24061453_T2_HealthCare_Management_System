// backend/controllers/followUpController.js
const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Schedule a new follow-up
// @route   POST /api/followups
// @access  Private (Doctor only)
exports.scheduleFollowUp = asyncHandler(async (req, res) => {
    const { patientId, followUpDate, reason } = req.body;
    const doctorId = req.user._id;

    if (!patientId || !followUpDate || !reason) {
        res.status(400);
        throw new Error('Patient ID, Follow-up Date, and Reason are required.');
    }

    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
        res.status(404);
        throw new Error('Patient not found.');
    }

    const doctorExists = await User.findById(doctorId);
    if (!doctorExists || doctorExists.role !== 'doctor') {
        res.status(403);
        throw new Error('Unauthorized: Only doctors can schedule follow-ups.');
    }

    const newFollowUp = new FollowUp({
        patient: patientId,
        doctor: doctorId,
        followUpDate: new Date(followUpDate),
        reason: reason,
        status: 'scheduled'
    });

    const savedFollowUp = await newFollowUp.save();

    res.status(201).json({
        message: 'Follow-up scheduled successfully!',
        followUp: savedFollowUp
    });
});