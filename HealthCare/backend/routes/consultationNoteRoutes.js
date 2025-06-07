const express = require('express');
const router = express.Router();
const { addConsultationNote, getConsultationNotesByPatientId } = require('../controllers/consultationNoteController');
const { protect } = require('../middleware/authMiddleware'); // Assuming your auth middleware path

// Route to add a new consultation note
// POST to /api/consultationnotes
router.post('/', protect, addConsultationNote);

// Route to get consultation notes for a specific patient
// GET to /api/consultationnotes/:patientId
router.get('/:patientId', protect, getConsultationNotesByPatientId);

module.exports = router;