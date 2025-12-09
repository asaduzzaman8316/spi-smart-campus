const { createPaginatedResponse } = require('../middleware/pagination');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
    try {
        if (!req.pagination) {
            throw new Error('Req.pagination is missing!');
        }

        const { skip, limit } = req.pagination;
        const { search, type } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { roomNumber: { $regex: search, $options: 'i' } } // Assuming roomNumber field based on previous regex
            ];
        }
        if (type) {
            query.type = type;
        }

        const total = await Room.countDocuments(query);
        const rooms = await Room.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // or name? Usually creation for management logs
            .lean();

        res.status(200).json(createPaginatedResponse(rooms, total, req.pagination));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
};
