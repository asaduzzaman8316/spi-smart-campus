const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg,
                    value: err.value
                }))
            }
        });
    }
    next();
};

/**
 * Teacher validation schemas
 */
const teacherValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('phone')
            .optional()
            .trim()
            .matches(/^[0-9]{10,15}$/).withMessage('Phone must be 10-15 digits'),
        body('department')
            .trim()
            .notEmpty().withMessage('Department is required'),
        body('shift')
            .trim()
            .notEmpty().withMessage('Shift is required')
            .isIn(['1st', '2nd']).withMessage('Shift must be 1st or 2nd'),
        body('semester')
            .optional()
            .isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
        body('image')
            .optional()
            .trim()
            .isURL().withMessage('Image must be a valid URL'),
        validate
    ],

    update: [
        param('id')
            .isMongoId().withMessage('Invalid teacher ID'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('email')
            .optional()
            .trim()
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('phone')
            .optional()
            .trim()
            .matches(/^[0-9]{10,15}$/).withMessage('Phone must be 10-15 digits'),
        body('shift')
            .optional()
            .isIn(['1st', '2nd']).withMessage('Shift must be 1st or 2nd'),
        body('semester')
            .optional()
            .isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
        validate
    ],

    register: [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('firebaseUid')
            .trim()
            .notEmpty().withMessage('Firebase UID is required'),
        body('role')
            .optional()
            .isIn(['teacher', 'admin']).withMessage('Role must be teacher or admin'),
        body('password')
            .optional()
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        validate
    ]
};

/**
 * Routine validation schemas
 */
const routineValidation = {
    create: [
        body('department')
            .trim()
            .notEmpty().withMessage('Department is required'),
        body('semester')
            .isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
        body('shift')
            .trim()
            .isIn(['1st', '2nd']).withMessage('Shift must be 1st or 2nd'),
        body('group')
            .trim()
            .notEmpty().withMessage('Group is required'),
        body('days')
            .isArray({ min: 1 }).withMessage('At least one day is required'),
        body('days.*.name')
            .isIn(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
            .withMessage('Invalid day name'),
        validate
    ],

    update: [
        param('id')
            .isMongoId().withMessage('Invalid routine ID'),
        validate
    ]
};

/**
 * Department/Subject/Room validation
 */
const resourceValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
        validate
    ],

    update: [
        param('id')
            .isMongoId().withMessage('Invalid ID'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
        validate
    ]
};

/**
 * Subject validation (has additional code field)
 */
const subjectValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
        body('code')
            .trim()
            .notEmpty().withMessage('Code is required')
            .isLength({ min: 1, max: 20 }).withMessage('Code must be between 1 and 20 characters'),
        body('creditHours')
            .optional()
            .isInt({ min: 1, max: 10 }).withMessage('Credit hours must be between 1 and 10'),
        validate
    ],

    update: [
        param('id')
            .isMongoId().withMessage('Invalid subject ID'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
        body('code')
            .optional()
            .trim()
            .isLength({ min: 1, max: 20 }).withMessage('Code must be between 1 and 20 characters'),
        validate
    ]
};

/**
 * Room validation (has roomNumber)
 */
const roomValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required'),
        body('roomNumber')
            .trim()
            .notEmpty().withMessage('Room number is required'),
        body('capacity')
            .optional()
            .isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
        validate
    ],

    update: [
        param('id')
            .isMongoId().withMessage('Invalid room ID'),
        validate
    ]
};

/**
 * ID parameter validation
 */
const idValidation = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),
    validate
];

module.exports = {
    validate,
    teacherValidation,
    routineValidation,
    resourceValidation,
    subjectValidation,
    roomValidation,
    idValidation
};
