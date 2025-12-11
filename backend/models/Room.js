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
    capacity: Number,
    location: {
        type: String,
        enum: ['Computer Building', 'Administration Building', 'New Building', 'Old Building'], // Added flexible options
        default: 'Computer Building'
    },
    department: {
        type: String,
        required: false // Optional, mainly for Labs
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
