const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user;
        let role;

        // Check in Admin first
        user = await Admin.findOne({ email }).select('+password');
        if (user) {
            // It's an admin
        } else {
            // Check Teacher
            user = await Teacher.findOne({ email }).select('+password');
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id, user.userType || 'teacher');

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password;

            res.json({
                ...userResponse,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is already set by middleware
    res.status(200).json(req.user);
};

// @desc    Register a generic user (optional, mostly for setting up first admin if needed)
// Note: Actual registration logic usually happens in specific controllers (createAdmin, createTeacher)
// But we might need a unified one if we want generic signup. For now, we skip generic register.

module.exports = {
    loginUser,
    getMe,
};
