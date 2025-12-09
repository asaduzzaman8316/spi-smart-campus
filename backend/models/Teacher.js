const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: String,
    department: {
        type: String,
        required: true
    },
    image: {
        type: String, // URL to the image
        default: ''
    },
    password: {
        type: String,
        required: true,
        select: false // Do not return password by default
    },
    userType: {
        type: String,
        default: 'teacher',
        enum: ['teacher', 'admin', 'super_admin']
    },
    role: {
        type: String, // Job title/position (e.g., "Professor", "Lecturer", "Assistant Professor")
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    shift: String,
}, {
    timestamps: true
});

// Indexes for better query performance
teacherSchema.index({ department: 1 });
teacherSchema.index({ shift: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);
