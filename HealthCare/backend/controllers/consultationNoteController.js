// HealthCare/backend/controllers/consultationNoteController.js
const asyncHandler = require('express-async-handler');
const ConsultationNote = require('../models/ConsultationNotes');
const Patient = require('../models/Patient');
const User = require('../models/User');
// --- REMOVED: const admin = require('firebase-admin'); ---

// @desc    Add new consultation note
// @route   POST /api/consultationnotes
// @access  Private (doctor)
const addConsultationNote = asyncHandler(async (req, res) => {
    // --- REMOVED: const firestore = admin.firestore(); ---

    const { patientId, notes } = req.body;

    if (!req.user || req.user.role !== 'doctor') {
        res.status(401);
        throw new Error('Not authorized as a doctor to add consultation notes');
    }
    const doctorId = req.user._id;

    if (!patientId || !notes) {
        res.status(400);
        throw new Error('Please provide patient ID and notes for the consultation.');
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found with the provided ID.');
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found.');
    }

    // Create consultation note in MongoDB
    const consultationNote = await ConsultationNote.create({
        patientId,
        doctorId,
        notes,
        dateOfConsultation: new Date()
    });

    if (consultationNote) {
        // --- REMOVED: Firestore mirroring logic for consultation note ---
        /*
        const firestoreMedicalRecordDocRef = firestore.collection(`artifacts/${process.env.APP_ID}/public/data/medicalRecords`).doc();
        await firestoreMedicalRecordDocRef.set({
            type: 'Consultation Note',
            patientId: consultationNote.patientId.toString(),
            patientName: patient.fullName,
            doctorId: consultationNote.doctorId.toString(),
            doctorName: doctor.name,
            date: admin.firestore.Timestamp.fromDate(consultationNote.dateOfConsultation),
            summary: notes.substring(0, 150) + (notes.length > 150 ? '...' : ''),
            sourceDocId: consultationNote._id.toString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Consultation Note ${consultationNote._id} mirrored to generic medicalRecords in Firestore.`);
        */

        res.status(201).json({
            message: 'Consultation note added successfully',
            data: consultationNote
        });
    } else {
        res.status(400);
        throw new Error('Invalid consultation note data');
    }
});

// @desc    Get consultation notes for a patient
// @route   GET /api/consultationnotes/:patientId
// @access  Private (doctor, admin, etc.)
const getConsultationNotesByPatientId = asyncHandler(async (req, res) => {
    const patientId = req.params.patientId;

    const consultationNotes = await ConsultationNote.find({ patientId }).sort({ dateOfConsultation: -1 });

    if (consultationNotes) {
        res.status(200).json({
            message: 'Consultation notes fetched successfully',
            data: consultationNotes
        });
    } else {
        res.status(404);
        throw new Error('No consultation notes found for this patient.');
    }
});


module.exports = {
    addConsultationNote,
    getConsultationNotesByPatientId
};
