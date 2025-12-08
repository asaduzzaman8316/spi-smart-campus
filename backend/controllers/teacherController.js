const Teacher = require('../models/Teacher');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Public
const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private
const createTeacher = async (req, res) => {
    try {
        console.log('Creating teacher with data:', req.body);
        const teacher = await Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private
const updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const admin = require('../config/firebaseAdmin');

// ... existing code ...

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id); // Find first to get UID

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Delete from Firebase if UID exists
        if (teacher.firebaseUid) {
            try {
                if (admin.apps.length) {
                    await admin.auth().deleteUser(teacher.firebaseUid);
                    console.log(`Deleted Firebase user: ${teacher.firebaseUid}`);
                } else {
                    console.warn("Firebase Admin not initialized. Skipping Firebase user deletion.");
                }
            } catch (firebaseError) {
                console.error("Error deleting Firebase user:", firebaseError);
                // Continue to delete from DB even if Firebase fails? 
                // Mostly yes, to avoid zombie records, or maybe warning.
            }
        }

        await Teacher.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... existing code ...

// @desc    Unregister a teacher account (Remove Firebase Access)
// @route   PUT /api/teachers/unregister/:id
// @access  Private
const unregisterTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.firebaseUid) {
            try {
                if (admin.apps.length) {
                    await admin.auth().deleteUser(teacher.firebaseUid);
                } else {
                    console.warn("Firebase Admin not initialized. Skipping Firebase user deletion.");
                }
            } catch (firebaseError) {
                console.error("Error deleting Firebase user:", firebaseError);
                // If user not found, process anyway
                if (firebaseError.code !== 'auth/user-not-found') {
                    // For now proceed, but maybe we should alert?
                }
            }
        }

        teacher.firebaseUid = undefined;
        teacher.role = 'teacher';
        await teacher.save();

        res.status(200).json({ message: 'Teacher unregistered', teacher });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a teacher (Link Firebase UID)
// @route   POST /api/teachers/register
// @access  Private (Admin or Teacher themselves)
const registerTeacher = async (req, res) => {
    try {
        const { email, firebaseUid, role } = req.body;

        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found with this email' });
        }

        teacher.firebaseUid = firebaseUid;
        // Role update optional, but good for consistency
        if (role) teacher.role = role;

        await teacher.save();

        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher by Firebase UID
// @route   GET /api/teachers/profile/:uid
// @access  Private
const getTeacherByUid = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ firebaseUid: req.params.uid });

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
    getTeacherByUid
};
