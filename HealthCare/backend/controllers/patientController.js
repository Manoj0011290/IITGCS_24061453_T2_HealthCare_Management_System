// HealthCare/backend/controllers/patientController.js

const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const LabResult = require('../models/LabResult');
const fs = require('fs');

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private (e.g., Receptionist, Admin)
const registerPatient = asyncHandler(async (req, res) => { // Changed exports.registerPatient to const registerPatient
    const {
        fullName, dob, gender, bloodGroup, maritalStatus, nationality, occupation, religion,
        phoneNumber, emailAddress, residentialAddress, emergencyContactName, relationshipToEmergencyContact
    } = req.body;

    if (!fullName || !dob || !gender || !phoneNumber || !emailAddress || !residentialAddress ||
        !emergencyContactName || !relationshipToEmergencyContact || !bloodGroup || !maritalStatus ||
        !nationality || !occupation) {
        res.status(400);
        throw new Error('Please fill all required patient details.');
    }

    const existingPatientByPhone = await Patient.findOne({ phoneNumber });
    if (existingPatientByPhone) {
        res.status(409);
        throw new Error(`A patient with phone number '${phoneNumber}' already exists.`);
    }
    const existingPatientByEmail = await Patient.findOne({ emailAddress });
    if (existingPatientByEmail) {
        res.status(409);
        throw new Error(`A patient with email address '${emailAddress}' already exists.`);
    }

    const newPatient = new Patient({
        fullName, dob, gender, bloodGroup, maritalStatus, nationality, occupation, religion,
        phoneNumber, emailAddress, residentialAddress, emergencyContactName, relationshipToEmergencyContact,
    });

    try {
        const savedPatient = await newPatient.save();
        res.status(201).json({ message: 'Patient registered successfully', patient: savedPatient });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409);
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            throw new Error(`A patient with this ${field} '${value}' already exists.`);
        }
        console.error('Error registering patient:', error);
        res.status(500);
        throw new Error('Server error during patient registration: ' + error.message);
    }
});

// @desc    Search for patients by name, phoneNumber, or emailAddress
// @route   GET /api/patients/search
// @access  Private (e.g., Nurse, Doctor, Receptionist, Admin)
const searchPatients = asyncHandler(async (req, res) => { // Changed exports.searchPatients
    try {
        const { name, emailAddress, phoneNumber } = req.query;
        let query = {};

        if (name) {
            query.fullName = { $regex: name, $options: 'i' };
        } else if (emailAddress) {
            query.emailAddress = { $regex: emailAddress, $options: 'i' };
        } else if (phoneNumber) {
            query.phoneNumber = phoneNumber;
        } else {
            res.status(400);
            throw new Error('Please provide a name, email address, or phone number to search.');
        }

        const patients = await Patient.find(query);

        if (patients.length === 0) {
            res.status(404);
            throw new Error('No patients found matching the criteria.');
        }

        res.status(200).json(patients);

    } catch (error) {
        console.error('Error searching patients:', error);
        if (res.statusCode === 200) res.status(500);
        throw new Error('Server error searching patients: ' + error.message);
    }
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (e.g., Nurse, Doctor, Receptionist, Admin)
const getAllPatients = asyncHandler(async (req, res) => { // Changed exports.getAllPatients
    const patients = await Patient.find({});
    res.status(200).json(patients);
});

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private (e.g., Nurse, Doctor, Receptionist, Admin)
const getPatientById = asyncHandler(async (req, res) => { // Changed exports.getPatientById
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    res.status(200).json(patient);
});

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Private (e.g., Receptionist, Admin)
const updatePatient = asyncHandler(async (req, res) => { // Changed exports.updatePatient
    const {
        fullName, dob, gender, bloodGroup, maritalStatus, nationality, occupation, religion,
        phoneNumber, emailAddress, residentialAddress, emergencyContactName, relationshipToEmergencyContact
    } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    if (phoneNumber && phoneNumber !== patient.phoneNumber) {
        const existingPatientByPhone = await Patient.findOne({ phoneNumber });
        if (existingPatientByPhone && existingPatientByPhone._id.toString() !== patient._id.toString()) {
            res.status(409);
            throw new Error(`A patient with phone number '${phoneNumber}' already exists.`);
        }
    }
    if (emailAddress && emailAddress !== patient.emailAddress) {
        const existingPatientByEmail = await Patient.findOne({ emailAddress });
        if (existingPatientByEmail && existingPatientByEmail._id.toString() !== patient._id.toString()) {
            res.status(409);
            throw new Error(`A patient with email address '${emailAddress}' already exists.`);
        }
    }

    patient.fullName = fullName || patient.fullName;
    patient.dob = dob || patient.dob;
    patient.gender = gender || patient.gender;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;
    patient.maritalStatus = maritalStatus || patient.maritalStatus;
    patient.nationality = nationality || patient.nationality;
    patient.occupation = occupation || patient.occupation;
    patient.religion = religion || patient.religion;
    patient.phoneNumber = phoneNumber || patient.phoneNumber;
    patient.emailAddress = emailAddress || patient.emailAddress;
    patient.residentialAddress = residentialAddress || patient.residentialAddress;
    patient.emergencyContactName = emergencyContactName || patient.emergencyContactName;
    patient.relationshipToEmergencyContact = relationshipToEmergencyContact || patient.relationshipToEmergencyContact;

    try {
        const updatedPatient = await patient.save();
        res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409);
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            throw new Error(`A patient with this ${field} '${value}' already exists.`);
        }
        console.error('Error updating patient:', error);
        res.status(500);
        throw new Error('Server error during patient update: ' + error.message);
    }
});

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private (e.g., Admin)
const deletePatient = asyncHandler(async (req, res) => { // Changed exports.deletePatient
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    const patientId = patient._id.toString();
    const patientName = patient.fullName;

    await patient.deleteOne();

    res.status(200).json({ message: 'Patient removed successfully' });
});

