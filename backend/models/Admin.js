const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        required: true,
        enum: ['super_admin', 'department_admin'],
        default: 'department_admin'
    },
    department: {
        type: String,
        // Only required for department_admin
        required: function () {
            return this.role === 'department_admin';
        }
    },
    phone: String,
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for better query performance
// Note: email already has index from unique: true
adminSchema.index({ firebaseUid: 1 });
adminSchema.index({ role: 1 });

module.exports = mongoose.model('Admin', adminSchema);
