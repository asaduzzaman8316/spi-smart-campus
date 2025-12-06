const Teacher = require('../models/Teacher');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Public
const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private
const createTeacher = async (req, res) => {
    try {
        console.log('Creating teacher with data:', req.body);
        const teacher = await Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private
const updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
};
