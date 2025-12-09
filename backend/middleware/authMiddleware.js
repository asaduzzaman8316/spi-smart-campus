const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token.role
            // We embed role in token to know which collection to query
            // Assuming token payload: { id, role, ... }
            if (decoded.role === 'teacher') {
                req.user = await Teacher.findById(decoded.id).select('-password');
            } else {
                req.user = await Admin.findById(decoded.id).select('-password');
            }

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Extend req.user with role from token just in case
            if (!req.user.role) req.user.role = decoded.role;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        // Super admin has access to everything admin has
        if (req.user.role === 'super_admin' && roles.includes('admin')) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Allow access to owner of the resource or admin
const authorizeOwnerOrAdmin = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        return next();
    }

    // Check if the parameter ID matches the user ID
    if (req.params.id && req.params.id === req.user._id.toString()) {
        return next();
    }

    // Also check for 'uid' parameter as some routes might use it
    if (req.params.uid && req.params.uid === req.user._id.toString()) {
        return next();
    }

    return res.status(403).json({
        message: 'Not authorized to modify this resource'
    });
};

module.exports = { protect, authorize, authorizeOwnerOrAdmin };
