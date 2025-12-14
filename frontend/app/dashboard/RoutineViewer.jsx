"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { fetchRoutines, deleteRoutine, fetchDepartments } from '../../Lib/api';
import { Trash2, Calendar, BookOpen, Pencil, Clock, User, MapPin, AlertTriangle, X } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

// Reuse the logic from RoutinePreview for the table
const RoutineTable = ({ routine, onEdit, onDeleteClick }) => {
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
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[#2C1810] dark:text-white flex items-center gap-2">
                        {routine.department}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Sem {routine.semester}</span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex gap-3">
                        <span className="flex items-center gap-1"><Clock size={14} /> {routine.shift} Shift</span>
                        <span className="flex items-center gap-1"><User size={14} /> Group {routine.group}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(routine)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <Pencil size={14} /> Edit
                    </button>
                    <button
                        onClick={() => onDeleteClick(routine)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px] border border-gray-200 dark:border-gray-700">
                    <thead>
                        <tr className="bg-[#FF5C35] text-white">
                            <th className="border border-white/20 px-4 py-3 font-semibold text-left min-w-[100px]">Day</th>
                            {timeSlots.map((slot, index) => (
                                <th key={index} className="border border-white/20 px-3 py-3 font-semibold text-center min-w-[140px]">
                                    <div className="flex flex-col items-center justify-center gap-0.5">
                                        <span className="text-xs opacity-90">{slot.label}</span>
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
                                    if (shouldSkipSlot(day, slotIndex)) return null;

                                    const classInfo = getClassForSlot(day, slotIndex);
                                    const spanInfo = classInfo ? getClassSpanInfo(classInfo, timeSlots) : null;
                                    const colspan = spanInfo ? spanInfo.colspan : 1;

                                    return (
                                        <td
                                            key={slotIndex}
                                            colSpan={colspan}
                                            className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-center align-top"
                                        >
                                            {classInfo ? (
                                                <div className="flex flex-col gap-1 h-full min-h-[80px] p-2 rounded bg-orange-50/50 dark:bg-slate-800/50 hover:bg-orange-100/50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="font-bold text-xs text-[#2C1810] dark:text-white bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-600 shadow-sm">
                                                            {classInfo.subjectCode || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] leading-tight text-[#2C1810] dark:text-gray-300 font-medium line-clamp-2" title={classInfo.subject}>
                                                        {classInfo.subject}
                                                    </p>
                                                    <div className="mt-auto pt-1 flex flex-col gap-0.5">
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                                            <User size={10} /> {classInfo.teacher || '-'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-[#FF5C35] flex items-center justify-center gap-1">
                                                            <MapPin size={10} /> {classInfo.room || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full min-h-[80px]">
                                                    <span className="text-gray-300 dark:text-slate-700 text-xl font-light select-none">·</span>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end text-xs text-gray-400">
                Last updated: {new Date(routine.lastUpdated).toLocaleString()}
            </div>
        </div>
    );
};

export default function RoutineViewer({ onBack, onEdit }) {
    const [routines, setRoutines] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [routineToDelete, setRoutineToDelete] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        department: '',
        semester: '',
        shift: '',
        group: ''
    });

    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
    const SHIFTS = ["1st", "2nd"];
    const GROUPS = ["A1", "A2", "B1", "B2", "C1", "C2"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [routinesData, departmentsData] = await Promise.all([
                    fetchRoutines(),
                    fetchDepartments()
                ]);

                const formattedRoutines = routinesData.map(doc => ({
                    id: doc._id,
                    ...doc
                }));

                setRoutines(formattedRoutines);
                setDepartments(departmentsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDeleteClick = (routine) => {
        setRoutineToDelete(routine);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!routineToDelete) return;

        try {
            await deleteRoutine(routineToDelete.id);
            setRoutines(prev => prev.filter(r => r.id !== routineToDelete.id));
            setDeleteModalOpen(false);
            setRoutineToDelete(null);
        } catch (error) {
            console.error("Error deleting routine:", error);
            alert("Failed to delete routine");
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            department: '',
            semester: '',
            shift: '',
            group: ''
        });
    };

    const filteredRoutines = routines.filter(routine => {
        return (
            (!filters.department || routine.department === filters.department) &&
            (!filters.semester || routine.semester == filters.semester) &&
            (!filters.shift || routine.shift === filters.shift) &&
            (!filters.group || routine.group === filters.group)
        );
    });

    if (loading) {
        return <div className="text-center flex justify-center items-center text-white py-10">
            <div className='size-36'>
                <DotLottieReact
                    src="/loader.lottie"
                    loop
                    autoplay
                />
            </div>
        </div>;
    }

    return (
        <div className="space-y-6 px-2 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Routines</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Viewing {filteredRoutines.length} routines (Table View)</p>
                </div>
                <button
                    onClick={onBack}
                    className="text-sm text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:underline self-start md:self-auto"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-6 sticky top-0 z-10 backdrop-blur-md dark:bg-slate-800/90">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Department</label>
                        <select
                            name="department"
                            value={filters.department}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">All Departments</option>
                            {departments.slice(0, 7).map((dept, index) => (
                                <option key={index} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
                        <select
                            name="semester"
                            value={filters.semester}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">All</option>
                            {SEMESTERS.map((sem, index) => (
                                <option key={index} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shift</label>
                        <select
                            name="shift"
                            value={filters.shift}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">All</option>
                            {SHIFTS.map((shift, index) => (
                                <option key={index} value={shift}>{shift}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Group</label>
                        <select
                            name="group"
                            value={filters.group}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">All</option>
                            {GROUPS.map((grp, index) => (
                                <option key={index} value={grp}>{grp}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-auto pb-0.5">
                        <button
                            onClick={resetFilters}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors w-full"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {filteredRoutines.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-gray-400 dark:text-gray-500" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Routines Found</h3>
                    <p className="text-gray-500 dark:text-slate-400">Try adjusting your filters to see results.</p>
                    <button onClick={resetFilters} className="text-blue-500 hover:underline mt-4 text-sm font-medium">Clear All Filters</button>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredRoutines.map(routine => (
                        <RoutineTable
                            key={routine.id}
                            routine={routine}
                            onEdit={onEdit}
                            onDeleteClick={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteModalOpen && routineToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-slate-700 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="text-red-600 dark:text-red-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Routine?</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                Are you sure you want to delete the routine for <br />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {routineToDelete.department} - {routineToDelete.semester} ({routineToDelete.shift})
                                </span>?
                                <br />This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-500/30 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
