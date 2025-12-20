const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a quiz title'],
        trim: true
    },
    subject: {
        type: String, // You might want to store subject ID if using refs, but name is fine for now
        required: [true, 'Please add a subject']
    },
    // Array of Questions
    questions: [{
        questionText: {
            type: String,
            required: [true, 'Please add a question']
        },
        options: {
            type: [String],
            required: [true, 'Please add options'],
            validate: [arrayLimit, '{PATH} must be 4 options']
        },
        correctAnswer: {
            type: String,
            required: [true, 'Please specify the correct answer']
        }
    }],
    accessCode: {
        type: String,
        required: [true, 'Please add an access code'],
        select: false // Do not return by default
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true // Making group required as per user emphasis
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    createdByName: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Closed'],
        default: 'Active'
    }
}, {
    timestamps: true
});

function arrayLimit(val) {
    return val.length === 4;
}

// Encrypt access code
quizSchema.pre('save', async function (next) {
    if (!this.isModified('accessCode')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.accessCode = await bcrypt.hash(this.accessCode, salt);
});

quizSchema.methods.matchAccessCode = async function (enteredCode) {
    return await bcrypt.compare(enteredCode, this.accessCode);
};

module.exports = mongoose.model('Quiz', quizSchema);
