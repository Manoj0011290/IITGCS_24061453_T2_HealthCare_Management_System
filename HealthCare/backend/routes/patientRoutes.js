// HealthCare/backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); // IMPORTANT: For handling file uploads
const path = require('path');     // Built-in Node.js module for working with file paths
const fs = require('fs');         // Built-in Node.js module for file system operations

// Import ALL patient controller functions.
// These functions are assumed to be present and correctly implemented in your patientController.js
const {
    registerPatient,
    searchPatients,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    uploadLabResult, // Make sure this is imported if used here
    getLabResultsForPatient // Make sure this is imported if used here
} = require('../controllers/patientController');

// Import your authentication and authorization middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Multer Configuration for Lab Results Upload ---
// Ensure the uploads directory exists before Multer tries to save there
const uploadsDir = path.join(__dirname, '../uploads/lab_results');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadsDir}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Files will be saved in HealthCare/backend/uploads/lab_results/
    },
    filename: (req, file, cb) => {
        // Create a unique filename: patient ID + timestamp + original extension
        // patientId is taken from req.params, which will be available when Multer is called after route parsing
        const patientId = req.params.patientId || 'unknown_patient'; // Fallback if patientId is not in params
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `patient-${patientId}-${uniqueSuffix}${fileExtension}`);
    },
});

// Filter to allow only specific file types (e.g., PDFs, common image formats)
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed for lab results!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB (10 * 1MB)
});
// --- End Multer Configuration ---


// @route   POST /api/patients
// @desc    Register a new patient
// @access  Private/Receptionist, Admin
router.post(
    '/',
    protect,
    authorize(['receptionist', 'admin']),
    registerPatient // Direct call to controller function
);

// @route   GET /api/patients/search
// @desc    Search for patients by name, phoneNumber, or emailAddress
// @access  Private/Nurse, Doctor, Receptionist, Admin
// IMPORTANT: Query parameters expected by the controller are `name`, `phoneNumber`, `emailAddress`
router.get(
    '/search',
    protect,
    authorize(['nurse', 'doctor', 'receptionist', 'admin']),
    searchPatients // Direct call to controller function
);

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private/Nurse, Doctor, Receptionist, Admin (All relevant staff can view)
router.get(
    '/',
    protect,
    authorize(['nurse', 'doctor', 'receptionist', 'admin']),
    getAllPatients // Direct call to controller function
);

// @route   GET /api/patients/:id
// @desc    Get a single patient by their MongoDB _id
// @access  Private/Nurse, Doctor, Receptionist, Admin
router.get(
    '/:id', // Using ':id' for consistency with common REST practices for MongoDB's _id
    protect,
    authorize(['nurse', 'doctor', 'receptionist', 'admin']),
    getPatientById // Direct call to controller function
);

// @route   PUT /api/patients/:id
// @desc    Update a patient's details by their MongoDB _id
// @access  Private/Receptionist, Admin
router.put(
    '/:id',
    protect,
    authorize(['receptionist', 'admin']),
    updatePatient // Direct call to controller function
);

// @route   DELETE /api/patients/:id
// @desc    Delete a patient by their MongoDB _id
// @access  Private/Admin
router.delete(
    '/:id',
    protect,
    authorize(['admin']),
    deletePatient // Direct call to controller function
);

// @route   POST /api/patients/:patientId/lab-results
// @desc    Upload a lab result document for a specific patient
// @access  Private (e.g., Nurse, Doctor, Admin)
router.post(
    '/:patientId/lab-results', // Use :patientId as it's part of the file naming and patient lookup
    protect,
    authorize(['nurse', 'doctor', 'admin']),
    upload.single('labResultFile'), // Multer middleware processes the file before controller
    uploadLabResult // Direct call to controller function
);

// @route   GET /api/patients/:patientId/lab-results
// @desc    Get all lab results for a specific patient
// @access  Private (e.g., Nurse, Doctor, Admin)
router.get(
    '/:patientId/lab-results',
    protect,
    authorize(['nurse', 'doctor', 'admin']),
    getLabResultsForPatient // Direct call to controller function
);

module.exports = router;