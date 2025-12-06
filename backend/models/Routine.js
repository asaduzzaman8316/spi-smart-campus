const mongoose = require('mongoose');

const routineSchema = mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    days: [{
        name: String,
        classes: [{
            startTime: String,
            endTime: String,
            subject: String,
            subjectCode: String,
            teacher: String,
            room: String
        }]
    }],
    lastUpdated: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness of one routine per dept/sem/shift/group
routineSchema.index({ department: 1, semester: 1, shift: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Routine', routineSchema);
