const express = require('express');
const router = express.Router();
const {
    getNotices,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin', 'super_admin', 'department_admin'), createNotice);
router.put('/:id', protect, authorize('admin', 'super_admin', 'department_admin'), updateNotice);
router.delete('/:id', protect, authorize('admin', 'super_admin', 'department_admin'), deleteNotice);

module.exports = router;
