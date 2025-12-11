"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTeachers, fetchRooms, fetchSubjects, fetchDepartments, fetchRoutines, createRoutine } from '../../Lib/api';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { toast } from 'react-toastify';

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

    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allRoutines, setAllRoutines] = useState([]);

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
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="min-w-[120px] bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Routine</>}
                    </button>
                </div>

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
                                        if (routine.shift === "1st") return ["A1", "B1"].includes(grp);
                                        if (routine.shift === "2nd") return ["A2", "B2"].includes(grp);
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
            </div>
        </div>
    );
};
