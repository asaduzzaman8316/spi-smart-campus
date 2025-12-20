const Routine = require('../models/Routine');

// @desc    Get all routines
// @route   GET /api/routines
const getRoutines = async (req, res) => {
    try {
        const { department, semester, shift, group } = req.query;

        const query = {};
        if (department) query.department = department;
        if (semester) query.semester = semester;
        if (shift) query.shift = shift;
        if (group) query.group = group;

        const routines = await Routine.find(query)
            .select('-__v')
            .sort({ department: 1, semester: 1, shift: 1, group: 1 })
            .lean();

        res.json({
            success: true,
            count: routines.length,
            data: routines
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single routine by complex ID or params
// @route   GET /api/routines/find
// @access  Public
const findRoutine = async (req, res) => {
    try {
        const { department, semester, shift, group } = req.query;
        const routine = await Routine.findOne({ department, semester, shift, group });
        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }
        res.status(200).json(routine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or Update a routine
// @route   POST /api/routines
const createOrUpdateRoutine = async (req, res) => {
    try {
        const { department, semester, shift, group, days } = req.body;

        const filter = { department, semester, shift, group };
        const update = {
            department,
            semester,
            shift,
            group,
            days,
            lastUpdated: Date.now()
        };

        const routine = await Routine.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true
        });

        res.status(200).json(routine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a routine by ID
// @route   PUT /api/routines/:id
const updateRoutineById = async (req, res) => {
    try {
        const routine = await Routine.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }
        res.status(200).json(routine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a routine
// @route   DELETE /api/routines/:id
// @access  Private
const deleteRoutine = async (req, res) => {
    try {
        const routine = await Routine.findByIdAndDelete(req.params.id);
        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }
        res.status(200).json({ message: 'Routine deleted' });
    } catch (error) {
    }
};

// @desc    Analyze teacher loads from routines
// @route   GET /api/routines/analyze-load
// @access  Public
const analyzeLoad = async (req, res) => {
    try {
        const { department, semester, shift } = req.query;

        const query = {};
        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);
        if (shift) query.shift = shift;

        const routines = await Routine.find(query).lean();

        if (!routines || routines.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    assignments: [],
                    summary: {
                        totalTeachers: 0,
                        totalAssignments: 0,
                        totalPeriods: 0,
                        totalTheory: 0,
                        totalPractical: 0,
                        averageLoad: 0
                    },
                    filters: {
                        department: department || 'All',
                        semester: semester || 'All',
                        shift: shift || 'All'
                    }
                }
            });
        }

        // Calculate duration in minutes
        const calculateDuration = (startTime, endTime) => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            let startMinutes = startHour * 60 + startMin;
            let endMinutes = endHour * 60 + endMin;

            if (endMinutes < startMinutes) {
                endMinutes += 24 * 60;
            }

            return endMinutes - startMinutes;
        };

        // Department Short Name Mapping
        const DEPT_SHORT_NAMES = {
            'Computer': 'CST',
            'Computer Science': 'CST',
            'Computer Technology': 'CST',
            'Computer Science & Technology': 'CST',
            'Computer Science and Technology': 'CST',
            'Civil': 'CT',
            'Civil Technology': 'CT',
            'Electrical': 'ET',
            'Electrical Technology': 'ET',
            'Electronics': 'ENT',
            'Electronics Technology': 'ENT',
            'Mechanical': 'MT',
            'Mechanical Technology': 'MT',
            'Power': 'PT',
            'Power Technology': 'PT',
            'Electromedical': 'EMT',
            'Electromedical Technology': 'EMT',
            'Environmental': 'EnvT',
            'Environmental Technology': 'EnvT',
            'Food': 'FT',
            'Food Technology': 'FT',
            'Architecture': 'AT',
            'Architecture Technology': 'AT',
            'Automobile': 'AuT',
            'Automobile Technology': 'AuT',
            'Refrigeration and Air Conditioning': 'RAC',
            'Refrigeration and Air Conditioning Technology': 'RAC',
            'Mechatronics': 'McT',
            'Mechatronics Technology': 'McT',
            'Data Telecommunication and Networking': 'DNT',
            'Data Telecommunication and Networking Technology': 'DNT',
            'Non Tech': 'Non-Tech'
        };

        // Map to store teacher assignments
        const teacherMap = new Map();

        routines.forEach(routine => {
            routine.days.forEach(day => {
                day.classes.forEach(cls => {
                    if (!cls.teacher || !cls.subject) return;

                    const duration = calculateDuration(cls.startTime, cls.endTime);
                    const periods = Math.round(duration / 45);
                    const isPractical = duration >= 90;

                    const key = `${cls.teacher}-${cls.subject}-${cls.subjectCode || ''}`;

                    if (!teacherMap.has(key)) {
                        teacherMap.set(key, {
                            teacherName: cls.teacher,
                            subject: cls.subject,
                            subjectCode: cls.subjectCode || '',
                            groupsMap: new Map(), // Use Map for grouping by Sem/Dept
                            theoryPeriods: 0,
                            practicalPeriods: 0,
                            theoryCount: 0,
                            practicalCount: 0,
                            rooms: new Set()
                        });
                    }

                    const entry = teacherMap.get(key);

                    // Grouping Logic
                    const shortDept = DEPT_SHORT_NAMES[routine.department] || routine.department.substring(0, 3).toUpperCase();
                    const groupKey = `${routine.semester}/${shortDept}`; // e.g., "2/CST"

                    if (!entry.groupsMap.has(groupKey)) {
                        entry.groupsMap.set(groupKey, new Set());
                    }
                    entry.groupsMap.get(groupKey).add(routine.group);

                    if (isPractical) {
                        entry.practicalPeriods += periods;
                        entry.practicalCount += 1;
                    } else {
                        entry.theoryPeriods += periods;
                        entry.theoryCount += 1;
                    }

                    if (cls.room) entry.rooms.add(cls.room);
                });
            });
        });

        // Convert to array and format
        const assignments = Array.from(teacherMap.values()).map(entry => {
            // Format Technology string: key-Group+Group (e.g., 2/CST-A1+B1)
            const techParts = [];
            entry.groupsMap.forEach((groupsSet, key) => {
                const sortedGroups = Array.from(groupsSet).sort();
                techParts.push(`${key}-${sortedGroups.join('+')}`);
            });
            const technology = techParts.sort().join(', ');

            return {
                teacherName: entry.teacherName,
                subject: entry.subject,
                subjectCode: entry.subjectCode,
                technology: technology,
                theoryPeriods: entry.theoryPeriods,
                practicalPeriods: entry.practicalPeriods,
                theoryCount: entry.theoryCount,
                practicalCount: entry.practicalCount,
                totalLoad: entry.theoryPeriods + entry.practicalPeriods, // Keep period load validation if needed
                totalClasses: entry.theoryCount + entry.practicalCount, // New class count
                rooms: Array.from(entry.rooms).join(', ')
            };
        });

        assignments.sort((a, b) => a.teacherName.localeCompare(b.teacherName));

        const uniqueTeachers = new Set(assignments.map(a => a.teacherName));
        const totalPeriods = assignments.reduce((sum, a) => sum + a.totalLoad, 0);
        const totalTheory = assignments.reduce((sum, a) => sum + a.theoryPeriods, 0);
        const totalPractical = assignments.reduce((sum, a) => sum + a.practicalPeriods, 0);

        res.json({
            success: true,
            data: {
                assignments,
                summary: {
                    totalTeachers: uniqueTeachers.size,
                    totalAssignments: assignments.length,
                    totalPeriods,
                    totalTheory,
                    totalPractical,
                    averageLoad: uniqueTeachers.size > 0 ? (totalPeriods / uniqueTeachers.size).toFixed(1) : 0
                },
                filters: {
                    department: department || 'All',
                    semester: semester || 'All',
                    shift: shift || 'All'
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getRoutines,
    findRoutine,
    createOrUpdateRoutine,
    updateRoutineById,
    deleteRoutine,
    analyzeLoad
};
