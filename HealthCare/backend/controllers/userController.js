// HealthCare/backend/controllers/userController.js

const asyncHandler = require('express-async-handler'); // For handling async errors
const User = require('../models/User');               // User Mongoose Model
const bcrypt = require('bcryptjs');                   // For password hashing
const jwt = require('jsonwebtoken');                  // For creating JWT tokens

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, employeeId, roleKey } = req.body;

    // Basic validation
    // Changed '!!roleKey' to '!roleKey' to ensure it checks if roleKey is missing/empty
    if (!name || !email || !password || !role || !employeeId || !roleKey) {
        res.status(400);
        throw new Error('Please add all required fields: name, email, password, role, employeeId, roleKey');
    }

    // Check if user already exists with this email
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Check if employee ID is already registered
    const employeeIdExists = await User.findOne({ employeeId });
    if (employeeIdExists) {
        res.status(400);
        throw new Error('Employee ID already registered.');
    }

    // Role Key Validation
    let expectedKey;
    switch(role) {
        case 'doctor': expectedKey = process.env.DOCTOR_KEY; break;
        case 'nurse': expectedKey = process.env.NURSE_KEY; break;
        case 'receptionist': expectedKey = process.env.RECEPTIONIST_KEY; break;
        case 'admin': expectedKey = process.env.ADMIN_KEY; break;
        default:
            res.status(400);
            throw new Error('Invalid role provided.');
    }

    if (roleKey !== expectedKey) {
        res.status(401);
        throw new Error('Invalid role key for the selected role.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    const user = await User.create({
        name,
        email,
        password: hashedPassword, // Store hashed password
        role,
        employeeId,
    });

    if (user) {
        res.status(201).json({
            _id: user._id, // Use _id (MongoDB's ID)
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
            token: generateToken(user._id), // Generate and send token upon registration
            message: 'User registered successfully'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data provided');
    }
});

// @desc    Authenticate a user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Compare provided password with hashed password from DB
    // Assuming you have a method `matchPassword` on your User model (e.g., `userSchema.methods.matchPassword = async function(enteredPassword) { return await bcrypt.compare(enteredPassword, this.password); }`)
    // If not, you need to use `bcrypt.compare(password, user.password)` directly here
    if (user && (await bcrypt.compare(password, user.password))) { // Directly compare if no matchPassword method on model
        res.json({
            _id: user._id, // Use _id
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
            token: generateToken(user._id),
            message: 'Logged in successfully'
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

// @desc    Get current logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    // req.user is populated by the protect middleware based on the JWT token
    if (req.user) {
        res.status(200).json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            employeeId: req.user.employeeId,
        });
    } else {
        res.status(401);
        throw new Error('User not found in request (authentication failed)');
    }
});

// @desc    Update current logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // Only update password if provided
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        // Handle employeeId update - check for uniqueness if changed
        if (req.body.employeeId && user.employeeId !== req.body.employeeId) {
            const existingEmployee = await User.findOne({ employeeId: req.body.employeeId });
            if (existingEmployee && existingEmployee._id.toString() !== user._id.toString()) {
                res.status(400);
                throw new Error('New Employee ID already exists.');
            }
            user.employeeId = req.body.employeeId;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            employeeId: updatedUser.employeeId,
            token: generateToken(updatedUser._id), // Generate new token as profile might change
        });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});


// @desc    Get all users (for Admin Dashboard)
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = asyncHandler(async (req, res) => {
    // This route is protected by `protect` and `authorize(['admin'])` middleware,
    // so we know req.user exists and has 'admin' role here.
    const users = await User.find({}).select('-password'); // Fetch all users, but exclude their passwords
    res.status(200).json({
        message: 'Users fetched successfully',
        data: users
    });
});

// @desc    Get all doctors (users with role 'doctor')
// @route   GET /api/users/doctors
// @access  Private (Accessible by Receptionist, Admin, Nurse)
const getDoctors = asyncHandler(async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name email employeeId');
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server error: Could not fetch doctors.' });
    }
});


// @desc    Update a user's role by ID (Admin function)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body; // Only role is expected for this specific update

    if (!role || !['admin', 'doctor', 'nurse', 'receptionist'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role specified. Allowed roles: admin, doctor, nurse, receptionist');
    }

    const user = await User.findById(req.params.id); // Get user by ID from URL params

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    // Update the user's role
    user.role = role;
    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        employeeId: updatedUser.employeeId,
        message: 'User role updated successfully'
    });
});

// @desc    Delete a user by ID (Admin function)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Optional: Prevent deleting the currently logged-in admin user
    if (req.user && user._id.toString() === req.user._id.toString()) {
        res.status(403);
        throw new Error('Cannot delete your own account while logged in.');
    }

    await user.deleteOne(); // Mongoose 6+ method for deleting documents

    res.status(200).json({
        message: 'User deleted successfully',
        id: req.params.id
    });
});


// Export all functions that need to be accessible from routes
module.exports = {
    registerUser,
    loginUser,
    getProfile,         // Exported as 'getProfile'
    updateProfile,      // Exported as 'updateProfile'
    getUsers,           // Exported as 'getUsers'
    deleteUser,         // Exported as 'deleteUser'
    updateUserRole,     // Exported as 'updateUserRole'
    getDoctors          // Exported as 'getDoctors'
};
