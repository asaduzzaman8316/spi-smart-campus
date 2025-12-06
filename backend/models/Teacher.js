const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    phone: String,
    department: {
        type: String,
        required: true
    },
    role: String,
    shift: String,
    image: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
