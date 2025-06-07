// HealthCare/backend/routes/appointmentRoutes.js

const express = require('express');
const router = express.Router();

// Import controller functions that handle the business logic for appointment operations
const {
    bookAppointment,
    getAllAppointments,
    getAppointmentById, // Assuming you'll add this later
    updateAppointment,  // Assuming you'll add this later
    deleteAppointment   // Assuming you'll add this later
} = require('../controllers/appointmentController'); // Make sure this path is correct

// Import middleware for authentication (protect) and role-based authorization (authorize)
const { protect, authorize } = require('../middleware/authMiddleware');


// @route   POST /api/appointments/book
// @desc    Book a new appointment
// @access  Private (e.g., Receptionist, Doctor, Admin)
router.post(
    '/book',
    protect,
    authorize(['receptionist', 'doctor', 'admin']), // Define who can book appointments
    bookAppointment
);

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private (e.g., Receptionist, Doctor, Admin)
router.get(
    '/',
    protect,
    authorize(['receptionist', 'doctor', 'admin']), // Define who can view all appointments
    getAllAppointments
);

// You might add more routes here later, for example:
// router.get('/:id', protect, authorize(['receptionist', 'doctor', 'admin']), getAppointmentById);
// router.put('/:id', protect, authorize(['receptionist', 'doctor', 'admin']), updateAppointment);
// router.delete('/:id', protect, authorize(['admin']), deleteAppointment);


module.exports = router;