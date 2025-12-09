const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        addSuperAdmin();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function addSuperAdmin() {
    try {
        // Define Admin schema inline
        const adminSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            firebaseUid: { type: String, unique: true, sparse: true },
            role: { type: String, enum: ['super_admin', 'department_admin'] },
            department: String,
            phone: String,
            image: String
        }, { timestamps: true });

        const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

        // Check if super admin exists
        const existing = await Admin.findOne({ role: 'super_admin' });
        if (existing) {
            console.log('\n✅ Super admin already exists:');
            console.log('Name:', existing.name);
            console.log('Email:', existing.email);
            console.log('Firebase UID:', existing.firebaseUid || 'Not set');
            console.log('\nTo update Firebase UID, use MongoDB Compass or update manually.');
            process.exit(0);
            return;
        }

        // Get user input
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (query) => new Promise((resolve) => readline.question(query, resolve));

        console.log('\n=== Create Super Admin ===\n');

        const name = await question('Enter name: ');
        const email = await question('Enter email: ');
        const firebaseUid = await question('Enter Firebase UID (or press Enter to skip): ');
        const phone = await question('Enter phone (optional): ');

        // Create super admin
        const superAdmin = new Admin({
            name: name.trim(),
            email: email.trim(),
            firebaseUid: firebaseUid.trim() || undefined,
            role: 'super_admin',
            phone: phone.trim() || undefined,
            image: ''
        });

        await superAdmin.save();

        console.log('\n✅ Super Admin created successfully!');
        console.log('Name:', superAdmin.name);
        console.log('Email:', superAdmin.email);
        console.log('Role:', superAdmin.role);

        if (firebaseUid.trim()) {
            console.log('Firebase UID:', superAdmin.firebaseUid);
            console.log('\n✅ You can now login with this account!');
        } else {
            console.log('\n⚠️  Firebase UID not set.');
            console.log('Next steps:');
            console.log('1. Login to Firebase with email:', superAdmin.email);
            console.log('2. Get your Firebase UID from Firebase Console');
            console.log('3. Update admin record in MongoDB with the UID');
        }

        readline.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}
