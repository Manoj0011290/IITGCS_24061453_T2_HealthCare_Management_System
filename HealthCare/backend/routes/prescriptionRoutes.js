// HealthCare/backend/routes/prescriptionRoutes.js

const express = require('express');
const router = express.Router(); // Ensure router is initialized
const prescriptionController = require('../controllers/prescriptionController'); // Import controller functions
const { protect, authorize } = require('../middleware/authMiddleware'); // Your authentication middleware

// @route   POST /api/prescriptions
// @desc    Add a new prescription/report
// @access  Private (Doctor only)
router.post(
    '/',
    protect,            // Protect the route, requiring a valid JWT token
    authorize(['doctor']), // Only allow users with the 'doctor' role
    prescriptionController.createPrescription // Call the controller function
);

// Add other routes here as needed, using the functions from prescriptionController
// Example:
router.get(
    '/patient/:patientId',
    protect,
    authorize(['doctor', 'nurse', 'receptionist', 'admin']),
    prescriptionController.getPrescriptionsForPatient
);

router.get(
    '/:id',
    protect,
    authorize(['doctor', 'nurse', 'receptionist', 'admin']),
    prescriptionController.getPrescriptionById
);

router.put(
    '/:id',
    protect,
    authorize(['doctor']), // Only doctor can update their own prescriptions
    prescriptionController.updatePrescription
);

router.delete(
    '/:id',
    protect,
    authorize(['admin']), // Only admin can delete prescriptions (or doctor who created it with more complex logic)
    prescriptionController.deletePrescription
);


module.exports = router; // Export the router instance
