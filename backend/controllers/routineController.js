const Routine = require('../models/Routine');

// @desc    Get all routines
// @route   GET /api/routines
const getRoutines = async (req, res) => {
    try {
        const { department, semester, shift, group } = req.query;

        const query = {};
        if (department) query.department = department;
        if (semester) query.semester = semester;
        if (shift) query.shift = shift;
        if (group) query.group = group;

        const routines = await Routine.find(query)
            .select('-__v')
            .sort({ department: 1, semester: 1, shift: 1, group: 1 })
            .lean();

        res.json({
            success: true,
            count: routines.length,
            data: routines
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single routine by complex ID or params
// @route   GET /api/routines/find
// @access  Public
const findRoutine = async (req, res) => {
    try {
        const { department, semester, shift, group } = req.query;
        const routine = await Routine.findOne({ department, semester, shift, group });
        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }
        res.status(200).json(routine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or Update a routine
// @route   POST /api/routines
const createOrUpdateRoutine = async (req, res) => {
    try {
        const { department, semester, shift, group, days } = req.body;

        const filter = { department, semester, shift, group };
        const update = {
            department,
            semester,
            shift,
            group,
            days,
            lastUpdated: Date.now()
        };

        const routine = await Routine.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true
        });

        res.status(200).json(routine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a routine
// @route   DELETE /api/routines/:id
// @access  Private
const deleteRoutine = async (req, res) => {
    try {
        const routine = await Routine.findByIdAndDelete(req.params.id);
        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }
        res.status(200).json({ message: 'Routine deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    deleteRoutine
};
