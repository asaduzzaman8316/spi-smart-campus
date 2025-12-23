const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createQuestion)
    .get(protect, getQuestions);

router.route('/:id')
    .put(protect, updateQuestion)
    .delete(protect, deleteQuestion);

module.exports = router;
