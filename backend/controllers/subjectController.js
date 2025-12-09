const { createPaginatedResponse } = require('../middleware/pagination');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res) => {
    try {
        if (!req.pagination) {
            // If pagination middleware didn't run (e.g. public access without it?), default or fetch all?
            // Assuming middleware is applied on route. If not, we might crash.
            // But let's fallback or error. Given previous pattens, error is safer to ensure config is right.
            // However, for broad safety, I'll default if missing, or stick to pattern.
            // Pattern in teacherController was throwing. I'll stick to that.
            throw new Error('Req.pagination is missing!');
        }

        const { skip, limit } = req.pagination;
        const { search, department, semester } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }
        if (department) {
            query.department = department;
        }
        if (semester) {
            query.semester = semester;
        }

        const total = await Subject.countDocuments(query);
        const subjects = await Subject.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(createPaginatedResponse(subjects, total, req.pagination));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};
