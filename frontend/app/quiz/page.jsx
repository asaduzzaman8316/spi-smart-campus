'use client';

import React, { useState, useEffect } from 'react';
import { fetchQuizzes, fetchDepartments } from '../../Lib/api';
import { Search, Filter, ArrowRight, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function QuizListPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const [filterSem, setFilterSem] = useState('All');
    const [filterShift, setFilterShift] = useState('All');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [quizData, deptData] = await Promise.all([
                fetchQuizzes(),
                fetchDepartments()
            ]);
            setQuizzes(quizData.data || []);
            setDepartments(deptData || []);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDept = filterDept === 'All' || quiz.department === filterDept;
        const matchSem = filterSem === 'All' || quiz.semester === filterSem;
        const matchShift = filterShift === 'All' || quiz.shift === filterShift;
        return matchSearch && matchDept && matchSem && matchShift;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C1810] dark:text-white flex items-center justify-center gap-4">
                        <BrainCircuit size={48} className="text-[#FF5C35]" />
                        Active Quizzes
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Test your knowledge. Find your class quiz and participate now.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-lg border border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative col-span-1 md:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title or subject..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[#FF5C35]"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[#FF5C35]"
                            value={filterDept} onChange={e => setFilterDept(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                        </select>
                        <select
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[#FF5C35]"
                            value={filterSem} onChange={e => setFilterSem(e.target.value)}
                        >
                            <option value="All">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s + (s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th')}>{s}{s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'}</option>)}
                        </select>
                        <select
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[#FF5C35]"
                            value={filterShift} onChange={e => setFilterShift(e.target.value)}
                        >
                            <option value="All">All Shifts</option>
                            <option value="1st">1st Shift</option>
                            <option value="2nd">2nd Shift</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading quizzes...</div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#1E293B] rounded-4xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 text-lg">No active quizzes found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map(quiz => {
                            const isClosed = quiz.status === 'Closed';
                            return (
                                <Link
                                    href={isClosed ? '#' : `/quiz/${quiz._id}`}
                                    key={quiz._id}
                                    className={`group ${isClosed ? 'cursor-not-allowed opacity-70' : ''}`}
                                    onClick={e => isClosed && e.preventDefault()}
                                >
                                    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-[#FF5C35]/10 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                                        {/* Status Badge */}
                                        <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl font-bold text-xs uppercase tracking-wider ${isClosed ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-[#FF5C35] text-white'}`}>
                                            {quiz.status}
                                        </div>

                                        <div className="mb-4">
                                            <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-[#FF5C35] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                                {quiz.subject}
                                            </span>
                                            <h3 className="text-2xl font-bold text-[#2C1810] dark:text-white group-hover:text-[#FF5C35] transition-colors line-clamp-2">
                                                {quiz.title}
                                            </h3>
                                        </div>

                                        <div className="space-y-2 mb-8 flex-1">
                                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                                                <span>Department</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{quiz.department}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                                                <span>Semester</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{quiz.semester}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                                <span>Shift</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{quiz.shift}</span>
                                            </div>
                                        </div>

                                        <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold 
                                            ${isClosed
                                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                                                : 'bg-gray-50 dark:bg-[#0F172A] text-gray-600 dark:text-gray-300 group-hover:bg-[#FF5C35] group-hover:text-white'
                                            }`}>
                                            {isClosed ? 'Closed' : 'Take Quiz'}
                                            {!isClosed && <ArrowRight size={18} />}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
