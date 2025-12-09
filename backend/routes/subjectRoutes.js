const express = require('express');
const router = express.Router();
const {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { subjectValidation, idValidation } = require('../validators/validators');

// Public routes
router.route('/').get(getSubjects);

// Protected routes (require admin)
router.route('/').post(protect, authorize('admin'), subjectValidation.create, createSubject);
router.route('/:id').put(protect, authorize('admin'), subjectValidation.update, updateSubject).delete(protect, authorize('admin'), idValidation, deleteSubject);

module.exports = router;
