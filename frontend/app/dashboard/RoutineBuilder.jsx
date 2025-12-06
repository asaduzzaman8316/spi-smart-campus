"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTeachers, fetchRooms, fetchSubjects, fetchDepartments, fetchRoutines, createRoutine } from '../../Lib/api';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { toast } from 'react-toastify';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"];
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
    const [subjectFilterDept, setSubjectFilterDept] = useState('');

    // Filtered lists
    const filteredTeachers = teacherFilterDept
        ? teachers.filter(t => t.department === teacherFilterDept)
        : teachers;

    const filteredSubjects = subjectFilterDept
        ? subjects.filter(s => s.department === subjectFilterDept)
        : subjects;

    useEffect(() => {
        if (initialData) {
            setRoutine(initialData);
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

    const addClass = () => {
        const newClass = {
            id: Math.random().toString(36).substr(2, 9),
            startTime: '08:00',
            endTime: '08:45',
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

                            // Auto-fill code if subject is selected
                            if (field === 'subject') {
                                const selectedSubject = subjects.find(s => s.name === value);
                                if (selectedSubject) {
                                    updates.subjectCode = selectedSubject.code;
                                }
                            }

                            return { ...c, ...updates };
                        })
                    }
                    : d
            )
        }));
    };

    const handleSave = async () => {
        if (!routine.department) {
            toast("Please select a department", { type: "error", position: 'top-right' });
            return;
        }
        setSaving(true);
        try {
            const payload = { ...routine, lastUpdated: Date.now() };
            // Backend handles upsert logic based on department, semester, shift, group
            await createRoutine(payload);

            toast("Routine saved successfully!", { type: "success", position: 'top-right' });
            //  router.push('/admin/dashboard'); // Uncomment if you have this route
        } catch (error) {
            console.error("Error saving routine:", error);
            toast("Failed to save routine", { type: "error", position: 'top-right' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='bg-slate-900 '>
            <div className="container  mx-auto max-w-12xl py-8 px-4 pb-24">
                <div className="flex items-center text-white justify-between  mb-8 rounded-md sticky top-16 bg-gray-700 z-30 p-4 border-b">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 hover:bg-slate-500 cursor-pointer rounded-full transition-colors"
                            onClick={() => onBack ? onBack() : router.back()}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Routine' : 'Create Routine'}</h1>
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
                        <div className="bg-slate-800 shadow rounded-lg overflow-hidden">
                            <div className="bg-slate-700 px-4 py-3 border-b font-semibold text-white">Configuration</div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={routine.department}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-slate-400' value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option className='text-white bg-slate-800' key={dept._id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Semester</label>
                                    <select
                                        name="semester"
                                        value={routine.semester}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-slate-400' value="">Select Semester</option>
                                        {SEMESTERS.map((sem, index) => (
                                            <option className='text-white bg-slate-800' key={index} value={sem}>{sem}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Shift</label>
                                    <select
                                        name="shift"
                                        value={routine.shift}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-slate-400' value="">Select Shift</option>
                                        {SHIFTS.map((shift, index) => (
                                            <option className='text-white bg-slate-800' key={index} value={shift}>{shift}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Group</label>
                                    <select
                                        name="group"
                                        value={routine.group}
                                        onChange={handleMetaChange}
                                        className="w-full outline-none bg-slate-800 text-white border-slate-600 rounded-md shadow-sm p-2 border focus:border-blue-500"
                                        disabled={isEditMode}
                                    >
                                        <option className='text-slate-400' value="">Select Group</option>
                                        {GROUPS.filter((grp, index) => {
                                            if (routine.shift === "1st") return ["A1", "B1"].includes(grp);
                                            if (routine.shift === "2nd") return ["A2", "B2"].includes(grp);
                                            return true;
                                        }).map((grp, index) => (
                                            <option className='text-white bg-slate-800' key={index} value={grp}>{grp}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Resource Filters */}
                            <div className="px-4 pb-4 pt-2 border-t border-slate-700">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Resource Filters</h3>

                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Filter Teachers by Dept</label>
                                    <select
                                        value={teacherFilterDept}
                                        onChange={(e) => setTeacherFilterDept(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-600 rounded-md text-sm p-2 border text-white focus:border-blue-500 outline-none"
                                    >
                                        <option className='text-slate-400' value="">All Departments</option>
                                        {departments.map((dept, index) => (
                                            <option className='text-white bg-slate-800' key={index} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Filter Subjects by Dept</label>
                                    <select
                                        value={subjectFilterDept}
                                        onChange={(e) => setSubjectFilterDept(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-600 rounded-md text-sm p-2 border text-white focus:border-blue-500 outline-none"
                                    >
                                        <option className='text-slate-400' value="">All Departments</option>
                                        {departments.map((dept, index) => (
                                            <option className='text-white bg-slate-800' key={index} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-semibold uppercase text-white mb-2 px-2">Days of Week</label>
                            {DAYS.map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveDay(day)}
                                    className={`text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${activeDay === day
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="font-medium">{day}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeDay === day ? 'bg-white/20' : 'bg-slate-700'}`}>
                                        {routine.days.find(d => d.name === day)?.classes.length || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content: Class Editor */}
                    <div className="lg:col-span-3">
                        <div className="bg-slate-800 shadow rounded-lg min-h-[500px] flex flex-col">
                            <div className="bg-slate-700 border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-lg">
                                <h2 className="text-lg font-bold text-white">{activeDay} Schedule</h2>
                                <button
                                    onClick={addClass}
                                    className="flex items-center text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    <Plus size={16} className="mr-1" /> Add Class
                                </button>
                            </div>
                            <div className="p-6 space-y-4 flex-1">
                                {routine.days.find(d => d.name === activeDay)?.classes.length === 0 ? (
                                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg h-full flex flex-col items-center justify-center">
                                        <p className="text-white mb-2">No classes added for {activeDay}</p>
                                        <button onClick={addClass} className="text-blue-600 hover:underline">Add First Class</button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {routine.days.find(d => d.name === activeDay)?.classes.map((cls, index) => {
                                            const unavailableTeachers = getUnavailableTeachers(activeDay, cls.startTime, cls.endTime, cls.id);
                                            return (
                                                <div key={cls.id} className="group flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-900 p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                                                    {/* Adjusted Grid for Code input */}
                                                    <div className="grid grid-cols-2 md:grid-cols-12 gap-3 w-full">
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-xs text-white mb-1 block">Start</label>
                                                            <input
                                                                type="time"
                                                                value={cls.startTime || ''}
                                                                onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                                                                className="w-full text-sm bg-slate-800 border-slate-600 text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-xs text-white mb-1 block">End</label>
                                                            <input
                                                                type="time"
                                                                value={cls.endTime || ''}
                                                                onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                                                                className="w-full text-sm bg-slate-800 border-slate-600 text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 md:col-span-2">
                                                            <label className="text-xs text-white mb-1 block">Code</label>
                                                            <input
                                                                type="text"
                                                                placeholder="66611"
                                                                value={cls.subjectCode || ''}
                                                                readOnly
                                                                className="w-full text-sm bg-slate-800/50 border-slate-700 rounded-md p-2 border text-slate-400 cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 md:col-span-3">
                                                            <label className="text-xs text-white mb-1 block">Subject</label>
                                                            <select
                                                                value={cls.subject || ''}
                                                                onChange={(e) => updateClass(cls.id, 'subject', e.target.value)}
                                                                className="w-full text-sm bg-slate-800 border-slate-600 text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                            >
                                                                <option className='text-slate-400' value="">Select Subject</option>
                                                                {filteredSubjects.map((sub, index) => (
                                                                    <option className='text-white bg-slate-800' key={index} value={sub.name}>{sub.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2 md:col-span-2">
                                                            <label className="text-xs text-white mb-1 block">Teacher</label>
                                                            <select
                                                                value={cls.teacher || ''}
                                                                onChange={(e) => updateClass(cls.id, 'teacher', e.target.value)}
                                                                className="w-full text-sm bg-slate-800 border-slate-600 text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                            >
                                                                <option className='text-slate-400' value="">Select Teacher</option>
                                                                {filteredTeachers.map((t, index) => {
                                                                    const isBusy = unavailableTeachers.has(t.name);
                                                                    return (
                                                                        <option
                                                                            className={`text-white bg-slate-800 ${isBusy ? 'text-red-400' : ''}`}
                                                                            key={index}
                                                                            value={t.name}
                                                                            disabled={isBusy && t.name !== cls.teacher} // Allow keeping current teacher if already selected, or just disable
                                                                        >
                                                                            {t.name} {isBusy ? '(Busy)' : ''}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2 md:col-span-1">
                                                            <label className="text-xs text-white mb-1 block">Room</label>
                                                            <select
                                                                value={cls.room || ''}
                                                                onChange={(e) => updateClass(cls.id, 'room', e.target.value)}
                                                                className="w-full text-sm bg-slate-800 border-slate-600 text-white rounded-md p-2 border focus:border-blue-500 outline-none"
                                                            >
                                                                <option className='text-slate-400' value="">Room</option>
                                                                {rooms.map((r, index) => (
                                                                    <option className='text-white bg-slate-800' key={index} value={r.number || r.name}>{r.number || r.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeClass(cls.id)}
                                                        className="p-2 text-white hover:text-red-500  rounded-md transition-colors self-end md:self-center"
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
        </div>
    );
};
