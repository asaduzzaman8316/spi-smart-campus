const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create Super Admin
const createSuperAdmin = async () => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });

        if (existingSuperAdmin) {
            console.log('Super admin already exists:');
            console.log('Email:', existingSuperAdmin.email);
            console.log('Name:', existingSuperAdmin.name);
            console.log('Firebase UID:', existingSuperAdmin.firebaseUid || 'Not linked yet');
            return;
        }

        // Prompt for super admin details
        console.log('\n=== Creating Super Admin ===\n');
        console.log('Please provide the following details:');

        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (query) => new Promise((resolve) => readline.question(query, resolve));

        const name = await question('Name: ');
        const email = await question('Email: ');
        const firebaseUid = await question('Firebase UID (optional, press Enter to skip): ');
        const phone = await question('Phone (optional, press Enter to skip): ');

        // Create super admin
        const superAdmin = await Admin.create({
            name: name.trim(),
            email: email.trim(),
            firebaseUid: firebaseUid.trim() || undefined,
            role: 'super_admin',
            phone: phone.trim() || undefined
        });

        console.log('\n✅ Super Admin created successfully!');
        console.log('Details:');
        console.log('Name:', superAdmin.name);
        console.log('Email:', superAdmin.email);
        console.log('Role:', superAdmin.role);
        console.log('ID:', superAdmin._id);

        if (superAdmin.firebaseUid) {
            console.log('Firebase UID:', superAdmin.firebaseUid);
            console.log('\n✅ Account is ready to use!');
        } else {
            console.log('\n⚠️  Firebase UID not set. You need to:');
            console.log('1. Create a Firebase account with email:', superAdmin.email);
            console.log('2. Get the Firebase UID');
            console.log('3. Update the admin record with the UID');
        }

        readline.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
