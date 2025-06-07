// backend/models/FollowUp.js
const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // References your Patient model
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References your User model (assuming doctors are users)
        required: true
    },
    followUpDate: { // The scheduled date for the follow-up
        type: Date,
        required: true
    },
    reason: { // Short description of the reason for follow-up
        type: String,
        trim: true,
        required: [true, 'Follow-up reason is required']
    },
    status: { // e.g., 'scheduled', 'completed', 'cancelled'
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: { // Any additional notes from the doctor after the follow-up (optional)
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const FollowUp = mongoose.model('FollowUp', followUpSchema);

module.exports = FollowUp;