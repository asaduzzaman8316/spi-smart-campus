"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTeachers, fetchRooms, fetchSubjects, fetchDepartments, fetchRoutines, createRoutine } from '../../Lib/api';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { toast } from 'react-toastify';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
const SHIFTS = ["1st", "2nd"];
const GROUPS = ["A1", "A2", "B1", "B2"];

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

    // Data from Firebase
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allRoutines, setAllRoutines] = useState([]); // Store all routines for conflict checking

    // Resource Filters State
    const [teacherFilterDept, setTeacherFilterDept] = useState('');
    // Filtered lists
    const filteredTeachers = teacherFilterDept
        ? teachers.filter(t => t.department === teacherFilterDept)
        : teachers;

    // Use all subjects as filter is removed
    const filteredSubjects = subjects;

    useEffect(() => {
        if (initialData) {
            // Ensure all classes have IDs to prevent key warnings
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

                setTeachers(teachersData.map(d => ({ ...d, id: d._id })));
                setRooms(roomsData.map(d => ({ ...d, id: d._id })));
                setSubjects(subjectsData.map(d => ({ ...d, id: d._id })));
                setDepartments(departmentsData.map(d => ({ ...d, id: d._id })));
                setAllRoutines(routinesData.map(d => ({ ...d, id: d._id })));
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

    // Helper to check time overlap
    const isTimeOverlap = (start1, end1, start2, end2) => {
        if (!start1 || !end1 || !start2 || !end2) return false;
        // Convert times to minutes for easier comparison
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

    // Get unavailable teachers for a specific time slot
    const getUnavailableTeachers = (dayName, startTime, endTime, currentClassId) => {
        if (!startTime || !endTime) return new Set();

        const busyTeachers = new Set();

        // Check against all other routines
        allRoutines.forEach(r => {
            if (r.id === routine.id && isEditMode) return;

            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) {
                dayData.classes.forEach(c => {
                    if (c.teacher && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                        busyTeachers.add(c.teacher);
                    }
                });
            }
        });

        // Also check against other classes in the CURRENT routine (local state)
        // to prevent assigning the same teacher to two overlapping classes in the same routine
        const currentDay = routine.days.find(d => d.name === dayName);
        if (currentDay) {
            currentDay.classes.forEach(c => {
                if (c.id !== currentClassId && c.teacher && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                    busyTeachers.add(c.teacher);
                }
            });
        }

        return busyTeachers;
    };

    // Get unavailable rooms for a specific time slot
    const getUnavailableRooms = (dayName, startTime, endTime, currentClassId) => {
        if (!startTime || !endTime) return new Set();

        const busyRooms = new Set();

        // Check against all other routines
        allRoutines.forEach(r => {
            if (r.id === routine.id && isEditMode) return;

            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) {
                dayData.classes.forEach(c => {
                    if (c.room && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                        busyRooms.add(c.room);
                    }
                });
            }
        });

        // Also check against other classes in the CURRENT routine (local state)
        // to prevent assigning the same room to two overlapping classes in the same routine
        const currentDay = routine.days.find(d => d.name === activeDay); // Use activeDay or dayName? helper uses activeDay implicitly via routine state, but we should use dayName argument to be safe, though here dayName is activeDay.
        // Wait, the original getUnavailableTeachers uses routine.days.find(d => d.name === dayName). 
        // Let's stick to consistent logic.

        const currentDayLocal = routine.days.find(d => d.name === dayName);
        if (currentDayLocal) {
            currentDayLocal.classes.forEach(c => {
                if (c.id !== currentClassId && c.room && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                    busyRooms.add(c.room);
                }
            });
        }

        return busyRooms;
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

                <div className="grid grid-cols-1 lg:grid-cols-4 mt-12 gap-8">

                    {/* Left Sidebar: Controls & Day Nav */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Configuration</div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={routine.department}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-gray-500 dark:text-slate-400' value="">Select Department</option>
                                        {departments.map((dept, index) => (
                                            <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={index} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Semester</label>
                                    <select
                                        name="semester"
                                        value={routine.semester}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-gray-500 dark:text-slate-400' value="">Select Semester</option>
                                        {SEMESTERS.map((sem, index) => (
                                            <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={index} value={sem}>{sem}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Shift</label>
                                    <select
                                        name="shift"
                                        value={routine.shift}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-gray-500 dark:text-slate-400' value="">Select Shift</option>
                                        {SHIFTS.map((shift, index) => (
                                            <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={index} value={shift}>{shift}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Group</label>
                                    <select
                                        name="group"
                                        value={routine.group}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-gray-500 dark:text-slate-400' value="">Select Group</option>
                                        {GROUPS.filter((grp, index) => {
                                            if (routine.shift === "1st") return ["A1", "B1"].includes(grp);
                                            if (routine.shift === "2nd") return ["A2", "B2"].includes(grp);
                                            return true;
                                        }).map((grp, index) => (
                                            <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={index} value={grp}>{grp}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Resource Filters */}
                            <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-slate-700">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-3">Resource Filters</h3>

                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Filter Teachers by Dept</label>
                                    <select
                                        value={teacherFilterDept}
                                        onChange={(e) => setTeacherFilterDept(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-md text-sm p-2 border text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                                    >
                                        <option className='text-gray-500 dark:text-slate-400' value="">All Departments</option>
                                        {departments.map((dept, index) => (
                                            <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={index} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-xs font-semibold uppercase text-gray-500 dark:text-white mb-2 px-2">Days of Week</label>
                        {DAYS.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveDay(day)}
                                className={`text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${activeDay === day
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent dark:border-transparent'
                                    }`}
                            >
                                <span className="font-medium">{day}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeDay === day ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                    {routine.days.find(d => d.name === day)?.classes.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content: Class Editor */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-800 shadow rounded-lg min-h-[500px] flex flex-col border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-lg">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeDay} Schedule</h2>
                            <button
                                onClick={addClass}
                                className="flex items-center text-sm bg-gray-200 dark:bg-slate-100 hover:bg-gray-300 dark:hover:bg-slate-200 text-gray-900 dark:text-slate-700 px-3 py-1.5 rounded-md transition-colors"
                            >
                                <Plus size={16} className="mr-1" /> Add Class
                            </button>
                        </div>
                        <div className="p-6 space-y-4 flex-1">
                            {routine.days.find(d => d.name === activeDay)?.classes.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-slate-200 rounded-lg h-full flex flex-col items-center justify-center">
                                    <p className="text-gray-600 dark:text-white mb-2">No classes added for {activeDay}</p>
                                    <button onClick={addClass} className="text-blue-600 hover:underline">Add First Class</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {routine.days.find(d => d.name === activeDay)?.classes.map((cls, index) => {
                                        const unavailableTeachers = getUnavailableTeachers(activeDay, cls.startTime, cls.endTime, cls.id);
                                        const unavailableRooms = getUnavailableRooms(activeDay, cls.startTime, cls.endTime, cls.id);
                                        return (
                                            <div key={index} className="group flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-200 hover:border-blue-400 transition-colors shadow-sm dark:shadow-none">
                                                {/* Adjusted Grid for Code input */}
                                                <div className="grid grid-cols-2 md:grid-cols-12 gap-3 w-full">
                                                    <div className="col-span-1 md:col-span-2">
                                                        <label className="text-xs text-gray-700 dark:text-white mb-1 block">Start</label>
                                                        <input
                                                            type="time"
                                                            value={cls.startTime || ''}
                                                            onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2">
                                                        <label className="text-xs text-gray-700 dark:text-white mb-1 block">End</label>
                                                        <input
                                                            type="time"
                                                            value={cls.endTime || ''}
                                                            onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 md:col-span-2">
                                                        <label className="text-xs text-gray-700 dark:text-white mb-1 block">Code</label>
                                                        <input
                                                            type="text"
                                                            placeholder="66611"
                                                            value={cls.subjectCode || ''}
                                                            onChange={(e) => updateClass(cls.id, 'subjectCode', e.target.value)}
                                                            onKeyDown={(e) => handleCodeKeyDown(e, cls.id, cls.subjectCode)}
                                                            className="w-full text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 md:col-span-3">
                                                        <label className="text-xs text-gray-700 dark:text-white mb-1 block">Subject</label>
                                                        <select
                                                            value={cls.subject || ''}
                                                            onChange={(e) => updateClass(cls.id, 'subject', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                        >
                                                            <option className='text-gray-500 dark:text-slate-400' value="">Select Subject</option>
                                                            {filteredSubjects.map((sub, index) => (
                                                                <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={index} value={sub.name}>{sub.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-2">
                                                        <label className="text-xs text-gray-700 dark:text-white mb-1 block">Teacher</label>
                                                        <select
                                                            value={cls.teacher || ''}
                                                            onChange={(e) => updateClass(cls.id, 'teacher', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                        >
                                                            <option className='text-gray-500 dark:text-slate-400' value="">Select Teacher</option>
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
                                                                    const isBusy = unavailableTeachers.has(t.name);
                                                                    return (
                                                                        <option
                                                                            className={`text-gray-900 dark:text-white bg-white dark:bg-slate-800 ${isBusy ? 'text-red-500 dark:text-red-400' : ''}`}
                                                                            key={index}
                                                                            value={t.name}
                                                                            disabled={isBusy && t.name !== cls.teacher} // Allow keeping current teacher if already selected, or just disable
                                                                        >
                                                                            {t.name} {isBusy ? '(Busy)' : ''}
                                                                        </option>
                                                                    );
                                                                });
                                                            })()}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1">
                                                        <label className="text-xs text-gray-700 dark:text-white mb-1 block">Room</label>
                                                        <select
                                                            value={cls.room || ''}
                                                            onChange={(e) => updateClass(cls.id, 'room', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                        >
                                                            <option className='text-gray-500 dark:text-slate-400' value="">Room</option>
                                                            {rooms.map((r, index) => {
                                                                const isBusy = unavailableRooms.has(r.number || r.name);
                                                                return (
                                                                    <option
                                                                        className={`text-gray-900 dark:text-white bg-white dark:bg-slate-800 ${isBusy ? 'text-red-500 dark:text-red-400' : ''}`}
                                                                        key={index}
                                                                        value={r.number || r.name}
                                                                        disabled={isBusy && (r.number || r.name) !== cls.room}
                                                                    >
                                                                        {r.number || r.name} {isBusy ? '(Busy)' : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeClass(cls.id)}
                                                    className="p-2 text-gray-500 dark:text-white hover:text-red-500  rounded-md transition-colors self-end md:self-center"
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
        </div>
    );
};
