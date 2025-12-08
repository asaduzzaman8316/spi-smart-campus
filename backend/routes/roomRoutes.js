const express = require('express');
const router = express.Router();
const {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
} = require('../controllers/roomController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { roomValidation, idValidation } = require('../validators/validators');

// Public routes
router.route('/').get(getRooms);

// Protected routes (require admin)
router.route('/').post(verifyToken, requireAdmin, roomValidation.create, createRoom);
router.route('/:id').put(verifyToken, requireAdmin, roomValidation.update, updateRoom).delete(verifyToken, requireAdmin, idValidation, deleteRoom);

module.exports = router;
