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
const { idValidation } = require('../validators/validators');

router.route('/register').post(registerAdmin);

router.route('/profile')
    .get(protect, authorize('admin'), getAdminProfile)
    .put(protect, authorize('admin'), updateAdminProfile);

router.route('/')
    .get(protect, authorize('super_admin'), getAdmins)
    .post(protect, authorize('super_admin'), createAdmin);

router.route('/:id')
    .delete(protect, authorize('super_admin'), idValidation, deleteAdmin);

router.route('/unregister/:id')
    .put(protect, authorize('super_admin'), idValidation, unregisterAdmin);

module.exports = router;
