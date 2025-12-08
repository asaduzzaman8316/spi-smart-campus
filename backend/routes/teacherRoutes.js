const express = require('express');
const router = express.Router();
const {
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    registerTeacher,
    getTeacherByUid
} = require('../controllers/teacherController');

router.route('/').get(getTeachers).post(createTeacher);
router.route('/register').post(registerTeacher);
router.route('/profile/:uid').get(getTeacherByUid);
router.route('/:id').put(updateTeacher).delete(deleteTeacher);

module.exports = router;
