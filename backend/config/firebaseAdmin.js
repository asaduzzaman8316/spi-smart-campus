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
    // Only try to require if we didn't find the env var to avoid build-time warnings/errors
    if (!serviceAccount) {
        try {
            // Check if file exists roughly before requiring (optional, but require in try/catch is enough)
            serviceAccount = require(serviceAccountPath);
            console.log("Found local serviceAccountKey.json");
        } catch (e) {
            // File not found is expected in production
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
        // This might fail on Vercel if no other creds are present, but we suppress the crash.
        if (!admin.apps.length) {
            try {
                admin.initializeApp();
                console.log("Firebase Admin initialized with default credentials.");
            } catch (initError) {
                console.warn("Failed to initialize Firebase Admin (Default):", initError.message);
            }
        }
    }

} catch (error) {
    console.error("Firebase Admin Initialization Check Error:", error);
}

module.exports = admin;
