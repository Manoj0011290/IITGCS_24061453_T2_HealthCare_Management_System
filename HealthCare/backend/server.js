// HealthCare/backend/server.js

// 1. Load environment variables from .env file
require('dotenv').config();

// 2. Import necessary modules
const express = require('express');
const cors = require('cors');           // For handling Cross-Origin Resource Sharing
const path = require('path');           // Built-in Node.js module for working with file paths
const connectDB = require('./config/db'); // Your database connection function
// --- REMOVED: const admin = require('firebase-admin'); ---

// 3. Import route files
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const consultationNoteRoutes = require('./routes/consultationNoteRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const labResultRoutes = require('./routes/labResultRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes'); // Import appointment routes
const departmentRoutes = require('./routes/departmentRoutes'); // Assuming you'll create this file
const auditLogRoutes = require('./routes/auditLogRoutes');     // Assuming you'll create this file
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
// 4. Custom Error Handling Middleware
// This catches errors thrown by `express-async-handler` or other route handlers
const errorHandler = (err, req, res, next) => {
    // If status code is 200 (OK), it means an error was thrown where a 200 was implicitly set,
    // so we change it to 500 (Internal Server Error). Otherwise, use the already set status.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Only send stack trace in development environment for debugging
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// 5. Connect to MongoDB
connectDB();


// 6. Initialize Express app
const app = express();

// 7. Middleware Setup
// Enable CORS - crucial for your frontend to communicate with the backend
app.use(cors({
    // Allow requests from your specific frontend URL, or '*' for all origins in development
    origin: process.env.FRONTEND_URL || '*', // e.g., 'http://127.0.0.1:5500'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow cookies/authorization headers to be sent
    optionsSuccessStatus: 204 // For pre-flight requests
}));

// Body parser middleware to handle raw JSON data from incoming requests
app.use(express.json());

// Body parser middleware to handle URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'uploads' directory
// This allows your frontend to access uploaded files (e.g., PDFs, images)
// Example: http://localhost:PORT/uploads/lab_results/patient-1-timestamp.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 8. API Routes
// Mount your specific resource routes under their respective API paths
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/consultationnotes', consultationNoteRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/labresults', labResultRoutes);
app.use('/api/appointments', appointmentRoutes); // Mount appointment routes
app.use('/api/departments', departmentRoutes);
app.use('/api/auditlogs', auditLogRoutes);
app.use('/api/medicalrecords', medicalRecordRoutes);

// 9. Default Route for testing server status
app.get('/', (req, res) => {
    res.send('HealthCare Backend API is running!');
});

// 10. Apply Custom Error Handler Middleware
// This MUST be placed AFTER all routes and other middleware
// so it can catch errors that occur in them.
app.use(errorHandler);

// 11. Start the Server
const PORT = process.env.PORT || 3001; // Use the PORT from .env, or default to 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});