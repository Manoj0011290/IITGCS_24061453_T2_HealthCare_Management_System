// HealthCare/backend/controllers/appointmentController.js

const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const admin = require('firebase-admin');

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private (e.g., Receptionist, Doctor, Admin)
// --- CHANGE: Define directly as exports.bookAppointment ---
exports.bookAppointment = asyncHandler(async (req, res) => {
    const firestore = admin.firestore(); // Get firestore instance here

    const { patientId, doctorId, date, type, notes } = req.body;

    if (!patientId || !doctorId || !date) {
        res.status(400);
        throw new Error('Please provide patient ID, doctor ID, and date for the appointment.');
    }

    const patient = await Patient.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found.');
    }
    if (!doctor || doctor.role !== 'doctor') {
        res.status(404);
        throw new Error('Doctor not found or selected user is not a doctor.');
    }

    const appointment = await Appointment.create({
        patientId,
        patientName: patient.fullName,
        doctorId,
        doctorName: doctor.name,
        date: new Date(date),
        type: type || 'Consultation',
        notes: notes || ''
    });

    if (appointment) {
        const firestoreApptDocRef = firestore.collection(`artifacts/${process.env.APP_ID}/public/data/appointments`).doc(appointment._id.toString());
        await firestoreApptDocRef.set({
            patientId: appointment.patientId.toString(),
            patientName: appointment.patientName,
            doctorId: appointment.doctorId.toString(),
            doctorName: appointment.doctorName,
            date: admin.firestore.Timestamp.fromDate(appointment.date),
            type: appointment.type,
            status: appointment.status,
            notes: appointment.notes,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Appointment ${appointment._id} mirrored to Firestore.`);

        res.status(201).json({
            message: 'Appointment booked successfully!',
            appointment: appointment
        });
    } else {
        res.status(400);
        throw new Error('Invalid appointment data provided.');
    }
});

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private (e.g., Receptionist, Doctor, Admin)
// --- CHANGE: Define directly as exports.getAllAppointments ---
exports.getAllAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({})
        .populate('patientId', 'fullName patientId')
        .populate('doctorId', 'name employeeId');

    res.status(200).json(appointments);
});

// --- REMOVED: module.exports object at the end ---
// When using `exports.functionName`, you typically don't need a `module.exports = { ... }` block at the end,
// unless you want to export something else as the default export.
// For multiple named exports, `exports.functionName` is sufficient.