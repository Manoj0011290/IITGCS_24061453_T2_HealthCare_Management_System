// backend/routes/labResultRoutes.js
const express = require('express');
const router = express.Router();
const labResultController = require('../controllers/labResultController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Your authentication middleware

// @route   GET /api/labresults/patient/:patientId
// @desc    Get all lab results for a specific patient
// @access  Private (Doctor, Nurse, Admin)
router.get(
    '/patient/:patientId', // Using '/patient/:patientId' to avoid conflict with potential other lab result routes (e.g., /:id for single result)
    protect,
    authorize(['doctor', 'nurse', 'admin']), // Allow relevant roles to view
    labResultController.getLabResultsForPatient
);

// IMPORTANT: If you *also* have an upload route (e.g., from a nurse dashboard),
// you would add it here using Multer, like this (example):
/*
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/lab_results');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const patientId = req.params.patientId || 'unknown_patient';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `patient-<span class="math-inline">\{patientId\}\-</span>{uniqueSuffix}${fileExtension}`);
    },
});

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
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Example upload route (for nurses/lab techs)
router.post(
    '/upload/:patientId', // Different route to handle uploads
    protect,
    authorize(['nurse', 'admin']), // Only nurses and admins can upload
    upload.single('labResultFile'),
    labResultController.uploadLabResult // You'd need to implement uploadLabResult in your controller
);
*/

module.exports = router;