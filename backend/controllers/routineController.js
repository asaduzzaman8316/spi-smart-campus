const Routine = require('../models/Routine');

// @desc    Get all routines
// @route   GET /api/routines
// @access  Public
const getRoutines = async (req, res) => {
    try {
        const { department, semester, shift, group } = req.query;
        let query = {};

        if (department) query.department = department;
        if (semester) query.semester = semester;
        if (shift) query.shift = shift;
        if (group) query.group = group;

        const routines = await Routine.find(query);
        res.status(200).json(routines);
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
// @access  Private
const createOrUpdateRoutine = async (req, res) => {
    try {
        const { department, semester, shift, group, days } = req.body;

        // Check availability logic could go here (conflict detection), 
        // but often handled on frontend or separate helper.

        // Upsert logic
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
            upsert: true // Create if not exists
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
