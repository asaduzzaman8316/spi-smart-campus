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
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { teacherValidation, idValidation } = require('../validators/validators');
const { paginate } = require('../middleware/pagination');

// Public routes
router.route('/profile/:uid').get(getTeacherByUid);

// Protected routes (require admin)
router.route('/').get(verifyToken, requireAdmin, paginate, getTeachers).post(verifyToken, requireAdmin, teacherValidation.create, createTeacher);
router.route('/register').post(authLimiter, teacherValidation.register, registerTeacher);

router.route('/:id').put(verifyToken, requireAdmin, teacherValidation.update, updateTeacher).delete(verifyToken, requireAdmin, idValidation, deleteTeacher);
router.route('/unregister/:id').put(verifyToken, requireAdmin, idValidation, unregisterTeacher);

module.exports = router;
