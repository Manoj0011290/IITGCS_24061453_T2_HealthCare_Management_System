// HealthCare/backend/models/AuditLog.js

const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References your User model
        required: true
    },
    action: { // e.g., 'User Created', 'Patient Updated', 'Appointment Booked'
        type: String,
        required: true,
        trim: true
    },
    details: { // Stores additional JSON data about the action
        type: Object, // Mongoose mixed type, allowing flexible JSON structure
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // We use our own 'timestamp' field for finer control,
                      // but Mongoose's default timestamps could also be used.
                      // Set to false if you want only your 'timestamp' field.
                      // If you want Mongoose's default createdAt/updatedAt AND your timestamp, remove this line.
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
