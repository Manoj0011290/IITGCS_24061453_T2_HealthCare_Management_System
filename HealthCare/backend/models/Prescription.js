// backend/models/Prescription.js

const mongoose = require('mongoose');



const prescriptionSchema = new mongoose.Schema({

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
 details: { // This will store the actual prescription text or report summary

 type: String,

 required: [true, 'Prescription details are required'],

 trim: true

 },

 date: {

 type: Date,

 default: Date.now // Automatically sets the current date
 },


}, {

 timestamps: true // Adds createdAt and updatedAt fields automatically

});



const Prescription = mongoose.model('Prescription', prescriptionSchema);



module.exports = Prescription;