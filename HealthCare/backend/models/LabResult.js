const mongoose = require('mongoose');

const labResultSchema = mongoose.Schema(
    {
        patient: { // This links to the Patient model's MongoDB ObjectId
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient', // 'Patient' refers to the name of your Patient model
            required: true,
        },
        testName: {
            type: String,
            required: [true, 'Please add a test name'],
        },
        documentPath: { // This will store the file path (e.g., /uploads/lab_results/filename.pdf)
            type: String,
            required: [true, 'Please upload a document for the result'],
        },
        remarks: { // Additional notes or observations
            type: String,
            default: 'No remarks',
        },
        uploadedBy: { // Optional: Link to the User (Nurse, Doctor, etc.) who uploaded it
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // 'User' refers to your User model
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps automatically
    }
);

module.exports = mongoose.model('LabResult', labResultSchema);