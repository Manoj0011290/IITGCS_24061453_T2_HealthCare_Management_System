// HealthCare/backend/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Refers to the Patient model
        required: true
    },
    patientName: { // Denormalized for easier display/lookup in frontend
        type: String,
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model (for doctors)
        required: true
    },
    doctorName: { // Denormalized
        type: String,
        required: true
    },
    date: { // Date and time of the appointment
        type: Date,
        required: true
    },
    type: { // Type of appointment (e.g., Consultation, Follow-up, Lab Test)
        type: String,
        enum: ['Consultation', 'Follow-up', 'Lab Test', 'Other'],
        default: 'Consultation'
    },
    status: { // Current status of the appointment
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
        default: 'Scheduled'
    },
    notes: { // Any additional notes for the appointment
        type: String,
        required: false // Not required
    },
    // You can add fields like 'reasonForVisit', 'roomNumber', etc.
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;