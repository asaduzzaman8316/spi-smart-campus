const express = require('express');
const router = express.Router();
const {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { resourceValidation, idValidation } = require('../validators/validators');

router.route('/').get(getDepartments);

router.route('/').post(resourceValidation.create, createDepartment);
router.route('/:id')
    .put(resourceValidation.update, updateDepartment)
    .delete(idValidation, deleteDepartment);

module.exports = router;
