const Question = require('../models/Question');

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res) => {
    try {
        const {
            subjectName,
            subjectCode,
            department,
            semester,
            group,
            shift,
            content
        } = req.body;

        // Check if teacher already submitted a question for this subject
        const existingQuestion = await Question.findOne({
            teacher: req.user._id,
            subjectCode
        });

        if (existingQuestion) {
            return res.status(400).json({ message: 'You have already submitted a question for this subject.' });
        }

        const question = await Question.create({
            subjectName,
            subjectCode,
            department,
            semester,
            group,
            shift,
            content,
            teacher: req.user._id,
            teacherModel: req.user.userType === 'teacher' ? 'Teacher' : 'Admin',
            teacherName: req.user.name,
            teacherEmail: req.user.email
        });

        res.status(201).json(question);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get questions
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
    try {
        let query = {};

        // If not super_admin, only show own questions
        if (req.user.userType !== 'super_admin') {
            query.teacher = req.user._id;
        } else {
            // If super_admin, allow filtering
            if (req.query.department && req.query.department !== 'All') {
                query.department = req.query.department;
            }
            if (req.query.semester && req.query.semester !== 'All') {
                query.semester = req.query.semester;
            }
            if (req.query.shift && req.query.shift !== 'All') {
                query.shift = req.query.shift;
            }
            if (req.query.group && req.query.group !== 'All') {
                query.group = req.query.group;
            }
        }

        const questions = await Question.find(query).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if owner or admin
        if (
            question.teacher.toString() !== req.user._id.toString() &&
            req.user.userType !== 'super_admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to update this question' });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedQuestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if owner or admin
        if (
            question.teacher.toString() !== req.user._id.toString() &&
            req.user.userType !== 'super_admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }

        await question.deleteOne();
        res.json({ message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion
};
