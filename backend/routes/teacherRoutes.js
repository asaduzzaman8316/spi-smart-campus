const express = require('express');
const router = express.Router();
const {
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    registerTeacher,
    getTeacherByUid,
    unregisterTeacher
} = require('../controllers/teacherController');
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { teacherValidation, idValidation } = require('../validators/validators');
const { paginate } = require('../middleware/pagination');

// Public routes
router.route('/profile/:uid').get(getTeacherByUid);
router.route('/').get(paginate, getTeachers);

// Protected routes (require admin)
router.route('/').post(protect, authorize('admin'), teacherValidation.create, createTeacher);
router.route('/register').post(authLimiter, teacherValidation.register, registerTeacher);

// Update: Allow admin OR the teacher themselves to update their profile
router.route('/:id').put(protect, authorizeOwnerOrAdmin, teacherValidation.update, updateTeacher).delete(protect, authorize('admin'), idValidation, deleteTeacher);
router.route('/unregister/:id').put(protect, authorize('admin'), idValidation, unregisterTeacher);

module.exports = router;
