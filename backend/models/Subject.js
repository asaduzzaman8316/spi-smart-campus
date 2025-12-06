const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        // unique: true // Code might be same across departments? Safer to not mandate global unique unless sure.
    },
    department: {
        type: String, // Or Ref if we want strict relation
        required: true
    },
    semester: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
