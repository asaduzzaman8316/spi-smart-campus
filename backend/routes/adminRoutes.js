const express = require('express');
const router = express.Router();
const {
    getAdmins,
    getAdminProfile,
    createAdmin,
    registerAdmin,
    updateAdminProfile,
    deleteAdmin,
    unregisterAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { paginate } = require('../middleware/pagination');
const { idValidation } = require('../validators/validators');

// Public routes
router.route('/register').post(registerAdmin);

// Protected routes (any admin)
router.route('/profile')
    .get(protect, authorize('admin'), getAdminProfile)
    .put(protect, authorize('admin'), updateAdminProfile);

// Protected routes (super admin only)
router.route('/')
    .get(protect, authorize('super_admin'), paginate, getAdmins)
    .post(protect, authorize('super_admin'), createAdmin);

router.route('/:id')
    .delete(protect, authorize('super_admin'), idValidation, deleteAdmin);

router.route('/unregister/:id')
    .put(protect, authorize('super_admin'), idValidation, unregisterAdmin);

module.exports = router;
