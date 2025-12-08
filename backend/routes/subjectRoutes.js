const express = require('express');
const router = express.Router();
const {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject
} = require('../controllers/subjectController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { subjectValidation, idValidation } = require('../validators/validators');

// Public routes
router.route('/').get(getSubjects);

// Protected routes (require admin)
router.route('/').post(verifyToken, requireAdmin, subjectValidation.create, createSubject);
router.route('/:id').put(verifyToken, requireAdmin, subjectValidation.update, updateSubject).delete(verifyToken, requireAdmin, idValidation, deleteSubject);

module.exports = router;
