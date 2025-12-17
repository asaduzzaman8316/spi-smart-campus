const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
    startTime: String,
    endTime: String,
    subject: String,
    subjectCode: String,
    teacher: String,
    room: String,
    type: String, // 'Theory' or 'Lab'
    isMerged: Boolean,
    id: String // Frontend generated ID
}, { _id: false }); // Disable auto _id for classes to avoid conflicts, or keep it if needed. Let's disable to rely on 'id' string.

const daySchema = mongoose.Schema({
    name: String,
    classes: [classSchema]
}, { _id: false });

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
    days: [daySchema],
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
