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
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined values to be non-unique (i.e., multiple teachers without accounts)
    },
    role: {
        type: String,
        default: 'teacher',
        enum: ['teacher', 'admin']
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
