const express = require('express');
const router = express.Router();
const {
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    registerTeacher,
    getTeacherByUid,
    unregisterTeacher,
    getAdminTeachers
} = require('../controllers/teacherController');

const { idValidation } = require('../validators/validators');

router.route('/profile/:uid').get(getTeacherByUid);
router.route('/admins').get(getAdminTeachers);
router.route('/').get(getTeachers);

router.route('/').post(createTeacher);
router.route('/register').post(registerTeacher);

router.route('/:id')
    .put(updateTeacher)
    .delete(idValidation, deleteTeacher);

router.route('/unregister/:id').put(idValidation, unregisterTeacher);

module.exports = router;
