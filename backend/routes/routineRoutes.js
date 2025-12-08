const express = require('express');
const router = express.Router();
const {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    deleteRoutine
} = require('../controllers/routineController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { idValidation } = require('../validators/validators');
const { paginate } = require('../middleware/pagination');

// Public routes
router.route('/').get(paginate, getRoutines);
router.route('/find').get(findRoutine);

// Protected routes (require admin)
router.route('/').post(verifyToken, requireAdmin, createOrUpdateRoutine);
router.route('/:id').delete(verifyToken, requireAdmin, idValidation, deleteRoutine);

module.exports = router;
