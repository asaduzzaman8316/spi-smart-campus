const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String, // e.g., Theory, Lab
        default: 'Theory'
    },
    capacity: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
