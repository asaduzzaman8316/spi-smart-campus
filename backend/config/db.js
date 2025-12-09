
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
            bufferCommands: false, // Disable buffering in serverless
            serverSelectionTimeoutMS: 30000, // Increase to 30s for cold starts
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Limit connections in serverless
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // process.exit(1); // Do not exit in serverless
    }
};

module.exports = connectDB;
