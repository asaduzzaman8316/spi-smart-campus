const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous'
    },
    studentId: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    contact: {
        type: String,
        default: ''
    },
    isAnonymous: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['Academic', 'Facilities', 'Harassment', 'Suggestion', 'Other'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
