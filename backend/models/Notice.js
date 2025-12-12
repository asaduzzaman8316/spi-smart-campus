const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a notice title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please add notice content']
    },
    category: {
        type: String,
        enum: ['General', 'Academic', 'Exam', 'Event', 'Urgent'],
        default: 'General'
    },
    targetAudience: {
        type: String,
        enum: ['All', 'Teachers', 'Students'],
        default: 'All'
    },
    department: {
        type: String,
        default: 'All' // Can be specific department name or 'All'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    postedByName: {
        type: String,
        required: true
    },
    // Official Document Fields
    memoNo: {
        type: String,
        default: ''
    },
    signatoryName: {
        type: String,
        default: 'Engr. Md. Rihan Uddin' // Default Principal
    },
    signatoryDesignation: {
        type: String,
        default: 'Principal (Acting)'
    },
    ccList: [{
        type: String
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    attachments: [{
        name: String,
        url: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Notice', noticeSchema);
