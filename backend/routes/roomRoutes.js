const express = require('express');
const router = express.Router();
const {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { idValidation } = require('../validators/validators');

// Public routes
router.route('/').get(getRooms);

// Protected routes (require admin)
router.route('/').post(protect, authorize('admin'), createRoom);
router.route('/:id').put(protect, authorize('admin'), updateRoom).delete(protect, authorize('admin'), idValidation, deleteRoom);

module.exports = router;
