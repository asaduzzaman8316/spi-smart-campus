const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getComplaints,
    getPublicComplaints,
    updateComplaintStatus,
    deleteComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to submit
router.post('/', createComplaint);
router.get('/public', getPublicComplaints);

// Protected routes to manage
router.get('/', protect, authorize('admin', 'super_admin'), getComplaints);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateComplaintStatus);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteComplaint);

module.exports = router;
