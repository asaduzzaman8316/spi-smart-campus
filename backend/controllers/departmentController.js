const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin (Public for now as no auth)
const createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json({ message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
