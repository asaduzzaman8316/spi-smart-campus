const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    subjectName: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'teacherModel',
        required: true
    },
    teacherModel: {
        type: String,
        required: true,
        enum: ['Teacher', 'Admin']
    },
    teacherName: String,
    teacherEmail: String
}, {
    timestamps: true
});

// Indexes for common queries
questionSchema.index({ department: 1, semester: 1 });
questionSchema.index({ subjectCode: 1 });
questionSchema.index({ teacher: 1 });

module.exports = mongoose.model('Question', questionSchema);
