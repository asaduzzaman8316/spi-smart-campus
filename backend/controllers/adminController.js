const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// @desc    Get all admins
// @route   GET /api/admins
const getAdmins = async (req, res) => {
    try {
        const total = await Admin.countDocuments();
        const admins = await Admin.find().select('-__v -password').sort({ createdAt: -1 }).lean();

        res.json({
            success: true,
            data: admins,
            count: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in admin's profile
// @route   GET /api/admins/profile
// @access  Private (Any Admin)
const getAdminProfile = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const admin = await Admin.findById(req.user._id).select('-__v -password');

        if (!admin) {
            return res.status(404).json({ message: 'Admin profile not found' });
        }

        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new admin (department admin)
// @route   POST /api/admins
const createAdmin = async (req, res) => {
    try {
        const { name, email, department, phone, image, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        const passwordToHash = password || 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordToHash, salt);

        const admin = await Admin.create({
            name,
            email,
            department,
            phone,
            image,
            role: 'department_admin',
            password: hashedPassword
        });

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Register admin (link Firebase UID) -> Deprecated
// @route   POST /api/admins/register
// @access  Public (with rate limiting)
const registerAdmin = async (req, res) => {
    res.status(501).json({ message: 'Register functionality deprecated in JWT version.' });
};

// @desc    Update admin profile
// @route   PUT /api/admins/profile
// @access  Private (Any Admin)
const updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, image, password } = req.body;

        const admin = await Admin.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update allowed fields
        if (name) admin.name = name;
        if (phone !== undefined) admin.phone = phone;
        if (image !== undefined) admin.image = image;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        await admin.save();

        // Return without password
        const adminResponse = admin.toObject();
        delete adminResponse.password;

        res.json(adminResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete admin
// @route   DELETE /api/admins/:id
// @access  Private (Super Admin only)
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Prevent deleting super admin
        if (admin.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot delete super admin' });
        }

        await Admin.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unregister admin (remove access)
// @route   PUT /api/admins/unregister/:id
const unregisterAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot unregister super admin' });
        }

        admin.password = 'NO_ACCOUNT_YET';
        await admin.save();

        const { sendAccountUnregisterEmail } = require('../config/emailService');
        const emailResult = await sendAccountUnregisterEmail(admin.email, admin.name);

        res.status(200).json({
            message: 'Admin account unregistered successfully',
            emailSent: emailResult.success
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdmins,
    getAdminProfile,
    createAdmin,
    registerAdmin,
    updateAdminProfile,
    deleteAdmin,
    unregisterAdmin
};

