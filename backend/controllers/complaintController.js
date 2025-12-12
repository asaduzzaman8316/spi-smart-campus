const Complaint = require('../models/Complaint');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Public
const createComplaint = async (req, res) => {
    try {
        const { name, studentId, department, contact, isAnonymous, category, subject, description } = req.body;

        const complaint = await Complaint.create({
            name: isAnonymous ? 'Anonymous' : name,
            studentId: isAnonymous ? '' : studentId,
            department: isAnonymous ? '' : department,
            contact: isAnonymous ? '' : contact,
            isAnonymous,
            category,
            subject,
            description,
            status: 'In Progress'
        });

        // Optional: Trigger notification for admins here (future improvement)

        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin/Super Admin)
const getComplaints = async (req, res) => {
    try {
        const { status, category } = req.query;
        let query = {};

        if (status && status !== 'All') query.status = status;
        if (category && category !== 'All') query.category = category;

        const complaints = await Complaint.find(query).sort({ createdAt: -1 });

        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Admin/Super Admin)
const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status;
        await complaint.save();

        res.status(200).json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin/Super Admin)
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        await complaint.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Complaint deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all public complaints
// @route   GET /api/complaints/public
// @access  Public
const getPublicComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComplaint,
    getComplaints,
    getPublicComplaints,
    updateComplaintStatus,
    deleteComplaint
};
