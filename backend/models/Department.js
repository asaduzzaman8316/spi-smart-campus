const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        // unique: true 
    },
    description: String,
    image: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
