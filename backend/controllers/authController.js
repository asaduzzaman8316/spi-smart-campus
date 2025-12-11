const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await Admin.findOne({ email }).select('+password');
        
        if (!user) {
            user = await Teacher.findOne({ email }).select('+password');
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id, user.userType || 'teacher');
            const userResponse = user.toObject();
            delete userResponse.password;

            res.json({ ...userResponse, token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    loginUser,
    getMe,
};
