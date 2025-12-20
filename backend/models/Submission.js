const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    studentId: {
        type: String, // Can be user ID or 'guest'
        default: 'guest'
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    roll: {
        type: String,
        required: true
    },
    // Updated to store multiple answers
    answers: [{
        questionId: String, // Or index/text if simple
        questionText: String, // Snapshot of question
        selectedOption: String,
        isCorrect: Boolean,
        correctAnswer: String // Snapshot for review
    }],
    totalQuestions: {
        type: Number,
        required: true
    },
    correctCount: {
        type: Number,
        required: true
    },
    score: {
        type: Number, // Percentage or raw score
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate submission index
submissionSchema.index({ quizId: 1, roll: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
