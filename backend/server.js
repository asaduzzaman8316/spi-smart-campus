const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dotenv.config();
// connectDB(); // Removed immediate call for serverless compatibility

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Database Connection Middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001' // Mobile testing
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const normalize = (url) => url ? url.replace(/\/$/, '') : '';
        const normalizedOrigin = normalize(origin);

        const isAllowed = allowedOrigins.some(allowed => normalize(allowed) === normalizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS Blocked: ${origin}`); // Warning for Vercel logs
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Explicit methods
}));

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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/setup', require('./routes/setupRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
}

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
