const Admin = require('../models/Admin');
const { createPaginatedResponse } = require('../middleware/pagination');

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private (Super Admin only)
const getAdmins = async (req, res) => {
    try {
        const { skip, limit } = req.pagination;

        const total = await Admin.countDocuments();
        const admins = await Admin.find()
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        res.json(createPaginatedResponse(admins, total, req.pagination));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in admin's profile
// @route   GET /api/admins/profile
// @access  Private (Any Admin)
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findOne({ firebaseUid: req.user.uid })
            .select('-__v');

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
// @access  Private (Super Admin only)
const createAdmin = async (req, res) => {
    try {
        const { name, email, department, phone, image } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Create new department admin
        const admin = await Admin.create({
            name,
            email,
            department,
            phone,
            image,
            role: 'department_admin'
        });

        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Register admin (link Firebase UID)
// @route   POST /api/admins/register
// @access  Public (with rate limiting)
const registerAdmin = async (req, res) => {
    try {
        const { email, firebaseUid, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.firebaseUid) {
            return res.status(400).json({ message: 'Admin already registered' });
        }

        admin.firebaseUid = firebaseUid;
        await admin.save();

        // Send email with credentials if password provided
        if (password) {
            const { sendAccountCreationEmail } = require('../config/emailService');
            const emailResult = await sendAccountCreationEmail(email, admin.name, password);

            if (emailResult.success) {
                console.log(`Account creation email sent to ${email}`);
            } else {
                console.error(`Failed to send email to ${email}:`, emailResult.error);
            }
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admins/profile
// @access  Private (Any Admin)
const updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, image } = req.body;

        const admin = await Admin.findOne({ firebaseUid: req.user.uid });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update allowed fields
        if (name) admin.name = name;
        if (phone !== undefined) admin.phone = phone;
        if (image !== undefined) admin.image = image;

        await admin.save();
        res.json(admin);
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

        // Delete from Firebase if exists
        if (admin.firebaseUid) {
            const admin_firebase = require('../config/firebaseAdmin');
            try {
                if (admin_firebase.apps.length) {
                    await admin_firebase.auth().deleteUser(admin.firebaseUid);
                    console.log(`Deleted Firebase user: ${admin.firebaseUid}`);
                }
            } catch (firebaseError) {
                console.error('Error deleting Firebase user:', firebaseError);
            }
        }

        await Admin.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unregister admin (remove Firebase access)
// @route   PUT /api/admins/unregister/:id
// @access  Private (Super Admin only)
const unregisterAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot unregister super admin' });
        }

        // Send deletion email notification
        if (admin.email && admin.name) {
            const { sendAccountDeletionEmail } = require('../config/emailService');
            const emailResult = await sendAccountDeletionEmail(admin.email, admin.name);

            if (emailResult.success) {
                console.log(`Account deletion email sent to ${admin.email}`);
            } else {
                console.error(`Failed to send deletion email to ${admin.email}:`, emailResult.error);
            }
        }

        // Delete from Firebase
        if (admin.firebaseUid) {
            const admin_firebase = require('../config/firebaseAdmin');
            try {
                if (admin_firebase.apps.length) {
                    await admin_firebase.auth().deleteUser(admin.firebaseUid);
                }
            } catch (firebaseError) {
                console.error('Error deleting Firebase user:', firebaseError);
            }
        }

        admin.firebaseUid = undefined;
        await admin.save();

        res.json({ message: 'Admin unregistered successfully', admin });
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
