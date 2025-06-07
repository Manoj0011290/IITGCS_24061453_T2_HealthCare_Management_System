// HealthCare/backend/models/Department.js

const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Department names should be unique
        trim: true
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
