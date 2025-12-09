
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';

        // Mongoose connection optimization for serverless
        if (mongoose.connections[0].readyState) {
            console.log('MongoDB already connected');
            return;
        }

        const conn = await mongoose.connect(uri, {
            // Buffer commands to avoid timeouts (default is true, but explicit is good)
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // process.exit(1); // Do not exit in serverless
    }
};

module.exports = connectDB;
