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
const { teacherValidation, idValidation } = require('../validators/validators');
// Public routes
router.route('/profile/:uid').get(getTeacherByUid);
router.route('/').get(getTeachers);

// Protected routes (require admin)
router.route('/').post(protect, authorize('admin'), createTeacher);
router.route('/register').post(registerTeacher);

// Update: Allow admin OR the teacher themselves to update their profile
router.route('/:id').put(protect, authorizeOwnerOrAdmin, updateTeacher).delete(protect, authorize('admin'), idValidation, deleteTeacher);
router.route('/unregister/:id').put(protect, authorize('admin'), idValidation, unregisterTeacher);

module.exports = router;
