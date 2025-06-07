// HealthCare/backend/models/ConsultationNotes.js
const mongoose = require('mongoose');

const consultationNoteSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId, // <--- CHANGED: Should be ObjectId to reference Patient model
        ref: 'Patient',                     // <--- ADDED: Reference to the Patient model
        required: [true, "Patient ID is required"]
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Replace 'User' with your actual doctor/user model name
        required: [true, "Doctor ID is required"]
    },
    notes: {
        type: String,
        required: [true, "Consultation notes are required"],
        trim: true
    },
    dateOfConsultation: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('ConsultationNote', consultationNoteSchema);