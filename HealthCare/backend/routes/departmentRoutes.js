// HealthCare/backend/routes/departmentRoutes.js

const express = require('express');
const router = express.Router();
const {
    addDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/departments
// @desc    Add a new department
// @access  Private (Admin only)
router.post('/', protect, authorize(['admin']), addDepartment);

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private (Admin, Doctor, Nurse, Receptionist - all relevant staff)
router.get('/', protect, authorize(['admin', 'doctor', 'nurse', 'receptionist']), getAllDepartments);

// @route   GET /api/departments/:id
// @desc    Get a single department by ID
// @access  Private (Admin, Doctor, Nurse, Receptionist)
router.get('/:id', protect, authorize(['admin', 'doctor', 'nurse', 'receptionist']), getDepartmentById);

// @route   PUT /api/departments/:id
// @desc    Update a department
// @access  Private (Admin only)
router.put('/:id', protect, authorize(['admin']), updateDepartment);

// @route   DELETE /api/departments/:id
// @desc    Delete a department
// @access  Private (Admin only)
router.delete('/:id', protect, authorize(['admin']), deleteDepartment);

module.exports = router;