const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

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
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Body Parser
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

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


// 404 handler for undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
