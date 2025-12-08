const admin = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Extracts token from Authorization header and verifies it
 * Attaches decoded user info to req.user
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'No token provided. Please login.',
                    code: 'NO_TOKEN'
                }
            });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'teacher' // Default to teacher if no role
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Token expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                }
            });
        }

        return res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token. Authentication failed.',
                code: 'INVALID_TOKEN'
            }
        });
    }
};

/**
 * Middleware to check if user is admin
 * Must be used after verifyToken middleware
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required.',
                code: 'NOT_AUTHENTICATED'
            }
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: {
                message: 'Access denied. Admin privileges required.',
                code: 'FORBIDDEN'
            }
        });
    }

    next();
};

/**
 * Middleware to check if user is teacher
 * Must be used after verifyToken middleware
 */
const requireTeacher = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required.',
                code: 'NOT_AUTHENTICATED'
            }
        });
    }

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: {
                message: 'Access denied. Teacher privileges required.',
                code: 'FORBIDDEN'
            }
        });
    }

    next();
};

/**
 * Optional authentication - doesn't fail if no token
 * Just attaches user if token is present
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, continue without user
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'teacher'
        };

        next();
    } catch (error) {
        // Token invalid, but don't fail - just continue without user
        next();
    }
};

module.exports = {
    verifyToken,
    requireAdmin,
    requireTeacher,
    optionalAuth
};
