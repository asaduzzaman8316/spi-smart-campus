const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const userType = req.user.userType; // 'admin' or 'super_admin' or 'teacher'

        let query = {
            $or: [
                { recipientType: 'all_admins' },
                { recipientType: userType }
            ]
        };

        if (userType === 'teacher') {
            query = {
                $or: [
                    { recipientType: 'all_teachers' },
                    { recipientType: 'teacher', recipientId: req.user._id } // Specific teacher
                ]
            };
        }

        // Exclude own notifications (suppress self-notification)
        // Using $ne with the user's ID
        if (req.user && req.user._id) {
            query.senderId = { $ne: req.user._id };
        }

        // If specifically targeted by ID (future proofing)
        // if (req.user._id) {
        //     query.$or.push({ recipientId: req.user._id });
        // }

        // We want to show only unread or recent? For now, fetch last 20
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(20);

        // Count unread
        const unreadCount = await Notification.countDocuments({
            ...query,
            isRead: false
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const userType = req.user.userType;
        let query = {
            $or: [
                { recipientType: 'all_admins' },
                { recipientType: userType }
            ],
            isRead: false
        };

        if (userType === 'teacher') {
            query = {
                $or: [
                    { recipientType: 'all_teachers' },
                    { recipientType: 'teacher', recipientId: req.user._id }
                ],
                isRead: false
            };
        }

        await Notification.updateMany(
            query,
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
