const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizzes,
    getMyQuizzes,
    deleteQuiz,
    verifyQuizAccess,
    getQuizForStudent,
    submitQuiz,
    getQuizResults,
    toggleQuizStatus
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists

// Public routes (for students)
router.get('/', getQuizzes); // List active quizzes
router.post('/:id/access', verifyQuizAccess); // Check code
router.get('/:id/start', getQuizForStudent); // Get question (after code check)
router.post('/:id/submit', submitQuiz); // Submit answer

// Protected routes (for teachers)
router.get('/my-quizzes', protect, getMyQuizzes);
router.post('/', protect, createQuiz);
router.delete('/:id', protect, deleteQuiz);
router.put('/:id/status', protect, toggleQuizStatus);
router.get('/:id/results', protect, getQuizResults);

module.exports = router;
