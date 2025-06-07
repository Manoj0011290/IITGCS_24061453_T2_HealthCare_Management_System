// backend/models/Patient.js
const mongoose = require('mongoose');
const Counter = require('./Counter'); // Import the Counter model

const patientSchema = mongoose.Schema(
  {
    patientId: { // <-- New auto-incrementing field
      type: Number,
      unique: true,
      index: true, // Add an index for faster lookups
    },
    // --- Personal Details Section ---
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: { // Date of Birth
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed'],
      required: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    religion: {
      type: String,
      required: false,
      trim: true,
    },

    // --- Contact Information Section ---
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    residentialAddress: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContactName: {
      type: String,
      required: true,
      trim: true,
    },
    relationshipToEmergencyContact: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate auto-incrementing patientId
patientSchema.pre('save', async function (next) {
  // Only generate a patientId if it's a new document
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'patientId' }, // The name of our sequence in the counters collection
        { $inc: { sequence_value: 1 } }, // Increment the sequence value by 1
        { new: true, upsert: true } // Return the new document, create if it doesn't exist
      );
      this.patientId = counter.sequence_value; // Assign the new sequence value to patientId
      next();
    } catch (error) {
      console.error('Error generating patientId:', error);
      next(error); // Pass the error to the next middleware
    }
  } else {
    next(); // If not a new document, just proceed
  }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;