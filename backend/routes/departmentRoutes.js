const express = require('express');
const router = express.Router();
const {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Removed for public access
const { resourceValidation, idValidation } = require('../validators/validators');

// Public routes
router.route('/').get(getDepartments);

// Public routes (formerly protected)
router.route('/').post(resourceValidation.create, createDepartment);
router.route('/:id').put(resourceValidation.update, updateDepartment).delete(idValidation, deleteDepartment);

module.exports = router;
