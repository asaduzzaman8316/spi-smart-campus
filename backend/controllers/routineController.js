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

        // Step 1: Identify all unique sessions across all routines
        // A session is unique if: Day, StartTime, EndTime, Teacher, Subject, SubjectCode are the same.
        const sessionsMap = new Map(); // Key: day-startTime-endTime-teacher-subject, Value: session data

        routines.forEach(routine => {
            routine.days.forEach(day => {
                day.classes.forEach(cls => {
                    if (!cls.teacher || !cls.subject) return;

                    const duration = calculateDuration(cls.startTime, cls.endTime);
                    const periods = Math.round(duration / 45);
                    const isPractical = duration >= 90;

                    // Unique session key
                    const sessionKey = `${day.name}-${cls.startTime}-${cls.endTime}-${cls.teacher}-${cls.subject}-${cls.subjectCode || ''}`;

                    if (!sessionsMap.has(sessionKey)) {
                        sessionsMap.set(sessionKey, {
                            teacherName: cls.teacher,
                            subject: cls.subject,
                            subjectCode: cls.subjectCode || '',
                            day: day.name,
                            startTime: cls.startTime,
                            endTime: cls.endTime,
                            isPractical,
                            periods: periods || 1, // Default 1 period for theory if duration < 45
                            room: cls.room,
                            groups: new Set()
                        });
                    }

                    const session = sessionsMap.get(sessionKey);
                    const shortDept = DEPT_SHORT_NAMES[routine.department] || routine.department.substring(0, 3).toUpperCase();
                    const groupInfo = `${routine.semester}/${shortDept}/${routine.group}`;
                    session.groups.add(groupInfo);
                });
            });
        });

        // Step 2: Group unique sessions by Teacher-Subject
        const teacherMap = new Map(); // Key: teacher-subject-code

        sessionsMap.forEach(session => {
            const key = `${session.teacherName}-${session.subject}-${session.subjectCode}`;
            if (!teacherMap.has(key)) {
                teacherMap.set(key, {
                    teacherName: session.teacherName,
                    subject: session.subject,
                    subjectCode: session.subjectCode,
                    theoryPeriods: 0,
                    practicalPeriods: 0,
                    theoryCount: 0,
                    practicalCount: 0,
                    rooms: new Set(),
                    groupsMap: new Map() // semester/dept -> Set of groups
                });
            }
            const entry = teacherMap.get(key);

            if (session.isPractical) {
                entry.practicalPeriods += session.periods;
                entry.practicalCount += 1;
            } else {
                entry.theoryPeriods += session.periods;
                entry.theoryCount += 1;
            }

            if (session.room) entry.rooms.add(session.room);

            // Add groups from this session to the entry's groupsMap
            session.groups.forEach(groupInfo => {
                const parts = groupInfo.split('/'); // [sem, dept, group]
                const groupKey = `${parts[0]}/${parts[1]}`;
                if (!entry.groupsMap.has(groupKey)) {
                    entry.groupsMap.set(groupKey, new Set());
                }
                entry.groupsMap.get(groupKey).add(parts[2]);
            });
        });

        // Step 3: Convert to array and format
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
                totalLoad: entry.theoryPeriods + entry.practicalPeriods,
                totalClasses: entry.theoryCount + entry.practicalCount,
                rooms: Array.from(entry.rooms).sort().join(', ')
            };
        });

        assignments.sort((a, b) => a.teacherName.localeCompare(b.teacherName));

        const uniqueTeachersCount = new Set(assignments.map(a => a.teacherName)).size;

        // Calculate Global Totals and Department Breakdown
        let totalPeriods = 0;
        let totalTheory = 0;
        let totalPractical = 0;
        const departmentLoads = {};

        sessionsMap.forEach(s => {
            totalPeriods += s.periods;
            if (s.isPractical) totalPractical += s.periods;
            else totalTheory += s.periods;

            // Department breakdown
            const sessionDepts = new Set();
            s.groups.forEach(groupInfo => {
                const parts = groupInfo.split('/');
                sessionDepts.add(parts[1]); // Short name like CST, CT etc.
            });

            sessionDepts.forEach(dept => {
                departmentLoads[dept] = (departmentLoads[dept] || 0) + s.periods;
            });
        });

        res.json({
            success: true,
            data: {
                assignments,
                summary: {
                    totalTeachers: uniqueTeachersCount,
                    totalAssignments: assignments.length,
                    totalPeriods,
                    totalTheory,
                    totalPractical,
                    averageLoad: uniqueTeachersCount > 0 ? (totalPeriods / uniqueTeachersCount).toFixed(1) : 0,
                    departmentLoads
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
