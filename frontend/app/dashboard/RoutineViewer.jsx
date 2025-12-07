"use client";
import React, { useState, useEffect } from 'react';
import { fetchRoutines, deleteRoutine, fetchDepartments } from '../../Lib/api';
import { Trash2, Calendar, Clock, Users, BookOpen, Pencil } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function RoutineViewer({ onBack, onEdit }) {
    const [routines, setRoutines] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        department: '',
        semester: '',
        shift: '',
        group: ''
    });

    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
    const SHIFTS = ["1st", "2nd"];
    const GROUPS = ["A1", "A2", "B1", "B2"];

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

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this routine?")) {
            try {
                await deleteRoutine(id);
                setRoutines(prev => prev.filter(r => r.id !== id));
            } catch (error) {
                console.error("Error deleting routine:", error);
                alert("Failed to delete routine");
            }
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
        return <div className="text-center flex justify-center items-center  text-white py-10">
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
        <div className="space-y-6 px-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Routines</h2>
                <button
                    onClick={onBack}
                    className="text-sm text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:underline self-start md:self-auto"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/4">
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Department</label>
                        <select
                            name="department"
                            value={filters.department}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm p-2 text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept, index) => (
                                <option key={index} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/6">
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Semester</label>
                        <select
                            name="semester"
                            value={filters.semester}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm p-2 text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                        >
                            <option value="">All</option>
                            {SEMESTERS.map((sem, index) => (
                                <option key={index} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/6">
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Shift</label>
                        <select
                            name="shift"
                            value={filters.shift}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm p-2 text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                        >
                            <option value="">All</option>
                            {SHIFTS.map((shift, index) => (
                                <option key={index} value={shift}>{shift}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/6">
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Group</label>
                        <select
                            name="group"
                            value={filters.group}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm p-2 text-gray-900 dark:text-white focus:border-blue-500 outline-none"
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
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline px-2"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {filteredRoutines.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                    <p className="text-gray-500 dark:text-slate-400">No routines match your filters.</p>
                    <button onClick={resetFilters} className="text-blue-500 hover:underline mt-2 text-sm">Clear Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoutines.map(routine => (
                        <div key={routine.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors group relative shadow-lg dark:shadow-none">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => onEdit(routine)}
                                    className="p-2 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
                                    title="Edit Routine"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(routine.id)}
                                    className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
                                    title="Delete Routine"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{routine.department}</h3>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm">
                                    <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-transparent">Sem {routine.semester}</span>
                                    <span className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-100 dark:border-transparent">{routine.shift} Shift</span>
                                    <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded border border-green-100 dark:border-transparent">Group {routine.group}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400 dark:text-slate-500" />
                                    <span>{routine.days?.filter(d => d.classes.length > 0).length || 0} Active Days</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen size={16} className="text-gray-400 dark:text-slate-500" />
                                    <span>{routine.days?.reduce((acc, day) => acc + day.classes.length, 0) || 0} Total Classes</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-500 flex justify-between">
                                <span>Last updated</span>
                                <span>{new Date(routine.lastUpdated).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
