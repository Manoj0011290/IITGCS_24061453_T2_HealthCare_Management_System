// HealthCare/backend/controllers/prescriptionController.js

const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription'); // Import the Prescription model
const Patient = require('../models/Patient');         // Import Patient model for validation/details
const User = require('../models/User');               // Import User model for doctor validation/details

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = asyncHandler(async (req, res) => {
    const { patientId, doctorId, details } = req.body;

    // Basic validation
    if (!patientId || !doctorId || !details) {
        res.status(400);
        throw new Error('Please provide patient ID, doctor ID, and prescription details.');
    }

    // Verify patient and doctor existence
    const patient = await Patient.findById(patientId);
    const doctor = await User.findById(doctorId); // Assuming doctors are users

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found.');
    }
    if (!doctor || doctor.role !== 'doctor') {
        res.status(404);
        throw new Error('Doctor not found or selected user is not a doctor.');
    }

    // Create prescription in MongoDB
    const prescription = await Prescription.create({
        patient: patientId,
        doctor: doctorId,
        details,
        date: new Date() // Set current date by default, can be overridden by req.body.date if needed
    });

    if (prescription) {
        res.status(201).json({
            message: 'Prescription created successfully!',
            prescription: prescription
        });
    } else {
        res.status(400);
        throw new Error('Invalid prescription data provided.');
    }
});

// @desc    Get all prescriptions for a specific patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Doctor, Nurse, Receptionist, Admin)
const getPrescriptionsForPatient = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    // Verify patient existence (optional, but good for robust error handling)
    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found.');
    }

    // Find prescriptions for the patient, populate patient and doctor details
    const prescriptions = await Prescription.find({ patient: patientId })
        .populate('patient', 'fullName') // Populate patient's full name
        .populate('doctor', 'name employeeId') // Populate doctor's name and employee ID
        .sort({ date: -1 }); // Sort by date, newest first

    res.status(200).json(prescriptions);
});

// @desc    Get a single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private (Doctor, Nurse, Receptionist, Admin)
const getPrescriptionById = asyncHandler(async (req, res) => {
    const prescription = await Prescription.findById(req.params.id)
        .populate('patient', 'fullName')
        .populate('doctor', 'name employeeId');

    if (!prescription) {
        res.status(404);
        throw new Error('Prescription not found.');
    }

    res.status(200).json(prescription);
});

// @desc    Update a prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor only)
const updatePrescription = asyncHandler(async (req, res) => {
    const { details } = req.body; // Only allowing 'details' to be updated for simplicity

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
        res.status(404);
        throw new Error('Prescription not found.');
    }

    prescription.details = details || prescription.details;
    // You could add other fields here if they are meant to be editable

    const updatedPrescription = await prescription.save();

    res.status(200).json({
        message: 'Prescription updated successfully!',
        prescription: updatedPrescription
    });
});

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Admin or Doctor who created it - needs more complex middleware)
const deletePrescription = asyncHandler(async (req, res) => {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
        res.status(404);
        throw new Error('Prescription not found.');
    }

    await prescription.deleteOne();

    res.status(200).json({ message: 'Prescription removed successfully' });
});

// Export all functions
module.exports = {
    createPrescription,
    getPrescriptionsForPatient,
    getPrescriptionById,
    updatePrescription,
    deletePrescription,
};
