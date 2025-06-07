// HealthCare/backend/controllers/departmentController.js

const asyncHandler = require('express-async-handler');
const Department = require('../models/Department'); // Assuming you have a Department model

// @desc    Add a new department
// @route   POST /api/departments
// @access  Private (Admin only)
const addDepartment = asyncHandler(async (req, res) => {
    const { name, specialization } = req.body;

    if (!name || !specialization) {
        res.status(400);
        throw new Error('Please provide department name and specialization.');
    }

    // Check if department already exists
    const departmentExists = await Department.findOne({ name });
    if (departmentExists) {
        res.status(400);
        throw new Error('Department with this name already exists.');
    }

    const department = await Department.create({
        name,
        specialization
    });

    if (department) {
        res.status(201).json({
            message: 'Department added successfully',
            data: department
        });
    } else {
        res.status(400);
        throw new Error('Invalid department data provided.');
    }
});

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin, Doctor, Nurse, Receptionist)
const getAllDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({});
    res.status(200).json(departments);
});

// @desc    Get a single department by ID
// @route   GET /api/departments/:id
// @access  Private (Admin, Doctor, Nurse, Receptionist)
const getDepartmentById = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        res.status(404);
        throw new Error('Department not found.');
    }

    res.status(200).json(department);
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
const updateDepartment = asyncHandler(async (req, res) => {
    const { name, specialization } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
        res.status(404);
        throw new Error('Department not found.');
    }

    // Check if another department with the new name already exists (if name is changed)
    if (name && name !== department.name) {
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment && existingDepartment._id.toString() !== department._id.toString()) {
            res.status(400);
            throw new Error('Another department with this name already exists.');
        }
    }

    department.name = name || department.name;
    department.specialization = specialization || department.specialization;

    const updatedDepartment = await department.save();

    res.status(200).json({
        message: 'Department updated successfully',
        data: updatedDepartment
    });
});

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        res.status(404);
        throw new Error('Department not found.');
    }

    await department.deleteOne(); // Mongoose 6+ method for deleting documents

    res.status(200).json({
        message: 'Department removed successfully',
        id: req.params.id
    });
});

module.exports = {
    addDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};