const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin only)
const getTeachers = async (req, res) => {
    try {
        const { search, department, shift } = req.query;

        // Build query object
        const query = {};

        // Search functionality (name or email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Department filter
        if (department) {
            query.department = department;
        }

        // Shift filter
        if (shift) {
            query.shift = shift;
        }

        // Get all teachers with the query
        let teachers = await Teacher.find(query)
            .select('-__v +password')
            .sort({ createdAt: -1, _id: 1 })
            .lean();

        // Add hasAccount flag and remove password
        teachers = teachers.map(teacher => {
            const hasAccount = !!teacher.password && teacher.password !== 'NO_ACCOUNT_YET';
            if (teacher.password) delete teacher.password;
            return {
                ...teacher,
                hasAccount
            };
        });

        res.json({
            success: true,
            count: teachers.length,
            data: teachers
        });
    } catch (error) {
        console.error('getTeachers Error:', error);
        res.status(500).json({ message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private
const createTeacher = async (req, res) => {
    try {
        console.log('Creating teacher with data:', req.body);
        const { name, email, department, phone, image, shift, userType, role } = req.body;

        const teacherExists = await Teacher.findOne({ email });
        if (teacherExists) {
            return res.status(400).json({ message: 'Teacher already exists' });
        }

        // Create teacher WITHOUT account (no password)
        // Account will be created later from Manage Teacher Account
        const teacher = await Teacher.create({
            name,
            email,
            department,
            phone,
            image,
            shift,
            userType: userType || '',
            role: role || '',
            password: 'NO_ACCOUNT_YET' // Placeholder - will be set when account is created
        });

        res.status(201).json({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            userType: teacher.userType,
            role: teacher.role
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private
const updateTeacher = async (req, res) => {
    try {
        const { password, ...otherUpdates } = req.body;
        let plainPassword = null;
        let isNewAccount = false;

        // Fetch original teacher to check current account status
        const originalTeacher = await Teacher.findById(req.params.id);
        if (!originalTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // If updating password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            otherUpdates.password = await bcrypt.hash(password, salt);
            otherUpdates.userType = req.body.userType || '';
            plainPassword = password;

            // Check if this is a new account creation
            console.log('Original teacher password:', originalTeacher.password);
            console.log('Is NO_ACCOUNT_YET?', originalTeacher.password === 'NO_ACCOUNT_YET');
            console.log('Is empty/null?', !originalTeacher.password);

            if (!originalTeacher.password || originalTeacher.password === 'NO_ACCOUNT_YET') {
                isNewAccount = true;
                console.log('Detected as NEW ACCOUNT');
            } else {
                console.log('Detected as PASSWORD RESET');
            }
        }

        const teacher = await Teacher.findByIdAndUpdate(req.params.id, otherUpdates, { new: true });

        // Send appropriate email
        if (plainPassword) {
            const { sendAccountCreationEmail, sendPasswordResetEmail } = require('../config/emailService');
            let emailResult;

            if (isNewAccount) {
                // New Account -> Welcome Email
                emailResult = await sendAccountCreationEmail(teacher.email, teacher.name, plainPassword);
            } else {
                // Existing Account -> Password Reset Email
                emailResult = await sendPasswordResetEmail(teacher.email, teacher.name, plainPassword);
            }

            if (!emailResult.success) {
                console.error('Failed to send email:', emailResult.error);
            }

            return res.status(200).json({
                ...teacher.toObject(),
                emailSent: emailResult.success
            });
        }

        res.status(200).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Send account deletion email notification
        const { sendAccountDeletionEmail } = require('../config/emailService');
        const emailResult = await sendAccountDeletionEmail(teacher.email, teacher.name);

        if (!emailResult.success) {
            console.error('Failed to send account deletion email:', emailResult.error);
            // Continue with deletion even if email fails
        }

        // Look for any related cleanup if needed (e.g. routines)

        await Teacher.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: 'Teacher deleted',
            emailSent: emailResult.success
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unregister a teacher account 
// (For JWT, this might just mean deactivating or resetting password? 
// The original unregister was removing Firebase UID. 
// We will just return not implemented or remove functionality if not needed.
// For now, let's just do nothing or maybe delete the password?)
const unregisterTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Reset password to indicate no account
        teacher.password = 'NO_ACCOUNT_YET';
        // Reset userType to default teacher just in case, or keep it? 
        // Let's reset it to 'teacher' to be safe, or keep it as placeholder. 
        // The user request said "delete his account login details", implies removing access.
        // Keeping the role/department data intact.

        await teacher.save();

        // Send notification email
        const { sendAccountUnregisterEmail } = require('../config/emailService');
        const emailResult = await sendAccountUnregisterEmail(teacher.email, teacher.name);

        if (!emailResult.success) {
            console.error('Failed to send unregister email:', emailResult.error);
        }

        res.status(200).json({
            message: 'Teacher account unregistered successfully',
            emailSent: emailResult.success
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a teacher (Link Firebase UID) -> Deprecated
// @route   POST /api/teachers/register
// @access  Private (Admin or Teacher themselves)
const registerTeacher = async (req, res) => {
    res.status(501).json({ message: 'Register functionality deprecated in JWT version. Use Create or Update.' });
};

// @desc    Get teacher by ID (Replacing getTeacherByUid)
// @route   GET /api/teachers/profile/:id
const getTeacherById = async (req, res) => {
    try {
        // Formerly getTeacherByUid
        // If the frontend sends an ID, we find by ID.
        const teacher = await Teacher.findById(req.params.id).select('-password');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    registerTeacher,
    unregisterTeacher,
    getTeacherByUid: getTeacherById // Map to new function for compatibility if routes use this name
};

