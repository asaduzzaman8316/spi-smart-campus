const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const jwt = require('jsonwebtoken');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher)
const createQuiz = async (req, res) => {
    try {
        const { title, subject, questions, accessCode, department, semester, shift, group } = req.body;

        if (!questions || questions.length === 0) {
            return res.status(400).json({ message: 'At least one question is required' });
        }

        const quiz = await Quiz.create({
            title,
            subject,
            questions, // Array of objects
            accessCode,
            department,
            semester,
            shift,
            group,
            createdBy: req.user._id,
            createdByName: req.user.name
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all active quizzes (for students) with Filters
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
    try {
        const { department, semester, shift, group } = req.query;
        let query = {};

        if (department && department !== 'All') query.department = department;
        if (semester && semester !== 'All') query.semester = semester;
        if (shift && shift !== 'All') query.shift = shift;
        if (group && group !== 'All') query.group = group;

        const quizzes = await Quiz.find(query)
            .select('-accessCode -questions.correctAnswer')
            .sort('-createdAt');

        res.json({ data: quizzes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quizzes created by logged in teacher
// @route   GET /api/quizzes/my-quizzes
// @access  Private
const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id }).sort('-createdAt');
        res.json({ data: quizzes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete quiz and its submissions
// @route   DELETE /api/quizzes/:id
// @access  Private
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check ownership
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await quiz.deleteOne();
        await Submission.deleteMany({ quizId: quiz._id });

        res.json({ message: 'Quiz removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Access Code
// @route   POST /api/quizzes/:id/access
// @access  Public
// @desc    Verify Access Code
// @route   POST /api/quizzes/:id/access
// @access  Public
const verifyQuizAccess = async (req, res) => {
    try {
        const { accessCode } = req.body;
        // MUST select accessCode explicitly because schema has select: false
        const quiz = await Quiz.findById(req.params.id).select('+accessCode');

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        if (quiz.status === 'Closed') return res.status(400).json({ message: 'Quiz is closed' });

        const isMatch = await quiz.matchAccessCode(accessCode);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Access Code' });
        }

        res.json({
            message: 'Access Granted',
            data: {
                department: quiz.department,
                semester: quiz.semester,
                shift: quiz.shift,
                subject: quiz.subject,
                title: quiz.title
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Quiz Details for Student (Start Quiz)
// @route   GET /api/quizzes/:id/start
// @access  Public
const getQuizForStudent = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Strip correct answers
        const safeQuestions = quiz.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options
        }));

        res.json({
            data: {
                _id: quiz._id,
                title: quiz.title,
                subject: quiz.subject,
                department: quiz.department,
                semester: quiz.semester,
                shift: quiz.shift,
                questions: safeQuestions
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Public
const submitQuiz = async (req, res) => {
    try {
        const { studentId, department, semester, shift, roll, answers } = req.body;
        // answers: [{ questionId, selectedOption }]
        const quizId = req.params.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        if (quiz.status === 'Closed') return res.status(400).json({ message: 'Quiz is closed' });

        // Check Duplicate Submission
        const existing = await Submission.findOne({ quizId, roll });
        if (existing) {
            return res.status(400).json({ message: 'You have already submitted this quiz.' });
        }

        // Calculate Score
        let correctCount = 0;
        const evaluatedAnswers = quiz.questions.map(q => {
            const studentAns = answers.find(a => a.questionId === q._id.toString());
            const selected = studentAns ? studentAns.selectedOption : null;
            const isCorrect = selected === q.correctAnswer;

            if (isCorrect) correctCount++;

            return {
                questionId: q._id,
                questionText: q.questionText,
                selectedOption: selected,
                isCorrect: isCorrect,
                correctAnswer: q.correctAnswer
            };
        });

        const totalQuestions = quiz.questions.length;
        const score = (correctCount / totalQuestions) * 100;

        await Submission.create({
            quizId,
            studentId,
            department,
            semester,
            shift,
            roll,
            answers: evaluatedAnswers,
            totalQuestions,
            correctCount,
            score
        });

        // Requirement: "enter submit not show the result just show submit successful"
        res.status(201).json({
            success: true,
            message: 'Submission successful! Your response has been recorded.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed results for teacher
// @route   GET /api/quizzes/:id/results
// @access  Private
const getQuizResults = async (req, res) => {
    try {
        const { department, semester, shift, group } = req.query;
        let query = { quizId: req.params.id };

        if (department && department !== 'All') query.department = department;
        if (semester && semester !== 'All') query.semester = semester;
        if (shift && shift !== 'All') query.shift = shift;
        if (group && group !== 'All') query.group = group;

        const submissions = await Submission.find(query).sort('-score');
        const quiz = await Quiz.findById(req.params.id);

        // Calculate Overview
        const totalAttempts = submissions.length;
        const totalScore = submissions.reduce((acc, sub) => acc + sub.score, 0);
        const avgScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;

        // Pass/Fail (Arbitrary 50%)
        const passedData = submissions.filter(s => s.score >= 50).length;

        // Strip correct answers from response IF we wanted to be super secure, 
        // but this is teacher view so they need to see it.

        res.json({
            overview: {
                totalAttempts,
                avgScore,
                passedCount: passedData,
                failedCount: totalAttempts - passedData
            },
            data: submissions.map(s => ({
                _id: s._id,
                roll: s.roll,
                studentName: 'Student', // Placeholder
                department: s.department,
                semester: s.semester,
                score: s.score,
                correctCount: s.correctCount,
                totalQuestions: s.totalQuestions,
                answers: s.answers // Detailed answers
            })),
            quizTitle: quiz.title
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleQuizStatus = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        quiz.status = quiz.status === 'Active' ? 'Closed' : 'Active';
        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuiz,
    getQuizzes,
    getMyQuizzes,
    deleteQuiz,
    verifyQuizAccess,
    getQuizForStudent,
    submitQuiz,
    getQuizResults,
    toggleQuizStatus
};
