// HealthCare/backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Keep this, it's good practice!
const User = require('../models/User'); // Path to your User model

// @desc    Protect routes - ensures only authenticated users can access
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by the ID in the token and attach it to the request object
            req.user = await User.findById(decoded.id).select('-password');

            // If user not found (e.g., deleted from DB after token was issued)
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Authentication Error:', error); // Log the detailed error
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed or expired');
        }
    }

    if (!token) {
        res.status(401); // Unauthorized
        throw new Error('Not authorized, no token provided');
    }
});

// @desc    Authorize specific roles - ensures only users with allowed roles can access
const authorize = (roles = []) => {
    // If roles param is a single string, convert it to an array for consistent handling
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // First, check if req.user exists (meaning `protect` middleware ran before `authorize`)
        if (!req.user) {
            res.status(401); // Unauthorized (user not authenticated at all)
            throw new Error('Not authenticated, please login');
        }

        // Then, check if the user's role is included in the allowed roles array
        // If no roles are specified for this authorize call (roles.length is 0), then all authenticated users are allowed.
        if (roles.length === 0 || roles.includes(req.user.role)) {
            next(); // User's role is authorized, proceed
        } else {
            res.status(403); // Forbidden
            throw new Error('Not authorized to access this route. Insufficient role permissions.');
        }
    };
};

// @desc    Generate a JWT token for a user ID
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

module.exports = { protect, authorize, generateToken }; // Export all three functions