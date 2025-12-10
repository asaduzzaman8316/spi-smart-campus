const express = require('express');
const router = express.Router();
const {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    deleteRoutine
} = require('../controllers/routineController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Removed for public access
const { idValidation } = require('../validators/validators');
// Public routes
router.route('/').get(getRoutines);
router.route('/find').get(findRoutine);

// Public routes (formerly protected)
router.route('/').post(createOrUpdateRoutine);
router.route('/:id').delete(idValidation, deleteRoutine);

module.exports = router;
