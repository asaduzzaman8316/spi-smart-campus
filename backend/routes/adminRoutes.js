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
const { verifyToken, requireSuperAdmin, requireAnyAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { paginate } = require('../middleware/pagination');
const { idValidation } = require('../validators/validators');

// Public routes (with rate limiting)
router.route('/register').post(authLimiter, registerAdmin);

// Protected routes (any admin)
router.route('/profile')
    .get(verifyToken, requireAnyAdmin, getAdminProfile)
    .put(verifyToken, requireAnyAdmin, updateAdminProfile);

// Protected routes (super admin only)
router.route('/')
    .get(verifyToken, requireSuperAdmin, paginate, getAdmins)
    .post(verifyToken, requireSuperAdmin, createAdmin);

router.route('/:id')
    .delete(verifyToken, requireSuperAdmin, idValidation, deleteAdmin);

router.route('/unregister/:id')
    .put(verifyToken, requireSuperAdmin, idValidation, unregisterAdmin);

module.exports = router;
