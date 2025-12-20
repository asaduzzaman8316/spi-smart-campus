'use client';

import React, { useState, useEffect } from 'react';
import {
    createQuiz, fetchMyQuizzes, deleteQuiz, toggleQuizStatus, fetchQuizResults, fetchDepartments, fetchSubjects
} from '../../Lib/api';
import {
    Plus, Trash2, Eye, Play, Pause, Search, Check, X, FileText, ChevronRight, BarChart, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import Loader1 from '@/components/Ui/Loader1';

export default function QuizManager() {
    const [activeTab, setActiveTab] = useState('list'); // list, create, results
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create Form State
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        questions: [{
            id: 1,
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: ''
        }],
        accessCode: '',
        department: '',
        semester: '',
        shift: '',
        group: ''
    });

    // Metadata for dropdowns
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Results State
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [resultsData, setResultsData] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const [resultFilters, setResultFilters] = useState({
        department: 'All',
        semester: 'All',
        shift: 'All'
    });

    // Result Details Modal
    const [viewingSubmission, setViewingSubmission] = useState(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);

    useEffect(() => {
        loadQuizzes();
        loadMetadata();
    }, []);

    const loadQuizzes = async () => {
        setLoading(true);
        try {
            const data = await fetchMyQuizzes();
            setQuizzes(data.data || []);
        } catch (error) {
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const loadMetadata = async () => {
        try {
            const [depts, subjs] = await Promise.all([fetchDepartments(), fetchSubjects()]);
            setDepartments(depts || []);
            setSubjects(subjs || []);
        } catch (error) {
            console.error('Metadata load error', error);
        }
    };

    // --- Question Management ---
    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                { id: Date.now(), questionText: '', options: ['', '', '', ''], correctAnswer: '' }
            ]
        });
    };

    const removeQuestion = (id) => {
        if (formData.questions.length === 1) return;
        setFormData({
            ...formData,
            questions: formData.questions.filter(q => q.id !== id)
        });
    };

    const updateQuestion = (id, field, value) => {
        setFormData({
            ...formData,
            questions: formData.questions.map(q =>
                q.id === id ? { ...q, [field]: value } : q
            )
        });
    };

    const updateOption = (qId, optIndex, value) => {
        setFormData({
            ...formData,
            questions: formData.questions.map(q => {
                if (q.id === qId) {
                    const newOpts = [...q.options];
                    newOpts[optIndex] = value;
                    return { ...q, options: newOpts };
                }
                return q;
            })
        });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        // Validation
        for (let i = 0; i < formData.questions.length; i++) {
            const q = formData.questions[i];
            if (!q.questionText.trim()) { toast.error(`Question ${i + 1} text is missing`); return; }
            if (q.options.some(opt => !opt.trim())) { toast.error(`Question ${i + 1} has empty options`); return; }
            if (!q.correctAnswer) { toast.error(`Question ${i + 1} needs a correct answer selected`); return; }
        }

        try {
            await createQuiz(formData);
            toast.success('Quiz created successfully');
            setFormData({
                title: '', subject: '',
                questions: [{ id: 1, questionText: '', options: ['', '', '', ''], correctAnswer: '' }],
                accessCode: '', department: '', semester: '', shift: '', group: ''
            });
            setActiveTab('list');
            loadQuizzes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create quiz');
        }
    };

    const handleDelete = (id) => {
        setQuizToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!quizToDelete) return;
        try {
            await deleteQuiz(quizToDelete);
            toast.success('Quiz deleted');
            loadQuizzes();
            setShowDeleteModal(false);
            setQuizToDelete(null);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleQuizStatus(id);
            loadQuizzes(); // Refresh to see status update
            toast.success('Status updated');
        } catch (error) {
            toast.error('Status update failed');
        }
    };

    const openResults = async (quiz) => {
        setSelectedQuiz(quiz);
        setActiveTab('results');
        loadResults(quiz._id);
    };

    const loadResults = async (quizId) => {
        setLoadingResults(true);
        try {
            const data = await fetchQuizResults(quizId, resultFilters);
            setResultsData(data);
        } catch (error) {
            toast.error('Failed to load results');
        } finally {
            setLoadingResults(false);
        }
    };

    // Refetch results when filters change
    useEffect(() => {
        if (activeTab === 'results' && selectedQuiz) {
            loadResults(selectedQuiz._id);
        }
    }, [resultFilters]);

    if (loading) return <Loader1/>;

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header / Tabs */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-serif font-bold text-[#2C1810] dark:text-white">Quiz Manager</h1>
                        <p className="text-[#2C1810]/70 dark:text-gray-400">Create and manage class quizzes</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`flex-1 md:flex-none whitespace-nowrap px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'list' ? 'bg-[#FF5C35] text-white shadow-lg shadow-[#FF5C35]/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                        >
                            My Quizzes
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 md:flex-none whitespace-nowrap px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-[#FF5C35] text-white shadow-lg shadow-[#FF5C35]/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                        >
                            <Plus size={18} /> Create Quiz
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">No quizzes found. Create one to get started.</div>
                    ) : quizzes.map(quiz => (
                        <div key={quiz._id} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {quiz.status}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleToggleStatus(quiz._id)} title={quiz.status === 'Active' ? 'Close Quiz' : 'Activate Quiz'} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 hover:text-blue-500 transition-colors">
                                        {quiz.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <button onClick={() => openResults(quiz)} title="View Results" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 hover:text-[#FF5C35] transition-colors">
                                        <BarChart size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(quiz._id)} title="Delete" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-[#2C1810] dark:text-white mb-2 line-clamp-1">{quiz.title}</h3>
                            <div className="space-y-1 text-sm text-gray-500">
                                <p><span className="font-medium">Subject:</span> {quiz.subject}</p>
                                <p><span className="font-medium">Questions:</span> {quiz.questions?.length || 1}</p>
                                <p><span className="font-medium">Target:</span> {quiz.department} / {quiz.semester} / {quiz.group}</p>
                                <p><span className="font-medium">Access Code:</span> ****</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'create' && (
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-lg max-w-4xl mx-auto">
                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Quiz Title</label>
                                <input required type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <select required className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Access Code</label>
                                <input required type="text" placeholder="Set a code for students" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.accessCode} onChange={e => setFormData({ ...formData, accessCode: e.target.value })} />
                            </div>

                            {/* Target Audience */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Department</label>
                                <select required className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Semester</label>
                                <select required className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}>
                                    <option value="">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s + (s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th')}>{s}{s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Shift</label>
                                <select required className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.shift} onChange={e => setFormData({ ...formData, shift: e.target.value })}>
                                    <option value="">Select Shift</option>
                                    <option value="1st">1st Shift</option>
                                    <option value="2nd">2nd Shift</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Group</label>
                                <select required className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value })}>
                                    <option value="">Select Group</option>
                                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Questions Section */}
                        <div className="space-y-6 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Questions ({formData.questions.length})</h3>
                                <button type="button" onClick={addQuestion} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                                    <Plus size={16} /> Add
                                </button>
                            </div>

                            {formData.questions.map((q, index) => (
                                <div key={q.id} className="bg-gray-50 dark:bg-[#0F172A] p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 relative group">
                                    <div className="absolute top-4 right-4">
                                        <button type="button" onClick={() => removeQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Remove Question">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <h4 className="font-bold text-gray-500 text-xs uppercase mb-2">Question {index + 1}</h4>
                                    <textarea
                                        required
                                        rows="2"
                                        className="w-full p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 mb-4 focus:ring-2 focus:ring-[#FF5C35] outline-none"
                                        placeholder="Type your question here..."
                                        value={q.questionText}
                                        onChange={e => updateQuestion(q.id, 'questionText', e.target.value)}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex gap-2 items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm select-none cursor-pointer border ${q.correctAnswer === opt && opt ? 'bg-[#FF5C35] text-white border-[#FF5C35]' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 border-transparent'}`}
                                                    onClick={() => opt && updateQuestion(q.id, 'correctAnswer', opt)}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <input
                                                    required
                                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                    className="flex-1 p-2.5 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 focus:border-[#FF5C35] outline-none"
                                                    value={opt}
                                                    onChange={e => updateOption(q.id, oIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-white dark:bg-[#1E293B] p-4 border-t border-gray-100 dark:border-gray-800 -mx-6 -mb-6 md:mx-0 md:mb-0 md:static md:bg-transparent md:border-t-0">
                            <button type="button" onClick={() => setActiveTab('list')} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 font-bold">Cancel</button>
                            <button type="submit" className="px-8 py-3 bg-[#FF5C35] hover:bg-[#e64722] text-white rounded-xl shadow-lg shadow-[#FF5C35]/20 font-bold">Create Quiz</button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'results' && selectedQuiz && (
                <div className="space-y-6">
                    <button onClick={() => setActiveTab('list')} className="flex items-center gap-2 text-gray-500 hover:text-[#FF5C35]">
                        <ChevronRight className="rotate-180" size={20} /> Back to Quizzes
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-gray-500 text-sm mb-1">Total Attempts</h3>
                            <p className="text-3xl font-bold text-[#2C1810] dark:text-white">{resultsData?.overview?.totalAttempts || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-gray-500 text-sm mb-1">Passed</h3>
                            <p className="text-3xl font-bold text-green-500">{resultsData?.overview?.passedCount || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-gray-500 text-sm mb-1">Failed</h3>
                            <p className="text-3xl font-bold text-red-500">{resultsData?.overview?.failedCount || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-gray-500 text-sm mb-1">Avg. Score</h3>
                            <p className="text-3xl font-bold text-blue-500">{resultsData?.overview?.avgScore || 0}%</p>
                        </div>
                    </div>

                    {/* Filters for Results */}
                    <div className="flex gap-4 p-4 bg-white dark:bg-[#1E293B] rounded-2xl overflow-x-auto">
                        <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-4 py-2 min-w-[150px]"
                            value={resultFilters.department} onChange={e => setResultFilters({ ...resultFilters, department: e.target.value })}>
                            <option value="All">All Departments</option>
                            {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                        </select>
                        <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-4 py-2 min-w-[150px]"
                            value={resultFilters.semester} onChange={e => setResultFilters({ ...resultFilters, semester: e.target.value })}>
                            <option value="All">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s + (s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th')}>{s}{s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'}</option>)}
                        </select>
                        <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-4 py-2 min-w-[150px]"
                            value={resultFilters.shift} onChange={e => setResultFilters({ ...resultFilters, shift: e.target.value })}>
                            <option value="All">All Shifts</option>
                            <option value="1st">1st Shift</option>
                            <option value="2nd">2nd Shift</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-sm">
                                <tr>
                                    <th className="p-4">Roll</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4">Score</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {resultsData?.data?.map(sub => (
                                    <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-4 font-medium">{sub.roll}</td>
                                        <td className="p-4 text-gray-500">{sub.studentName || 'Student'}</td>
                                        <td className="p-4 text-sm text-gray-500">{sub.department} • {sub.semester}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${sub.score >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {(sub.score || 0).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => setViewingSubmission(sub)} className="text-blue-500 hover:underline text-sm font-medium">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewingSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold">Submission Details</h3>
                                <p className="text-sm text-gray-500">Roll: {viewingSubmission.roll} | Score: {viewingSubmission.score}%</p>
                            </div>
                            <button onClick={() => setViewingSubmission(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500"><X size={18} /></button>
                        </div>

                        <div className="space-y-4">
                            {viewingSubmission.answers.map((ans, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border ${ans.isCorrect ? 'border-green-200 bg-green-50/50 dark:border-green-900/30' : 'border-red-200 bg-red-50/50 dark:border-red-900/30'}`}>
                                    <p className="font-medium mb-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-bold mr-2">{idx + 1}.</span> {ans.questionText || 'Question Text'}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                        <div className={`flex-1 p-2 rounded-lg border ${ans.isCorrect ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                                            <span className="font-bold text-xs uppercase opacity-70 block">Student Answer</span>
                                            {ans.selectedOption}
                                        </div>
                                        {!ans.isCorrect && (
                                            <div className="flex-1 p-2 rounded-lg bg-green-50 border border-green-200 text-green-800">
                                                <span className="font-bold text-xs uppercase opacity-70 block">Correct Answer</span>
                                                {ans.correctAnswer}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#2C1810] dark:text-white">Delete Quiz?</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this quiz? This action cannot be undone and all student submissions will be lost.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
