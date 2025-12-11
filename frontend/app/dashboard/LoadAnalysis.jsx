"use client";
import React, { useState, useEffect } from 'react';
import { analyzeLoad, fetchDepartments } from '../../Lib/api';
import { BarChart3, Download, Filter, Users, BookOpen, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
const SHIFTS = ["1st", "2nd"];

export default function LoadAnalysis() {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedShift, setSelectedShift] = useState('');

    const [loadData, setLoadData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await fetchDepartments();
            setDepartments(data);
        } catch (error) {
            toast.error('Failed to load departments');
        }
    };

    const handleAnalyze = async () => {
        if (!selectedDepartment || !selectedSemester || !selectedShift) {
            toast.warning('Please select Department, Semester, and Shift');
            return;
        }

        setLoading(true);
        try {
            const result = await analyzeLoad(selectedDepartment, selectedSemester, selectedShift);
            if (result.success) {
                setLoadData(result.data);
                toast.success('Load analysis completed!');
            } else {
                toast.error(result.message || 'No data found');
                setLoadData(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to analyze load');
            setLoadData(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-[#FF5C35]/10 flex items-center justify-center">
                            <BarChart3 className="text-[#FF5C35]" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-[#2C1810] dark:text-white">
                                Load Analysis
                            </h1>
                            <p className="text-[#2C1810]/70 dark:text-gray-400">
                                Calculate teacher workloads from routines
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="text-[#FF5C35]" size={20} />
                        <h2 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white">
                            Select Criteria
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Department</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="">Select Department</option>
                                {departments.slice(0, 7).map((dept,index) => (
                                    <option key={index} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Semester</label>
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="">Select Semester</option>
                                {SEMESTERS.map((sem,index) => (
                                    <option key={index} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Shift</label>
                            <select
                                value={selectedShift}
                                onChange={(e) => setSelectedShift(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="">Select Shift</option>
                                {SHIFTS.map((shift,index) => (
                                    <option key={index} value={shift}>{shift} Shift</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full bg-[#FF5C35] hover:bg-[#e64722] text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-[#FF5C35]/20 hover:shadow-[#FF5C35]/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Load'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {loadData && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Users className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Total Teachers</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.totalTeachers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Total Assignments</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.totalAssignments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Clock className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Total Periods</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.totalPeriods}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Average Load</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.averageLoad}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Table */}
                {loadData && (
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white">
                                Teacher Load Distribution
                            </h2>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 bg-[#FF5C35] hover:bg-[#e64722] text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                            >
                                <Download size={18} />
                                Print
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-[#FF5C35] text-white">
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">SL</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Teacher Name</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Subject</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Code</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Technology</th>
                                        <th className="border border-white/20 px-4 py-3 text-center font-semibold">Theory</th>
                                        <th className="border border-white/20 px-4 py-3 text-center font-semibold">Practical</th>
                                        <th className="border border-white/20 px-4 py-3 text-center font-semibold">Total</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Rooms</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadData.assignments.map((assignment, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-[#1E293B]' : 'bg-[#FFFBF2] dark:bg-[#151e2e]'}>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white">
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white font-medium">
                                                {assignment.teacherName}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white">
                                                {assignment.subject}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white">
                                                {assignment.subjectCode}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white text-sm">
                                                {assignment.technology}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white font-semibold">
                                                {assignment.theoryPeriods}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white font-semibold">
                                                {assignment.practicalPeriods}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#FF5C35] font-bold">
                                                {assignment.totalLoad}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white text-sm">
                                                {assignment.rooms}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-[#FF5C35]/10 font-bold">
                                        <td colSpan="5" className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-right text-[#2C1810] dark:text-white">
                                            Total Load:
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white">
                                            {loadData.summary.totalTheory}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white">
                                            {loadData.summary.totalPractical}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#FF5C35] text-lg">
                                            {loadData.summary.totalPeriods}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loadData && !loading && (
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 border border-gray-100 dark:border-gray-800 text-center">
                        <BarChart3 className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                        <h3 className="text-2xl font-semibold text-foreground mb-2">No Analysis Yet</h3>
                        <p className="text-text-secondary">Select criteria and click "Analyze Load" to view teacher workloads</p>
                    </div>
                )}
            </div>
        </div>
    );
}