// @desc    Upload a lab result document for a specific patient
// @route   POST /api/patients/:patientId/lab-results
// @access  Private (e.g., Nurse, Doctor, Admin)
const uploadLabResult = asyncHandler(async (req, res) => { // Changed exports.uploadLabResult
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded or file type not supported. Please upload a PDF, JPG, JPEG, or PNG.');
    }

    const { testName, remarks } = req.body;
    const patientMongoId = req.params.patientId; // <--- This is the MongoDB _id from the URL

    if (!testName) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete file after missing testName:', err);
        });
        res.status(400);
        throw new Error('Please provide a test name for the lab result.');
    }

    // IMPORTANT: Ensure patientMongoId is the MongoDB _id and use findById
    const patient = await Patient.findById(patientMongoId);
    if (!patient) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete file after patient not found:', err);
        });
        res.status(404);
        throw new Error('Patient not found for lab result upload. Please ensure the Patient ID is correct (MongoDB _id).');
    }

    const labResult = await LabResult.create({
        patient: patient._id, // Store patient's MongoDB _id (ObjectId reference)
        testName,
        documentPath: `/uploads/lab_results/${req.file.filename}`,
        remarks: remarks || 'No remarks provided',
        uploadedBy: req.user._id, // Assuming req.user is populated by auth middleware
    });

    if (labResult) {
        res.status(201).json({
            message: 'Lab result uploaded and saved successfully!',
            labResult: {
                _id: labResult._id,
                // Using patient.patientId (numeric) here for display/frontend convenience if needed
                // But the primary reference is always patient._id
                patientId: patient.patientId, // This is the numeric auto-incrementing ID
                testName: labResult.testName,
                documentPath: labResult.documentPath,
                remarks: labResult.remarks,
                createdAt: labResult.createdAt
            }
        });
    } else {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete uploaded file after DB error:', err);
        });
        res.status(400);
        throw new Error('Failed to save lab result data to database. Invalid data or server issue.');
    }
});

// @desc    Get all lab results for a specific patient
// @route   GET /api/patients/:patientId/lab-results
// @access  Private (e.g., Nurse, Doctor, Admin)
const getLabResultsForPatient = asyncHandler(async (req, res) => { // Changed exports.getLabResultsForPatient
    const patientMongoId = req.params.patientId; // This is expected to be the MongoDB _id

    // Validate if the ID is a valid MongoDB ObjectId format
    // This is a basic check; actual Mongoose findById handles invalid formats gracefully by returning null
    if (!patientMongoId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error('Invalid patient ID format provided. Please provide a valid MongoDB ObjectId.');
    }

    // IMPORTANT: Use findById to directly query by MongoDB _id (string)
    const patient = await Patient.findById(patientMongoId);

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found with the provided MongoDB ID.');
    }

    // Find lab results by patient's MongoDB _id (which is a reference in LabResult model)
    const labResults = await LabResult.find({ patient: patient._id }).sort({ createdAt: -1 });
    res.status(200).json({
        message: 'Lab results fetched successfully!',
        labResults: labResults
    });
});

// Export all functions
module.exports = {
    registerPatient,
    searchPatients,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    uploadLabResult,
    getLabResultsForPatient
};
