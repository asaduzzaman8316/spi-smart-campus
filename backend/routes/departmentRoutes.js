const express = require('express');
const router = express.Router();
const {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { resourceValidation, idValidation } = require('../validators/validators');

// Public routes
router.route('/').get(getDepartments);

// Protected routes (require admin)
router.route('/').post(protect, authorize('admin'), resourceValidation.create, createDepartment);
router.route('/:id').put(protect, authorize('admin'), resourceValidation.update, updateDepartment).delete(protect, authorize('admin'), idValidation, deleteDepartment);

module.exports = router;
