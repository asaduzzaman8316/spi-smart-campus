const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    recipientType: {
        type: String,
        enum: ['admin', 'super_admin', 'all_admins', 'teacher', 'all_teachers'],
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        enum: ['Admin', 'Teacher']
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    link: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
