// backend/routes/followUpRoutes.js
const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Your authentication middleware

// @route   POST /api/followups
// @desc    Schedule a new follow-up
// @access  Private (Doctor only)
router.post(
    '/',
    protect,             // Protect the route, requiring a valid JWT token
    authorize(['doctor']), // Only allow users with the 'doctor' role
    followUpController.scheduleFollowUp // Call the controller function
);

// You might add other routes here later, e.g.:
// router.get('/:patientId', protect, authorize(['doctor', 'receptionist', 'nurse']), followUpController.getFollowUpsForPatient);
// router.get('/:id', protect, authorize(['doctor', 'receptionist', 'nurse']), followUpController.getFollowUpById);
// router.put('/:id/status', protect, authorize(['doctor', 'receptionist', 'nurse']), followUpController.updateFollowUpStatus);

module.exports = router;