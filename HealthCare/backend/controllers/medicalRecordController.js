// HealthCare/backend/controllers/medicalRecordController.js

const asyncHandler = require('express-async-handler');
// You'll likely fetch data from various models here,
// as 'medical records' can be a combination of appointments, prescriptions, lab results, etc.
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const ConsultationNote = require('../models/ConsultationNotes');
const LabResult = require('../models/LabResult');
const Patient = require('../models/Patient'); // To validate patient IDs and get names


// @desc    Get all medical records (combined from various sources)
// @route   GET /api/medicalrecords
// @access  Private (Admin, Doctor, Nurse, Receptionist)
const getAllMedicalRecords = asyncHandler(async (req, res) => {
    const allRecords = [];

    // Fetch appointments
    const appointments = await Appointment.find({})
        .populate('patientId', 'fullName')
        .populate('doctorId', 'name');
    appointments.forEach(appt => {
        allRecords.push({
            _id: appt._id,
            patientName: appt.patientId ? appt.patientId.fullName : 'N/A',
            doctorName: appt.doctorId ? appt.doctorId.name : 'N/A',
            date: appt.date,
            type: 'Appointment',
            status: appt.status,
            details: appt.notes || 'No notes.',
            createdAt: appt.createdAt // Use createdAt for consistent sorting
        });
    });

    // Fetch prescriptions
    const prescriptions = await Prescription.find({})
        .populate('patient', 'fullName')
        .populate('doctor', 'name');
    prescriptions.forEach(pres => {
        allRecords.push({
            _id: pres._id,
            patientName: pres.patient ? pres.patient.fullName : 'N/A',
            doctorName: pres.doctor ? pres.doctor.name : 'N/A',
            date: pres.date,
            type: 'Prescription',
            status: 'Completed', // Prescriptions are usually "completed" once issued
            details: pres.details,
            createdAt: pres.createdAt
        });
    });

    // Fetch consultation notes
    const consultationNotes = await ConsultationNote.find({})
        .populate('patientId', 'fullName')
        .populate('doctorId', 'name');
    consultationNotes.forEach(note => {
        allRecords.push({
            _id: note._id,
            patientName: note.patientId ? note.patientId.fullName : 'N/A',
            doctorName: note.doctorId ? note.doctorId.name : 'N/A',
            date: note.dateOfConsultation,
            type: 'Consultation Note',
            status: 'Completed',
            details: note.notes,
            createdAt: note.createdAt
        });
    });

    // Fetch lab results
    const labResults = await LabResult.find({})
        .populate('patient', 'fullName')
        .populate('uploadedBy', 'name'); // Assuming uploadedBy references a User (doctor/nurse)
    labResults.forEach(lab => {
        allRecords.push({
            _id: lab._id,
            patientName: lab.patient ? lab.patient.fullName : 'N/A',
            doctorName: lab.uploadedBy ? lab.uploadedBy.name : 'N/A', // Or specific "Lab Tech" if applicable
            date: lab.createdAt,
            type: 'Lab Result',
            status: 'Completed',
            details: `Test: ${lab.testName}, Remarks: ${lab.remarks}`,
            documentPath: lab.documentPath, // Include path to document
            createdAt: lab.createdAt
        });
    });

    // Sort all records by date (most recent first)
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(allRecords);
});

// @desc    Get all medical records for a specific patient (combined)
// @route   GET /api/medicalrecords/patient/:patientId
// @access  Private (Admin, Doctor, Nurse)
const getMedicalRecordsForPatient = asyncHandler(async (req, res) => {
    const patientMongoId = req.params.patientId; // Assuming this is the MongoDB _id

    const patient = await Patient.findById(patientMongoId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found with the provided ID.');
    }

    const patientRecords = [];

    // Fetch patient-specific appointments
    const appointments = await Appointment.find({ patientId: patientMongoId })
        .populate('patientId', 'fullName')
        .populate('doctorId', 'name');
    appointments.forEach(appt => {
        patientRecords.push({
            _id: appt._id,
            patientName: appt.patientId ? appt.patientId.fullName : 'N/A',
            doctorName: appt.doctorId ? appt.doctorId.name : 'N/A',
            date: appt.date,
            type: 'Appointment',
            status: appt.status,
            details: appt.notes || 'No notes.',
            createdAt: appt.createdAt
        });
    });

    // Fetch patient-specific prescriptions
    const prescriptions = await Prescription.find({ patient: patientMongoId })
        .populate('patient', 'fullName')
        .populate('doctor', 'name');
    prescriptions.forEach(pres => {
        patientRecords.push({
            _id: pres._id,
            patientName: pres.patient ? pres.patient.fullName : 'N/A',
            doctorName: pres.doctor ? pres.doctor.name : 'N/A',
            date: pres.date,
            type: 'Prescription',
            status: 'Completed',
            details: pres.details,
            createdAt: pres.createdAt
        });
    });

    // Fetch patient-specific consultation notes
    const consultationNotes = await ConsultationNote.find({ patientId: patientMongoId })
        .populate('patientId', 'fullName')
        .populate('doctorId', 'name');
    consultationNotes.forEach(note => {
        patientRecords.push({
            _id: note._id,
            patientName: note.patientId ? note.patientId.fullName : 'N/A',
            doctorName: note.doctorId ? note.doctorId.name : 'N/A',
            date: note.dateOfConsultation,
            type: 'Consultation Note',
            status: 'Completed',
            details: note.notes,
            createdAt: note.createdAt
        });
    });

    // Fetch patient-specific lab results
    const labResults = await LabResult.find({ patient: patientMongoId })
        .populate('patient', 'fullName')
        .populate('uploadedBy', 'name');
    labResults.forEach(lab => {
        patientRecords.push({
            _id: lab._id,
            patientName: lab.patient ? lab.patient.fullName : 'N/A',
            doctorName: lab.uploadedBy ? lab.uploadedBy.name : 'N/A',
            date: lab.createdAt,
            type: 'Lab Result',
            status: 'Completed',
            details: `Test: ${lab.testName}, Remarks: ${lab.remarks}`,
            documentPath: lab.documentPath,
            createdAt: lab.createdAt
        });
    });

    patientRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(patientRecords);
});


module.exports = {
    getAllMedicalRecords,
    getMedicalRecordsForPatient
};
