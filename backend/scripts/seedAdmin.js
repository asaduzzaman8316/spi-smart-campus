const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spi_db'; // Fallback
        console.log('Connecting to MongoDB at:', uri);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        const email = 'admin@example.com';
        const password = 'password123';

        // Check if admin exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists with email:', email);

            // Optional: Update password if needed
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'super_admin'; // Ensure super_admin
            await existingAdmin.save();
            console.log('Updated existing admin password to:', password);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await Admin.create({
                name: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'super_admin',
                department: 'Administration',
                phone: '1234567890',
                image: ''
            });
            console.log('Admin created successfully');
            console.log('Email:', email);
            console.log('Password:', password);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
