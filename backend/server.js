const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dotenv.config();

connectDB();

const app = express();

// Security Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression

// Logging
app.use(morgan('combined')); // HTTP request logging

// CORS
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001'
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Normalize origins by removing trailing slash for comparison
        const normalize = (url) => url ? url.replace(/\/$/, '') : '';
        const normalizedOrigin = normalize(origin);

        const isAllowed = allowedOrigins.some(allowed => normalize(allowed) === normalizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body Parser
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API is running...',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/routines', require('./routes/routineRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // Auth routes
app.use('/api/setup', require('./routes/setupRoutes')); // One-time setup routes


// 404 handler for undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    // We don't exit here to allow server to start, but auth will fail.
    // Ideally we should exit, but for debugging in Vercel seeing the log is better.
}

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
