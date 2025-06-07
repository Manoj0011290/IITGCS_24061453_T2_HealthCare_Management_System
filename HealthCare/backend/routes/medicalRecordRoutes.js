// HealthCare/backend/routes/medicalRecordRoutes.js

const express = require('express');
const router = express.Router();
const {
    getAllMedicalRecords,
    getMedicalRecordsForPatient // Assuming you'll have this for patient-specific views
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/medicalrecords
// @desc    Get all medical records (e.g., for Admin oversight, or a combined view)
// @access  Private (Admin, Doctor, Nurse, Receptionist - depending on what "all" means)
router.get('/', protect, authorize(['admin', 'doctor', 'nurse', 'receptionist']), getAllMedicalRecords);

// @route   GET /api/medicalrecords/patient/:patientId
// @desc    Get all medical records for a specific patient
// @access  Private (Admin, Doctor, Nurse)
router.get('/patient/:patientId', protect, authorize(['admin', 'doctor', 'nurse']), getMedicalRecordsForPatient);


// Note: Individual medical record types like prescriptions and consultation notes
// might have their own specific routes and controllers (which you already have).
// This '/api/medicalrecords' endpoint could be a more generic combined view or for reports.

module.exports = router;
