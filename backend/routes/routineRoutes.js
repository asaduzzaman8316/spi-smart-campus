const express = require('express');
const router = express.Router();
const {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    deleteRoutine
} = require('../controllers/routineController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { idValidation } = require('../validators/validators');
const { paginate } = require('../middleware/pagination');

// Public routes
router.route('/').get(paginate, getRoutines);
router.route('/find').get(findRoutine);

// Protected routes (require admin)
router.route('/').post(protect, authorize('admin'), createOrUpdateRoutine);
router.route('/:id').delete(protect, authorize('admin'), idValidation, deleteRoutine);

module.exports = router;
