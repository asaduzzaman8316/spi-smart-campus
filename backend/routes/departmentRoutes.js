const express = require('express');
const router = express.Router();
const {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { resourceValidation, idValidation } = require('../validators/validators');

// Public routes
router.route('/').get(getDepartments);

// Protected routes (require admin)
router.route('/').post(verifyToken, requireAdmin, resourceValidation.create, createDepartment);
router.route('/:id').put(verifyToken, requireAdmin, resourceValidation.update, updateDepartment).delete(verifyToken, requireAdmin, idValidation, deleteDepartment);

module.exports = router;
