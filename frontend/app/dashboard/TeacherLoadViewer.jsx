'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, Briefcase, Users, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchTeachers } from '@/Lib/api';
import { analyzeLoad } from '@/Lib/api';

export default function TeacherLoadViewer({ onBack }) {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [loadData, setLoadData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [teachersLoading, setTeachersLoading] = useState(true);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        setTeachersLoading(true);
        try {
            const data = await fetchTeachers();
            setTeachers(data);
        } catch (error) {
            toast.error('Failed to load teachers');
        } finally {
            setTeachersLoading(false);
        }
    };

    const handleTeacherSelect = async (teacherName) => {
        setSelectedTeacher(teacherName);
        if (!teacherName) {
            setLoadData(null);
            return;
        }

        setLoading(true);
        try {
            // Fetch ALL routines across all departments and semesters
            const result = await analyzeLoad('', '', '');
            if (result.success && result.data) {
                // Filter assignments for selected teacher
                const teacherAssignments = result.data.assignments.filter(
                    assignment => assignment.teacherName === teacherName
                );

                // Calculate totals
                const totalTheory = teacherAssignments.reduce((sum, a) => sum + a.theoryPeriods, 0);
                const totalLab = teacherAssignments.reduce((sum, a) => sum + a.practicalPeriods, 0);
                const totalLoad = teacherAssignments.reduce((sum, a) => sum + a.totalLoad, 0);

                setLoadData({
                    assignments: teacherAssignments,
                    totalTheory,
                    totalLab,
                    totalLoad
                });
            } else {
                setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch load data:', error);
            setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-card-bg rounded-3xl p-8 shadow border border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onBack}
                        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF5C35] transition">
                        <ChevronLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#FF5C35]/10 flex items-center justify-center">
                            <BarChart3 className="text-[#FF5C35]" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Load Viewer</h1>
                            <p className="text-gray-500 dark:text-gray-400">View teaching workload for any teacher</p>
                        </div>
                    </div>
                </div>

                {/* Teacher Selection */}
                <div className="bg-white dark:bg-card-bg rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select Teacher
                    </label>
                    {teachersLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF5C35]"></div>
                            Loading teachers...
                        </div>
                    ) : (
                        <select
                            value={selectedTeacher}
                            onChange={(e) => handleTeacherSelect(e.target.value)}
                            className="w-full max-w-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35] focus:border-transparent transition">
                            <option value="">-- Select a teacher --</option>
                            {teachers.map((teacher, index) => (
                                <option key={index} value={teacher.name}>
                                    {teacher.name} - {teacher.department}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C35]"></div>
                    </div>
                )}

                {/* Load Statistics */}
                {!loading && loadData && selectedTeacher && (
                    <>
                        {loadData.assignments.length > 0 ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Theory Classes</p>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{loadData.totalTheory}</p>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">periods/week</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase size={20} className="text-purple-600 dark:text-purple-400" />
                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Lab Classes</p>
                                        </div>
                                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{loadData.totalLab}</p>
                                        <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">periods/week</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 size={20} className="text-orange-600 dark:text-orange-400" />
                                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Load</p>
                                        </div>
                                        <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{loadData.totalLoad}</p>
                                        <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">periods/week</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen size={20} className="text-green-600 dark:text-green-400" />
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Subjects</p>
                                        </div>
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{loadData.assignments.length}</p>
                                        <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">assigned</p>
                                    </div>
                                </div>

                                {/* Subject Breakdown */}
                                <div className="bg-white dark:bg-card-bg rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Subject Breakdown</h3>
                                    <div className="space-y-3">
                                        {loadData.assignments.map((assignment, index) => (
                                            <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h5 className="font-semibold text-gray-900 dark:text-white">{assignment.subject}</h5>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {assignment.subjectCode} • {assignment.technology}
                                                        </p>
                                                        {assignment.rooms && (
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                Rooms: {assignment.rooms}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Theory</p>
                                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{assignment.theoryPeriods}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Lab</p>
                                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{assignment.practicalPeriods}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                                            <p className="text-lg font-bold text-[#FF5C35]">{assignment.totalLoad}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white dark:bg-card-bg rounded-3xl p-12 shadow border border-gray-100 dark:border-gray-800 text-center">
                                <BarChart3 className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Teaching Assignments</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {selectedTeacher} has no teaching assignments in the current routines.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State - No Teacher Selected */}
                {!loading && !selectedTeacher && (
                    <div className="bg-white dark:bg-card-bg rounded-3xl p-12 shadow border border-gray-100 dark:border-gray-800 text-center">
                        <Users className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Teacher</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Choose a teacher from the dropdown above to view their teaching load
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
