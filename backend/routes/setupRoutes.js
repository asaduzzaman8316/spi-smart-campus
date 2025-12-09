const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// @desc    Setup first super admin (one-time use)
// @route   POST /api/setup/super-admin
// @access  Public (but checks if super admin already exists)
router.post('/super-admin', async (req, res) => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });

        if (existingSuperAdmin) {
            return res.status(400).json({
                message: 'Super admin already exists',
                admin: {
                    name: existingSuperAdmin.name,
                    email: existingSuperAdmin.email,
                    hasFirebaseUid: !!existingSuperAdmin.firebaseUid
                }
            });
        }

        const { name, email, firebaseUid, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Create super admin
        const superAdmin = await Admin.create({
            name,
            email,
            firebaseUid: firebaseUid || undefined,
            role: 'super_admin',
            phone: phone || undefined,
            image: ''
        });

        res.status(201).json({
            message: 'Super admin created successfully!',
            admin: {
                id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
                role: superAdmin.role,
                firebaseUid: superAdmin.firebaseUid || 'Not set - please update'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
