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
// const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/authMiddleware'); // Removed for public access
const { idValidation } = require('../validators/validators');
// Public routes
router.route('/profile/:uid').get(getTeacherByUid);
router.route('/').get(getTeachers);

// Public routes (formerly protected)
router.route('/').post(createTeacher);
router.route('/register').post(registerTeacher);

// Update: Allow anyone to update/delete/unregister (Public)
router.route('/:id').put(updateTeacher).delete(idValidation, deleteTeacher);
router.route('/unregister/:id').put(idValidation, unregisterTeacher);

module.exports = router;
