const Department = require('../models/Department');
const Teacher = require('../models/Teacher');
const Routine = require('../models/Routine');

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res) => {
    try {
        const departmentCount = await Department.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        // const studentCount = ... // If we had students
        const routineCount = await Routine.countDocuments();

        res.status(200).json({
            departments: departmentCount,
            teachers: teacherCount,
            routines: routineCount
            // Add more as needed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats
};
