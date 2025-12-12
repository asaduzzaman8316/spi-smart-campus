const Notice = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res) => {
    try {
        const { category, department, limit } = req.query;
        let query = {};

        if (category && category !== 'All') query.category = category;
        if (department && department !== 'All') {
            query.$or = [{ department: 'All' }, { department: department }];
        }

        let noticesQuery = Notice.find(query).sort({ isPinned: -1, createdAt: -1 });

        if (limit) {
            noticesQuery = noticesQuery.limit(parseInt(limit));
        }

        const notices = await noticesQuery;

        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Public
const getNoticeById = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }
        res.status(200).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Admin only)
const createNotice = async (req, res) => {
    try {
        const { title, content, category, targetAudience, department, isPinned } = req.body;

        const notice = await Notice.create({
            title,
            content,
            category,
            targetAudience,
            department: department || 'All',
            isPinned: isPinned || false,
            postedBy: req.user.id,
            postedByName: req.user.name || 'Admin', // Assuming req.user has name from auth middleware
        });

        // Create Notification for Admins
        const Notification = require('../models/Notification');

        // Notify Admins
        await Notification.create({
            recipientType: 'all_admins',
            senderId: req.user._id,
            title: 'New Notice Posted',
            message: `${req.user.name || 'Admin'} posted a new notice: "${title}"`,
            type: 'info',
            link: '/dashboard?view=notices',
        });

        // Notify Teachers if applicable
        if (targetAudience === 'Teachers' || targetAudience === 'All') {
            await Notification.create({
                recipientType: 'all_teachers',
                senderId: req.user._id,
                title: 'New Notice: ' + title,
                message: `New notice posted for teachers: "${title}"`,
                type: 'info',
                link: '/dashboard?view=notices',
            });
        }

        res.status(201).json(notice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private (Admin only)
const updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        // Check permissions if needed (e.g., only creator or super admin)

        const updatedNotice = await Notice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedNotice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        await notice.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Notice deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getNotices,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice
};
