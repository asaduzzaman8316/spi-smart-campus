"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTeachers, fetchRooms, fetchSubjects, fetchDepartments, fetchRoutines, createRoutine } from '../../Lib/api';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, Eye, Edit, Clock, BookOpen, User, MapPin, Sparkles, X, ChevronDown, Layers, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateBatchRoutines } from '../../Lib/AutoRoutineGenerator';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
const SHIFTS = ["1st", "2nd"];
const GROUPS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const INITIAL_ROUTINE = {
    id: '',
    department: '',
    semester: '',
    shift: '',
    group: '',
    lastUpdated: 0,
    days: DAYS.map(day => ({ name: day, classes: [] }))
};

export default function RoutineBuilder({ onBack, initialData }) {
    const router = useRouter();
    const [routine, setRoutine] = useState(INITIAL_ROUTINE);
    const [activeDay, setActiveDay] = useState("Sunday");
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showAutoModal, setShowAutoModal] = useState(false);
    const [loadItems, setLoadItems] = useState([{ id: 1, subject: '', teacher: '', theoryCount: 0, labCount: 0 }]);
    const [customConstraints, setCustomConstraints] = useState([]);

    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allRoutines, setAllRoutines] = useState([]);

    // Batch Generator State
    const [assignments, setAssignments] = useState([]); // [{ id, teacherId, teacherName, subjects: [{ id, subject, theory: 2, lab: 0, technologies: [] }], blockedTimes: [] }]
    const [technologyOptions, setTechnologyOptions] = useState([]); // Pre-computed list of all possible "Dept-Sem-Shift-Grp"

    // UI Helpers state
    const [techSearchTerm, setTechSearchTerm] = useState({}); // { [subjectId]: "term" }
    const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
    const [roomSearchTerm, setRoomSearchTerm] = useState("");
    const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

    // Tech Modal State
    const [showTechModal, setShowTechModal] = useState(false);
    const [activeTechSelection, setActiveTechSelection] = useState(null); // { assignId, subId }
    const [techModalSearchTerm, setTechModalSearchTerm] = useState("");
    const [isSelectAll, setIsSelectAll] = useState(false);

    const [teacherFilterDept, setTeacherFilterDept] = useState('');
    const [roomFilterType, setRoomFilterType] = useState('');
    const [roomFilterLocation, setRoomFilterLocation] = useState('');
    const [roomFilterDept, setRoomFilterDept] = useState('');

    // Filtered lists
    const filteredTeachers = teacherFilterDept
        ? teachers.filter(t => t.department === teacherFilterDept)
        : teachers;

    const filteredRooms = rooms.filter(r => {
        if (roomFilterType && r.type !== roomFilterType) return false;
        if (roomFilterLocation && r.location !== roomFilterLocation) return false;
        if (roomFilterDept && r.department !== roomFilterDept) return false;
        return true;
    });

    const filteredSubjects = subjects;

    useEffect(() => {
        if (initialData) {
            const sanitizedData = {
                ...initialData,
                days: initialData.days.map(day => ({
                    ...day,
                    classes: day.classes.map(cls => ({
                        ...cls,
                        id: cls.id || Math.random().toString(36).substr(2, 9)
                    }))
                }))
            };
            setRoutine(sanitizedData);
            setIsEditMode(true);
        }
    }, [initialData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teachersData, roomsData, subjectsData, departmentsData, routinesData] = await Promise.all([
                    fetchTeachers(),
                    fetchRooms(),
                    fetchSubjects(),
                    fetchDepartments(),
                    fetchRoutines()
                ]);

                setTeachers(Array.isArray(teachersData) ? teachersData.map(d => ({ ...d, id: d._id })) : (teachersData.data || []).map(d => ({ ...d, id: d._id })));
                setRooms(Array.isArray(roomsData) ? roomsData.map(d => ({ ...d, id: d._id })) : (roomsData.data || []).map(d => ({ ...d, id: d._id })));
                setSubjects(Array.isArray(subjectsData) ? subjectsData.map(d => ({ ...d, id: d._id })) : (subjectsData.data || []).map(d => ({ ...d, id: d._id })));
                setDepartments(Array.isArray(departmentsData) ? departmentsData.map(d => ({ ...d, id: d._id })) : (departmentsData.data || []).map(d => ({ ...d, id: d._id })));
                setAllRoutines(Array.isArray(routinesData) ? routinesData.map(d => ({ ...d, id: d._id })) : (routinesData.data || []).map(d => ({ ...d, id: d._id })));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Generate Technology Options when departments change
    useEffect(() => {
        if (Array.isArray(departments) && departments.length > 0) {
            const options = [];
            departments.forEach(dept => {
                SEMESTERS.forEach(sem => {
                    SHIFTS.forEach(shift => {
                        GROUPS.forEach(grp => {
                            if ((shift === "1st" && grp.endsWith("2")) || (shift === "2nd" && grp.endsWith("1"))) return; // Filter invalid Shift-Group combos

                            // User Logic: C1 and C2 only for "CT" (Computer)
                            const isComputer = dept.name.toLowerCase().includes('computer') || dept.name.toLowerCase().includes('ct') || (dept.code && dept.code === '66');
                            if ((grp === 'C1' || grp === 'C2') && !isComputer) return;

                            options.push({
                                id: `${dept.name}|${sem}|${shift}|${grp}`,
                                label: `${dept.name} - ${sem} - ${shift} (${grp})`,
                                dept: dept.name, sem, shift, grp
                            });
                        });
                    });
                });
            });
            setTechnologyOptions(options);
        }
    }, [departments]);


    const handleMetaChange = (e) => {
        const { name, value } = e.target;
        setRoutine(prev => ({
            ...prev,
            [name]: name === 'semester' ? Number(value) : value
        }));
    };

    // Check overlapping times
    const isTimeOverlap = (start1, end1, start2, end2) => {
        if (!start1 || !end1 || !start2 || !end2) return false;

        const getMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const s1 = getMinutes(start1);
        const e1 = getMinutes(end1);
        const s2 = getMinutes(start2);
        const e2 = getMinutes(end2);

        return Math.max(s1, s2) < Math.min(e1, e2);
    };

    const getTeacherStatus = (dayName, startTime, endTime, currentClassId, currentSubject) => {
        if (!startTime || !endTime) return { busy: new Set(), shared: new Set() };

        const busyTeachers = new Set();
        const sharedTeachers = new Set();
        const teacherUsageCounts = {};

        const processClass = (c) => {
            if (c.teacher && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                teacherUsageCounts[c.teacher] = (teacherUsageCounts[c.teacher] || 0) + 1;

                // Base Status Logic
                if (currentSubject && c.subject === currentSubject) {
                    sharedTeachers.add(c.teacher);
                } else {
                    busyTeachers.add(c.teacher);
                }
            }
        };

        allRoutines.forEach(r => {
            if (r.id === routine.id && isEditMode) return;
            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) dayData.classes.forEach(processClass);
        });

        const currentDay = routine.days.find(d => d.name === dayName);
        if (currentDay) {
            currentDay.classes.forEach(c => {
                if (c.id !== currentClassId) processClass(c);
            });
        }

        // Apply Max-2 Limit (Main + Second = 2)
        // If usage >= 2, force it to be BUSY (remove from shared, add to busy)
        Object.entries(teacherUsageCounts).forEach(([teacher, count]) => {
            if (count >= 2) {
                sharedTeachers.delete(teacher);
                busyTeachers.add(teacher);
            }
        });

        return { busy: busyTeachers, shared: sharedTeachers };
    };

    // Get unavailable rooms for a specific time slot
    // Get resource status for a specific time slot
    const getRoomStatus = (dayName, startTime, endTime, currentClassId, currentSubject) => {
        if (!startTime || !endTime) return { busy: new Set(), shared: new Set() };

        const busyRooms = new Set();
        const sharedRooms = new Set();
        const roomUsageCounts = {};

        const processClass = (c) => {
            if (c.room && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                roomUsageCounts[c.room] = (roomUsageCounts[c.room] || 0) + 1;

                if (currentSubject && c.subject === currentSubject) {
                    sharedRooms.add(c.room);
                } else {
                    busyRooms.add(c.room);
                }
            }
        };

        // Check against all other routines
        allRoutines.forEach(r => {
            if (r.id === routine.id && isEditMode) return;
            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) dayData.classes.forEach(processClass);
        });

        // Also check against other classes in the CURRENT routine (local state)
        const currentDayLocal = routine.days.find(d => d.name === dayName);
        if (currentDayLocal) {
            currentDayLocal.classes.forEach(c => {
                if (c.id !== currentClassId) processClass(c);
            });
        }

        // Apply Max-2 Limit
        Object.entries(roomUsageCounts).forEach(([room, count]) => {
            if (count >= 2) {
                sharedRooms.delete(room);
                busyRooms.add(room);
            }
        });

        return { busy: busyRooms, shared: sharedRooms };
    };

    const addClass = () => {
        const currentDayClasses = routine.days.find(d => d.name === activeDay)?.classes || [];

        let newStartTime = '08:00';
        let newEndTime = '08:45';

        // Auto-calculate time based on previous class or shift
        if (currentDayClasses.length > 0) {
            const lastClass = currentDayClasses[currentDayClasses.length - 1];
            if (lastClass.endTime) {
                newStartTime = lastClass.endTime;

                // Add 45 minutes to start time
                const [h, m] = newStartTime.split(':').map(Number);
                let totalMinutes = h * 60 + m + 45;
                const newH = Math.floor(totalMinutes / 60);
                const newM = totalMinutes % 60;
                newEndTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
            }
        } else {
            // First class: check shift
            if (routine.shift === '2nd') {
                newStartTime = '13:30';
                newEndTime = '14:15';
            } else {
                newStartTime = '08:00';
                newEndTime = '08:45';
            }
        }

        const newClass = {
            id: Math.random().toString(36).substr(2, 9),
            startTime: newStartTime,
            endTime: newEndTime,
            subjectCode: '',
            subject: '',
            teacher: '',
            room: ''
        };

        setRoutine(prev => ({
            ...prev,
            days: prev.days.map(d =>
                d.name === activeDay
                    ? { ...d, classes: [...d.classes, newClass] }
                    : d
            )
        }));
    };

    const removeClass = (classId) => {
        setRoutine(prev => ({
            ...prev,
            days: prev.days.map(d =>
                d.name === activeDay
                    ? { ...d, classes: d.classes.filter(c => c.id !== classId) }
                    : d
            )
        }));
    };

    const updateClass = (classId, field, value) => {
        setRoutine(prev => ({
            ...prev,
            days: prev.days.map(d =>
                d.name === activeDay
                    ? {
                        ...d,
                        classes: d.classes.map(c => {
                            if (c.id !== classId) return c;

                            let updates = { [field]: value };

                            // Auto-fill code if subject is selected from dropdown
                            if (field === 'subject') {
                                const selectedSubject = subjects.find(s => s.name === value);
                                if (selectedSubject) {
                                    updates.subjectCode = selectedSubject.code;
                                }
                            }

                            // Auto-fill subject if code is typed (on Enter handled separately, but update code here)
                            if (field === 'subjectCode') {
                                // Just update the code, lookup happens on Enter
                            }

                            return { ...c, ...updates };
                        })
                    }
                    : d
            )
        }));
    };

    const handleCodeKeyDown = (e, classId, code) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const foundSubject = subjects.find(s => s.code === code);
            if (foundSubject) {
                updateClass(classId, 'subject', foundSubject.name);
                toast.success(`Subject set to: ${foundSubject.name}`);
            } else {
                toast.error("Subject code not found");
            }
        }
    };

    // --- BATCH GENERATOR HANDLERS ---
    const addTeacherAssignment = (teacher) => {
        setAssignments([...assignments, {
            id: Date.now(),
            teacherId: teacher.id,
            teacherName: teacher.name,
            subjects: [{ id: Date.now() + 1, subject: '', theory: 0, lab: 0, technologies: [] }],
            blockedTimes: []
        }]);
        setTeacherSearchTerm("");
        setShowTeacherDropdown(false);
    };

    const removeTeacherAssignment = (id) => {
        setAssignments(assignments.filter(a => a.id !== id));
    };

    const updateAssignmentSubject = (assignId, subjectId, field, value) => {
        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            return {
                ...a,
                subjects: a.subjects.map(s => s.id === subjectId ? { ...s, [field]: value } : s)
            };
        }));
    };

    // Manage Blocked Times
    const addBlockedTime = (assignId, day, start, end) => {
        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            return {
                ...a,
                blockedTimes: [...(a.blockedTimes || []), { day, start, end }]
            };
        }));
    };

    const removeBlockedTime = (assignId, index) => {
        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            const newBlocked = [...(a.blockedTimes || [])];
            newBlocked.splice(index, 1);
            return { ...a, blockedTimes: newBlocked };
        }));
    };

    const addSubjectRow = (assignId) => {
        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            return {
                ...a,
                subjects: [...a.subjects, { id: Date.now(), subject: '', theory: 0, lab: 0, technologies: [] }]
            };
        }));
    };

    const removeSubjectRow = (assignId, subjectId) => {
        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            return {
                ...a,
                subjects: a.subjects.filter(s => s.id !== subjectId)
            };
        }));
    };

    const toggleTechnology = (assignId, subjectId, techId) => {
        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            return {
                ...a,
                subjects: a.subjects.map(s => {
                    if (s.id !== subjectId) return s;
                    const exists = s.technologies.includes(techId);
                    return {
                        ...s,
                        technologies: exists
                            ? s.technologies.filter(t => t !== techId)
                            : [...s.technologies, techId]
                    };
                })
            };
        }));
    };

    const handleOpenTechModal = (assignId, subId) => {
        setActiveTechSelection({ assignId, subId });
        setTechModalSearchTerm("");
        setShowTechModal(true);
    };

    const handleToggleTechFromModal = (techId) => {
        if (!activeTechSelection) return;
        toggleTechnology(activeTechSelection.assignId, activeTechSelection.subId, techId);
    };

    const handleSelectAllTech = () => {
        if (!activeTechSelection) return;
        const { assignId, subId } = activeTechSelection;

        // Find current subject techs
        const assignment = assignments.find(a => a.id === assignId);
        if (!assignment) return;
        const subject = assignment.subjects.find(s => s.id === subId);
        if (!subject) return;

        const filteredOptions = technologyOptions.filter(t => t.label.toLowerCase().includes(techModalSearchTerm.toLowerCase()));
        const allFilteredIds = filteredOptions.map(t => t.id);

        // Determine if we are selecting all or deselecting all based on current state of filtered items
        // If all filtered are already selected, deselect them. Otherwise, select them.
        const allSelected = allFilteredIds.every(id => subject.technologies.includes(id));

        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            return {
                ...a,
                subjects: a.subjects.map(s => {
                    if (s.id !== subId) return s;

                    let newTechs = [...s.technologies];
                    if (allSelected) {
                        // Deselect all filtered
                        newTechs = newTechs.filter(id => !allFilteredIds.includes(id));
                    } else {
                        // Select all filtered
                        const toAdd = allFilteredIds.filter(id => !newTechs.includes(id));
                        newTechs = [...newTechs, ...toAdd];
                    }
                    return { ...s, technologies: newTechs };
                })
            };
        }));
    };

    const handleBatchGenerate = async () => {
        try {
            const updatedRoutines = generateBatchRoutines(
                assignments,
                allRoutines,
                rooms,
                subjects
            );

            let saveCount = 0;
            for (const r of updatedRoutines) {
                await createRoutine({ ...r, lastUpdated: Date.now() });
                saveCount++;
            }

            setShowAutoModal(false);
            toast.success(`Generated & Saved ${saveCount} routines!`);

            // Refresh
            const newRoutines = await fetchRoutines();
            setAllRoutines(Array.isArray(newRoutines) ? newRoutines.map(d => ({ ...d, id: d._id })) : (newRoutines.data || []).map(d => ({ ...d, id: d._id })));

        } catch (err) {
            console.error(err);
            toast.error("Batch generation failed.");
        }
    };

    const handleSave = async () => {
        if (!routine.department) {
            toast("Please select a department", { type: "error", position: 'top-right' });
            return;
        }

        // Check for duplicates
        const isDuplicate = allRoutines.some(r =>
            r.department === routine.department &&
            Number(r.semester) === Number(routine.semester) &&
            r.shift === routine.shift &&
            r.group === routine.group &&
            r.id !== routine.id // Exclude current routine if editing
        );

        if (isDuplicate) {
            toast("A routine for this configuration already exists!", { type: "error", position: 'top-right' });
            return;
        }

        setSaving(true);
        try {
            const payload = { ...routine, lastUpdated: Date.now() };
            await createRoutine(payload);

            toast("Routine saved successfully!", { type: "success", position: 'top-right' });
        } catch (error) {
            console.error("Error saving routine:", error);
            toast("Failed to save routine", { type: "error", position: 'top-right' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='bg-gray-50 dark:bg-gray-950 min-h-screen'>
            <div className="container  mx-auto max-w-12xl py-8 px-2 pb-24">
                <div className="flex items-center justify-between mb-8 rounded-md sticky top-16 bg-white dark:bg-gray-800 z-30 p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-500 cursor-pointer rounded-full transition-colors"
                            onClick={() => onBack ? onBack() : router.back()}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'Edit Routine' : 'Create Routine'}</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAutoModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors shadow-sm"
                        >
                            <Sparkles size={18} className="mr-2" /> Auto Generate
                        </button>
                        <button
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className="min-w-[120px] bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-md flex items-center justify-center border border-gray-300 dark:border-slate-600 transition-colors"
                        >
                            {isPreviewMode ? (
                                <><Edit size={18} className="mr-2" /> Edit Mode</>
                            ) : (
                                <><Eye size={18} className="mr-2" /> Preview</>
                            )}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="min-w-[120px] bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Routine</>}
                        </button>
                    </div>
                </div>

                {/* Auto Generate Modal (New Batch UI) */}
                {showAutoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">
                            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="text-indigo-500" /> Batch Routine Generator
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Distribute teacher load across multiple technologies automatically.</p>
                                </div>
                                <button onClick={() => setShowAutoModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-slate-950/50">

                                {/* Add Teacher Section (Searchable) */}
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add Teacher Load:</label>
                                    <div className="relative w-full max-w-md">
                                        <input
                                            type="text"
                                            placeholder="Search & Select Teacher..."
                                            value={teacherSearchTerm}
                                            onChange={(e) => { setTeacherSearchTerm(e.target.value); setShowTeacherDropdown(true); }}
                                            onFocus={() => setShowTeacherDropdown(true)}
                                            className="w-full p-3 pl-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        {showTeacherDropdown && (
                                            <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                                                {teachers.filter(t => t.name.toLowerCase().includes(teacherSearchTerm.toLowerCase())).map(t => (
                                                    <div
                                                        key={t.id}
                                                        onClick={() => addTeacherAssignment(t)}
                                                        className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-sm font-medium border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                                                    >
                                                        {t.name} <span className="text-xs text-gray-400 block">{t.department}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Assignments List */}
                                <div className="space-y-6">
                                    {assignments.map((assignment, idx) => {
                                        // Total Load Calculation
                                        const totalTheory = assignment.subjects.reduce((sum, s) => sum + (s.theory * s.technologies.length), 0);
                                        const totalLab = assignment.subjects.reduce((sum, s) => sum + (s.lab * s.technologies.length), 0);

                                        return (
                                            <div key={assignment.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                {/* Header: Teacher Name */}
                                                <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center group">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                                            <User size={20} className="text-blue-500" />
                                                            {assignment.teacherName}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Total Load: <span className="font-bold text-indigo-600">{totalTheory} Theory</span> + <span className="font-bold text-pink-500">{totalLab} Lab</span> = {totalTheory + totalLab} periods
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {/* Block Time Constraint Toggle/Modal Trigger */}
                                                        <div className="flex items-center gap-2">
                                                            {(assignment.blockedTimes || []).map((bt, btIdx) => (
                                                                <span key={btIdx} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                                    {bt.day.slice(0, 3)} {bt.start}
                                                                    <X size={10} className="cursor-pointer" onClick={() => removeBlockedTime(assignment.id, btIdx)} />
                                                                </span>
                                                            ))}
                                                            <div className="relative group/blocked">
                                                                <button className="text-xs font-semibold text-gray-500 hover:text-red-500 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                                                                    <Clock size={12} /> Block Time
                                                                </button>
                                                                {/* Inline Block Time Form */}
                                                                <div className="hidden group-hover/blocked:block absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-50">
                                                                    <h4 className="text-xs font-bold mb-2">Add Unavailability</h4>
                                                                    <select id={`day-${assignment.id}`} className="w-full text-xs p-1 mb-2 bg-gray-50 dark:bg-slate-900 border rounded">
                                                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                                                    </select>
                                                                    <div className="flex gap-2 mb-2">
                                                                        <input type="time" id={`start-${assignment.id}`} className="w-1/2 text-xs p-1 bg-gray-50 dark:bg-slate-900 border rounded" />
                                                                        <input type="time" id={`end-${assignment.id}`} className="w-1/2 text-xs p-1 bg-gray-50 dark:bg-slate-900 border rounded" />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const d = document.getElementById(`day-${assignment.id}`).value;
                                                                            const s = document.getElementById(`start-${assignment.id}`).value;
                                                                            const e = document.getElementById(`end-${assignment.id}`).value;
                                                                            if (d && s && e) addBlockedTime(assignment.id, d, s, e);
                                                                        }}
                                                                        className="w-full bg-red-500 text-white text-xs py-1 rounded"
                                                                    >Add Block</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeTeacherAssignment(assignment.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Subjects Table */}
                                                <div className="p-4">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead className="text-xs uppercase text-gray-400 font-semibold border-b border-gray-100 dark:border-slate-800">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left w-1/5">Subject</th>
                                                                    <th className="px-3 py-2 text-left w-2/5">Technologies (Class Groups)</th>
                                                                    <th className="px-3 py-2 text-center w-20">Theory/Grp</th>
                                                                    <th className="px-3 py-2 text-center w-20">Lab/Grp</th>
                                                                    <th className="px-3 py-2 w-10"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                                {assignment.subjects.map((sub, sIdx) => {
                                                                    const subTotal = (sub.theory + sub.lab) * sub.technologies.length;
                                                                    return (
                                                                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                            <td className="px-3 py-3 align-top">
                                                                                {/* Searchable Subject Select */}
                                                                                <div className="relative group/sub">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={sub.subject}
                                                                                        onChange={(e) => updateAssignmentSubject(assignment.id, sub.id, 'subject', e.target.value)}
                                                                                        placeholder="Search..."
                                                                                        className="w-full p-2 bg-gray-50 dark:bg-slate-800 border rounded-lg border-gray-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500"
                                                                                    />
                                                                                    {sub.subject && !subjects.find(s => s.name === sub.subject) && (
                                                                                        <div className="hidden group-hover/sub:block absolute top-full left-0 w-full bg-white dark:bg-slate-800 border rounded shadow-lg z-20 max-h-40 overflow-auto">
                                                                                            {subjects.filter(s => s.name.toLowerCase().includes(sub.subject.toLowerCase()) || (s.code && s.code.toString().includes(sub.subject))).map(s => (
                                                                                                <div
                                                                                                    key={s.id}
                                                                                                    onClick={() => updateAssignmentSubject(assignment.id, sub.id, 'subject', s.name)}
                                                                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-xs"
                                                                                                >
                                                                                                    {s.name} <span className='text-gray-400'>({s.code})</span>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="mt-1 text-xs text-gray-400">Total: {subTotal} periods</div>
                                                                            </td>
                                                                            <td className="px-3 py-3 align-top">
                                                                                {/* Multi-Select Technologies */}
                                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                                    {sub.technologies.map(techId => {
                                                                                        const tech = technologyOptions.find(t => t.id === techId);
                                                                                        return (
                                                                                            <span key={techId} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                                                {tech?.label}
                                                                                                <button
                                                                                                    onClick={() => toggleTechnology(assignment.id, sub.id, techId)}
                                                                                                    className="ml-1.5 hover:text-blue-900 dark:hover:text-blue-100"
                                                                                                >
                                                                                                    <X size={12} />
                                                                                                </button>
                                                                                            </span>
                                                                                        );
                                                                                    })}
                                                                                </div>

                                                                                <button
                                                                                    onClick={() => handleOpenTechModal(assignment.id, sub.id)}
                                                                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 w-full justify-center"
                                                                                >
                                                                                    <Plus size={12} /> Add Technology / Class Group
                                                                                </button>
                                                                            </td>
                                                                            <td className="px-3 py-3 align-top">
                                                                                <input
                                                                                    type="number" min="0" max="10"
                                                                                    value={sub.theory}
                                                                                    onChange={(e) => updateAssignmentSubject(assignment.id, sub.id, 'theory', parseInt(e.target.value) || 0)}
                                                                                    className="w-full text-center p-2 bg-gray-50 dark:bg-slate-800 border rounded-lg border-gray-200 dark:border-slate-700"
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-3 align-top">
                                                                                <input
                                                                                    type="number" min="0" max="10"
                                                                                    value={sub.lab}
                                                                                    onChange={(e) => updateAssignmentSubject(assignment.id, sub.id, 'lab', parseInt(e.target.value) || 0)}
                                                                                    className="w-full text-center p-2 bg-gray-50 dark:bg-slate-800 border rounded-lg border-gray-200 dark:border-slate-700"
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-3 align-top">
                                                                                <button
                                                                                    onClick={() => removeSubjectRow(assignment.id, sub.id)}
                                                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                                <tr>
                                                                    <td colSpan="5" className="px-3 py-2">
                                                                        <button
                                                                            onClick={() => addSubjectRow(assignment.id)}
                                                                            className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                                                                        >
                                                                            <Plus size={16} /> Add Subject
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <button
                                                        onClick={() => addSubjectRow(assignment.id)}
                                                        className="mt-2 text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-indigo-50"
                                                    >
                                                        <Plus size={14} /> Add Another Subject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {assignments.length === 0 && (
                                        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Layers className="text-indigo-500" size={32} />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start Planning Loads</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-6">
                                                Select a teacher above to begin distributing their subject load across the institute.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAutoModal(false)}
                                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBatchGenerate}
                                    disabled={assignments.length === 0}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Sparkles size={18} /> Generate All Routines
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tech Selection Modal (Layered on top of Auto Modal) */}
                {showTechModal && activeTechSelection && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] border border-gray-200 dark:border-slate-700">
                            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Class Groups</h3>
                                <button onClick={() => setShowTechModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-3 bg-gray-50/50 dark:bg-slate-800/50">
                                <input
                                    type="text"
                                    placeholder="Search technologies (e.g. 'Computer 5th')..."
                                    value={techModalSearchTerm}
                                    onChange={(e) => setTechModalSearchTerm(e.target.value)}
                                    autoFocus
                                    className="w-full p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs text-gray-500">
                                        Showing {technologyOptions.filter(t => t.label.toLowerCase().includes(techModalSearchTerm.toLowerCase())).length} options
                                    </span>
                                    <button
                                        onClick={handleSelectAllTech}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                    >
                                        Toggle All Visible
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {technologyOptions
                                        .filter(opt => opt.label.toLowerCase().includes(techModalSearchTerm.toLowerCase()))
                                        .map(opt => {
                                            const assignment = assignments.find(a => a.id === activeTechSelection.assignId);
                                            const subject = assignment?.subjects.find(s => s.id === activeTechSelection.subId);
                                            const isSelected = subject?.technologies.includes(opt.id);

                                            return (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => handleToggleTechFromModal(opt.id)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${isSelected
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-sm font-medium">{opt.label}</span>
                                                    {isSelected && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                                                </div>
                                            );
                                        })
                                    }
                                    {technologyOptions.filter(opt => opt.label.toLowerCase().includes(techModalSearchTerm.toLowerCase())).length === 0 && (
                                        <div className="col-span-2 text-center py-8 text-gray-500">
                                            No class groups found matching "{techModalSearchTerm}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                                <button
                                    onClick={() => setShowTechModal(false)}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Preview Mode */}
                {isPreviewMode ? (
                    <RoutinePreview routine={routine} />
                ) : (
                    <>
                        {/* 1. Days Navigation (Horizontal) */}
                        <div className="flex overflow-x-auto pb-2 gap-2 mt-6 mb-6 no-scrollbar">
                            {DAYS.map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveDay(day)}
                                    className={`whitespace-nowrap px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 border ${activeDay === day
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span>{day}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeDay === day
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                        }`}>
                                        {routine.days.find(d => d.name === day)?.classes.length || 0}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* 2. Configuration & Filters (Grid) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Configuration Panel */}
                            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="bg-gray-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <GripVertical size={18} className="text-gray-400" />
                                        Routine Configuration
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Department</label>
                                        <select
                                            name="department"
                                            value={routine.department}
                                            onChange={handleMetaChange}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            disabled={isEditMode}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.slice(0, 7).map((dept, index) => (
                                                <option key={index} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Semester</label>
                                        <select
                                            name="semester"
                                            value={routine.semester}
                                            onChange={handleMetaChange}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            disabled={isEditMode}
                                        >
                                            <option value="">Select Semester</option>
                                            {SEMESTERS.map((sem, index) => (
                                                <option key={index} value={sem}>{sem}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Shift</label>
                                        <select
                                            name="shift"
                                            value={routine.shift}
                                            onChange={handleMetaChange}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            disabled={isEditMode}
                                        >
                                            <option value="">Select Shift</option>
                                            {SHIFTS.map((shift, index) => (
                                                <option key={index} value={shift}>{shift}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Group</label>
                                        <select
                                            name="group"
                                            value={routine.group}
                                            onChange={handleMetaChange}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            disabled={isEditMode}
                                        >
                                            <option value="">Select Group</option>
                                            {GROUPS.filter((grp, index) => {
                                                if (routine.shift === "1st") return ["A1", "B1", "C1"].includes(grp);
                                                if (routine.shift === "2nd") return ["A2", "B2", "C2"].includes(grp);
                                                return true;
                                            }).map((grp, index) => (
                                                <option key={index} value={grp}>{grp}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Resources Panel */}
                            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="bg-gray-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Plus size={18} className="text-gray-400" />
                                        Resource Filters
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Teachers by Dept</label>
                                        <select
                                            value={teacherFilterDept}
                                            onChange={(e) => setTeacherFilterDept(e.target.value)}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map((dept, index) => (
                                                <option key={index} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Rooms by Type</label>
                                        <select
                                            value={roomFilterType}
                                            onChange={(e) => setRoomFilterType(e.target.value)}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="">All Types</option>
                                            <option value="Theory">Theory</option>
                                            <option value="Lab">Lab</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Rooms by Location</label>
                                        <select
                                            value={roomFilterLocation}
                                            onChange={(e) => setRoomFilterLocation(e.target.value)}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="">All Locations</option>
                                            <option value="Computer Building">Computer Building</option>
                                            <option value="Administration Building">Administration Building</option>
                                            <option value="New Building">New Building</option>
                                            <option value="Old Building">Old Building</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Rooms by Dept</label>
                                        <select
                                            value={roomFilterDept}
                                            onChange={(e) => setRoomFilterDept(e.target.value)}
                                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map((dept, index) => (
                                                <option key={index} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Class Editor (Full Width) */}
                        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 min-h-[500px] flex flex-col">
                            <div className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-xl">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                                    {activeDay} Schedule
                                </h2>
                                <button
                                    onClick={addClass}
                                    className="flex items-center text-sm font-medium bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-500/20"
                                >
                                    <Plus size={16} className="mr-1.5" /> Add New Class
                                </button>
                            </div>
                            <div className="p-6 space-y-4 flex-1">
                                {routine.days.find(d => d.name === activeDay)?.classes.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl h-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-800/50">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                            <Plus className="text-gray-400" size={32} />
                                        </div>
                                        <p className="text-gray-600 dark:text-slate-300 font-medium mb-1">No classes added for {activeDay}</p>
                                        <p className="text-gray-400 text-sm mb-4">Get started by adding your first class</p>
                                        <button onClick={addClass} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Add First Class</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {routine.days.find(d => d.name === activeDay)?.classes.map((cls, index) => {
                                            const { busy: busyTeachers, shared: sharedTeachers } = getTeacherStatus(activeDay, cls.startTime, cls.endTime, cls.id, cls.subject);
                                            const { busy: busyRooms, shared: sharedRooms } = getRoomStatus(activeDay, cls.startTime, cls.endTime, cls.id, cls.subject);
                                            return (
                                                <div key={index} className="group flex flex-col xl:flex-row gap-4 items-start xl:items-center bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md dark:shadow-none">
                                                    {/* Adjusted Grid for Code input */}
                                                    <div className="grid grid-cols-2 md:grid-cols-12 gap-4 w-full">
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Start Time</label>
                                                            <input
                                                                type="time"
                                                                value={cls.startTime || ''}
                                                                onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                                                                className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">End Time</label>
                                                            <input
                                                                type="time"
                                                                value={cls.endTime || ''}
                                                                onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                                                                className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 md:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Sub Code</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Code"
                                                                value={cls.subjectCode || ''}
                                                                onChange={(e) => updateClass(cls.id, 'subjectCode', e.target.value)}
                                                                onKeyDown={(e) => handleCodeKeyDown(e, cls.id, cls.subjectCode)}
                                                                className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 md:col-span-3">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Subject</label>
                                                            <select
                                                                value={cls.subject || ''}
                                                                onChange={(e) => updateClass(cls.id, 'subject', e.target.value)}
                                                                className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                            >
                                                                <option className='text-gray-500' value="">Select Subject</option>
                                                                {filteredSubjects.map((sub, index) => (
                                                                    <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={index} value={sub.name}>{sub.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2 md:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Teacher</label>
                                                            <select
                                                                value={cls.teacher || ''}
                                                                onChange={(e) => updateClass(cls.id, 'teacher', e.target.value)}
                                                                className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                            >
                                                                <option className='text-gray-500' value="">Select Teacher</option>
                                                                {(() => {
                                                                    const selectedTeacherObj = teachers.find(t => t.name === cls.teacher);
                                                                    let teachersToShow = filteredTeachers;

                                                                    // If selected teacher exists but is filtered out, add them back for this specific dropdown
                                                                    if (selectedTeacherObj && !teachersToShow.find(t => t.id === selectedTeacherObj.id)) {
                                                                        teachersToShow = [...teachersToShow, selectedTeacherObj];
                                                                        // Optional: keep sorted
                                                                        teachersToShow.sort((a, b) => a.name.localeCompare(b.name));
                                                                    }

                                                                    return teachersToShow.map((t, index) => {
                                                                        const isBusy = busyTeachers.has(t.name);
                                                                        const isShared = sharedTeachers.has(t.name);
                                                                        let statusClass = "text-gray-900 dark:text-white bg-white dark:bg-slate-800";
                                                                        if (isBusy) statusClass = "text-red-500 font-medium";
                                                                        else if (isShared) statusClass = "text-green-600 font-bold";

                                                                        return (
                                                                            <option
                                                                                className={statusClass}
                                                                                key={index}
                                                                                value={t.name}
                                                                                disabled={isBusy && t.name !== cls.teacher}
                                                                            >
                                                                                {t.name} {isBusy ? '(Busy)' : ''} {isShared ? '(Shared)' : ''}
                                                                            </option>
                                                                        );
                                                                    });
                                                                })()}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2 md:col-span-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Room</label>
                                                            <select
                                                                value={cls.room || ''}
                                                                onChange={(e) => updateClass(cls.id, 'room', e.target.value)}
                                                                className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                            >
                                                                <option className='text-gray-500' value="">Room</option>
                                                                {(() => {
                                                                    const selectedRoomObj = rooms.find(r => (r.number || r.name) === cls.room);
                                                                    let roomsToShow = filteredRooms;

                                                                    // If selected room exists but is filtered out, add it back for this specific dropdown
                                                                    if (selectedRoomObj && !roomsToShow.find(r => r.id === selectedRoomObj.id)) {
                                                                        roomsToShow = [...roomsToShow, selectedRoomObj];
                                                                        // Optional: keep sorted
                                                                        roomsToShow.sort((a, b) => (a.number || a.name).localeCompare(b.number || b.name));
                                                                    }

                                                                    return roomsToShow.map((r, index) => {
                                                                        const isBusy = busyRooms.has(r.number || r.name);
                                                                        const isShared = sharedRooms.has(r.number || r.name);

                                                                        let statusClass = "text-gray-900 dark:text-white bg-white dark:bg-slate-800";
                                                                        if (isBusy) statusClass = "text-red-500 font-medium";
                                                                        else if (isShared) statusClass = "text-green-600 font-bold";

                                                                        return (
                                                                            <option
                                                                                className={statusClass}
                                                                                key={index}
                                                                                value={r.number || r.name}
                                                                                disabled={isBusy && (r.number || r.name) !== cls.room}
                                                                            >
                                                                                {r.number || r.name} {r.type ? `(${r.type})` : ''} {r.capacity ? `[Cap: ${r.capacity}]` : ''} {isBusy ? '(Busy)' : ''} {isShared ? '(Shared)' : ''}
                                                                            </option>
                                                                        );
                                                                    });
                                                                })()}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeClass(cls.id)}
                                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/20 xl:self-center self-end"
                                                        title="Remove Class"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};

// RoutinePreview Component - Using exact template from /routine page
const RoutinePreview = ({ routine }) => {
    const timeSlots = useMemo(() => {
        if (routine.shift === "1st") {
            return [
                { label: "08:00 - 08:45", start: "08:00", end: "08:45" },
                { label: "08:45 - 09:30", start: "08:45", end: "09:30" },
                { label: "09:30 - 10:15", start: "09:30", end: "10:15" },
                { label: "10:15 - 11:00", start: "10:15", end: "11:00" },
                { label: "11:00 - 11:45", start: "11:00", end: "11:45" },
                { label: "11:45 - 12:30", start: "11:45", end: "12:30" },
                { label: "12:30 - 01:15", start: "12:30", end: "13:15" },
            ];
        } else if (routine.shift === "2nd") {
            return [
                { label: "01:30 - 02:15", start: "13:30", end: "14:15" },
                { label: "02:15 - 03:00", start: "14:15", end: "15:00" },
                { label: "03:00 - 03:45", start: "15:00", end: "15:45" },
                { label: "03:45 - 04:30", start: "15:45", end: "16:30" },
                { label: "04:30 - 05:15", start: "16:30", end: "17:15" },
                { label: "05:15 - 06:00", start: "17:15", end: "18:00" },
                { label: "06:00 - 06:45", start: "18:00", end: "18:45" }
            ];
        }
        return [];
    }, [routine.shift]);

    const getClassForSlot = (dayName, slotIndex) => {
        const day = routine.days.find(d => d.name === dayName);
        if (!day) return null;

        const slot = timeSlots[slotIndex];
        if (!slot) return null;

        return day.classes.find(cls => cls.startTime === slot.start);
    };

    const getClassSpanInfo = (classInfo, slots) => {
        if (!classInfo || !slots) return { colspan: 1 };
        const startIndex = slots.findIndex(s => s.start === classInfo.startTime);
        if (startIndex === -1) return { colspan: 1 };

        const endIndex = slots.findIndex(s => s.end === classInfo.endTime);
        if (endIndex === -1) return { colspan: 1 };

        return { colspan: endIndex - startIndex + 1 };
    };

    const shouldSkipSlot = (dayName, slotIndex) => {
        const day = routine.days.find(d => d.name === dayName);
        if (!day) return false;

        for (let i = 0; i < slotIndex; i++) {
            const classInfo = getClassForSlot(dayName, i);
            if (classInfo) {
                const spanInfo = getClassSpanInfo(classInfo, timeSlots);
                if (spanInfo && (i + spanInfo.colspan) > slotIndex) {
                    return true;
                }
            }
        }
        return false;
    };

    return (
        <div className="mt-6 space-y-6">
            {/* Routine Info Header */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
                <h2 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white mb-4">Routine Preview</h2>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white mb-1">
                            {routine.department || 'Not Set'} - Semester {routine.semester || 'N/A'}
                        </h3>
                        <p className="text-[#2C1810]/70 dark:text-gray-400 text-sm">
                            {routine.shift || 'N/A'} Shift • Group {routine.group || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Routine Table - Exact template from /routine page */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px] border border-gray-200 dark:border-gray-700">
                        <thead>
                            <tr className="bg-[#FF5C35] text-white">
                                <th className="border border-white/20 px-4 py-3 font-semibold text-left min-w-[120px]">
                                    Day
                                </th>
                                {timeSlots.map((slot, index) => (
                                    <th key={index} className="border border-white/20 px-3 py-3 font-semibold text-center min-w-[150px]">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock size={14} className="text-white" />
                                            <span className="text-sm">{slot.label}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((day, dayIndex) => (
                                <tr key={day} className={dayIndex % 2 === 0 ? 'bg-white dark:bg-[#1E293B]' : 'bg-[#FFFBF2] dark:bg-[#151e2e]'}>
                                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-semibold text-[#2C1810] dark:text-white">
                                        {day}
                                    </td>
                                    {timeSlots.map((slot, slotIndex) => {
                                        if (shouldSkipSlot(day, slotIndex)) {
                                            return null;
                                        }

                                        const classInfo = getClassForSlot(day, slotIndex);
                                        const spanInfo = classInfo ? getClassSpanInfo(classInfo, timeSlots) : null;
                                        const colspan = spanInfo ? spanInfo.colspan : 1;

                                        return (
                                            <td
                                                key={slotIndex}
                                                colSpan={colspan}
                                                className="border border-gray-200 dark:border-gray-700 px-3 py-3 text-center"
                                            >
                                                {classInfo ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <BookOpen size={14} className="text-[#FF5C35]" />
                                                            <p className="font-semibold text-sm text-[#2C1810] dark:text-white">
                                                                {classInfo.subjectCode || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-[#2C1810]/80 dark:text-gray-300 font-medium">
                                                            {classInfo.subject || 'No Subject'}
                                                        </p>
                                                        <div className="flex items-center justify-center gap-1 mt-1">
                                                            <User size={12} className="text-[#FF5C35]" />
                                                            <p className="text-xs text-[#2C1810]/70 dark:text-gray-400">
                                                                {classInfo.teacher || 'No Teacher'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <MapPin size={12} className="text-[#FF5C35]" />
                                                            <p className="text-xs text-[#FF5C35] font-medium">
                                                                {classInfo.room || 'No Room'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600 text-xs">----</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
