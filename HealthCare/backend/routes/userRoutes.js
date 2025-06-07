// HealthCare/backend/routes/userRoutes.js

const express = require('express');
const router = express.Router(); // <--- This line is critical!

// Import controller functions that handle the business logic for user operations
// Ensure these names match what your userController.js actually exports.
const {
    registerUser,
    loginUser,
    getUsers,           // For getting all users (admin only)
    deleteUser,         // For deleting users (admin only)
    updateUserRole,     // For updating user roles (admin only)
    getProfile,         // CORRECTED: Using 'getProfile' to match userController.js export
    updateProfile,      // CORRECTED: Using 'updateProfile' to match userController.js export
    getDoctors          // For fetching doctor list
} = require('../controllers/userController');

// Import middleware for authentication (protect) and role-based authorization (authorize)
const { protect, authorize } = require('../middleware/authMiddleware');


// Public routes (no authentication required)
router.post('/signup', registerUser); // Route for new user registration
router.post('/login', loginUser);     // Route for user login

// Protected routes (require authentication via JWT token)

// GET all users - typically only accessible by 'admin'
router.get('/', protect, authorize(['admin']), getUsers);

// GET logged-in user's profile
router.get('/profile', protect, getProfile); // CORRECTED: Using 'getProfile'

// PUT (update) logged-in user's profile
router.put('/profile', protect, updateProfile); // CORRECTED: Using 'updateProfile'

// PUT (update) a user's role by ID - typically only accessible by 'admin'
router.put('/:id', protect, authorize(['admin']), updateUserRole);

// DELETE a user by ID - typically only accessible by 'admin'
router.delete('/:id', protect, authorize(['admin']), deleteUser);

// GET all doctors - accessible by specific roles
router.get('/doctors', protect, authorize(['receptionist', 'admin', 'nurse']), getDoctors);

module.exports = router