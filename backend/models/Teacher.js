const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        // unique: true
    },
    phone: String,
    department: {
        type: String,
        required: true
    },
    designation: String,
    image: String,
    // Add other fields from frontend analysis if needed
}, {
    timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
