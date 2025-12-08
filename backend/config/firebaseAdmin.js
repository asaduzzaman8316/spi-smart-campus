const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Expects 'serviceAccountKey.json' in this config folder
// OR GOOGLE_APPLICATION_CREDENTIALS env var to be set
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
    let serviceAccount;

    // 1. Try Environment Variable (Best for Vercel/Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log("Found FIREBASE_SERVICE_ACCOUNT environment variable.");
        } catch (e) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT json:", e);
        }
    }

    // 2. Try Local File (Best for Local Development)
    if (!serviceAccount) {
        try {
            serviceAccount = require(serviceAccountPath);
            console.log("Found local serviceAccountKey.json");
        } catch (e) {
            // File not found, expected in production if using Env Var
        }
    }

    if (serviceAccount) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin initialized successfully.");
        }
    } else {
        // 3. Fallback to Default (Google Cloud auto-discovery)
        if (!admin.apps.length) {
            admin.initializeApp();
            console.log("Firebase Admin initialized with default credentials.");
        }
    }

} catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
}

module.exports = admin;
