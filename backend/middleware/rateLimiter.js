const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login/registration endpoints
 * 5 attempts per 15 minutes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 5 requests per window
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for email sending endpoints
 * 10 emails per hour
 */
const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        error: {
            message: 'Too many emails sent. Please try again later.',
            code: 'EMAIL_RATE_LIMIT_EXCEEDED'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
        success: false,
        error: {
            message: 'Too many requests. Please slow down.',
            code: 'RATE_LIMIT_EXCEEDED'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    emailLimiter,
    apiLimiter
};
