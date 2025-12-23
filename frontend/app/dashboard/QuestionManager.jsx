'use client';

import React, { useState, useEffect } from 'react';
import {
    fetchQuestions, createQuestion, updateQuestion, deleteQuestion, fetchDepartments, fetchSubjects
} from '../../Lib/api';
import {
    Plus, Trash2, Edit2, Copy, Search, Check, X, FileText, ChevronRight, Filter, ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import Loader1 from '@/components/Ui/Loader1';
import { useAuth } from '@/context/AuthContext';

export default function QuestionManager() {
    const { user: authUser } = useAuth();
    const userRole = authUser?.userType;
    const isSuperAdmin = userRole === 'super_admin';

    const [activeTab, setActiveTab] = useState('list'); // list, create
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        department: 'All',
        semester: 'All',
        shift: 'All'
    });

    // Create Form State
    const [formData, setFormData] = useState({
        subjectName: '',
        subjectCode: '',
        department: '',
        semester: '',
        group: '',
        shift: '',
        content: ''
    });

    // Metadata for dropdowns
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        loadQuestions();
        loadMetadata();
    }, [filters]);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await fetchQuestions(filters);
            setQuestions(data || []);
        } catch (error) {
            toast.error('Failed to load questions');
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateQuestion(editingId, formData);
                toast.success('Question updated successfully');
            } else {
                await createQuestion(formData);
                toast.success('Question submitted successfully');
            }
            resetForm();
            setActiveTab('list');
            loadQuestions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const resetForm = () => {
        setFormData({
            subjectName: '', subjectCode: '', department: '',
            semester: '', group: '', shift: '', content: ''
        });
        setEditingId(null);
    };

    const handleEdit = (q) => {
        setFormData({
            subjectName: q.subjectName,
            subjectCode: q.subjectCode,
            department: q.department,
            semester: q.semester,
            group: q.group,
            shift: q.shift,
            content: q.content
        });
        setEditingId(q._id);
        setActiveTab('create');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await deleteQuestion(id);
            toast.success('Question deleted');
            loadQuestions();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
        toast.info('Question content copied to clipboard!');
    };

    const onSubjectSelect = (subName) => {
        const sub = subjects.find(s => s.name === subName);
        if (sub) {
            setFormData({ ...formData, subjectName: sub.name, subjectCode: sub.code });
        } else {
            setFormData({ ...formData, subjectName: subName });
        }
    };

    const getAvailableGroups = (deptName, shift) => {
        if (!shift) return ['A1', 'B1', 'A2', 'B2', 'C1', 'C2'];
        const isCivil = deptName?.toLowerCase().includes('civil');
        if (shift === '1st') {
            return isCivil ? ['A1', 'B1', 'C1'] : ['A1', 'B1'];
        } else if (shift === '2nd') {
            return isCivil ? ['A2', 'B2', 'C2'] : ['A2', 'B2'];
        }
        return ['A1', 'B1', 'A2', 'B2', 'C1', 'C2'];
    };

    if (loading && questions.length === 0) return <Loader1 />;

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header / Tabs */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-serif font-bold text-[#2C1810] dark:text-white">Question Bank</h1>
                        <p className="text-[#2C1810]/70 dark:text-gray-400">
                            {isSuperAdmin ? 'View and manage all submitted questions' : 'Submit and manage your exam questions'}
                        </p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => { setActiveTab('list'); resetForm(); }}
                            className={`flex-1 md:flex-none whitespace-nowrap px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'list' ? 'bg-[#FF5C35] text-white shadow-lg shadow-[#FF5C35]/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                        >
                            {isSuperAdmin ? 'All Questions' : 'My Questions'}
                        </button>
                        {!isSuperAdmin && (
                            <button
                                onClick={() => setActiveTab('create')}
                                className={`flex-1 md:flex-none whitespace-nowrap px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-[#FF5C35] text-white shadow-lg shadow-[#FF5C35]/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <Plus size={18} /> {editingId ? 'Edit Question' : 'Submit Question'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content List */}
            {activeTab === 'list' && (
                <div className="space-y-6">
                    {/* Filters - Only for Super Admin */}
                    {isSuperAdmin && (
                        <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
                            <div className="flex items-center gap-2 text-gray-500 mr-2">
                                <Filter size={18} />
                                <span className="text-sm font-medium">Filter By:</span>
                            </div>
                            <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-4 py-2 min-w-[150px] text-sm"
                                value={filters.department} onChange={e => setFilters({ ...filters, department: e.target.value })}>
                                <option value="All">All Departments</option>
                                {[...departments].sort((a, b) => a.name.localeCompare(b.name)).map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                            </select>
                            <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-4 py-2 min-w-[150px] text-sm"
                                value={filters.semester} onChange={e => setFilters({ ...filters, semester: e.target.value })}>
                                <option value="All">All Semesters</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s === 1 ? '1st' : s === 2 ? '2nd' : s === 3 ? '3rd' : s + 'th'}</option>)}
                            </select>
                            <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-4 py-2 min-w-[150px] text-sm"
                                value={filters.shift} onChange={e => setFilters({ ...filters, shift: e.target.value })}>
                                <option value="All">All Shifts</option>
                                <option value="1st">1st Shift</option>
                                <option value="2nd">2nd Shift</option>
                            </select>
                            <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-4 py-2 min-w-[150px] text-sm"
                                value={filters.group} onChange={e => setFilters({ ...filters, group: e.target.value })}>
                                <option value="All">All Groups</option>
                                {getAvailableGroups(filters.department, filters.shift).map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-12 flex justify-center"><Loader1 /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {questions.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white dark:bg-[#1E293B] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 text-gray-500">
                                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-lg">No questions found.</p>
                                </div>
                            ) : questions.map(q => (
                                <div key={q._id} className="bg-white dark:bg-[#1E293B] rounded-4xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-brand-start/10 rounded-2xl text-brand-mid">
                                            <FileText size={24} />
                                        </div>
                                        <div className="flex gap-1">
                                            {(isSuperAdmin || q.teacher === authUser?._id) && (
                                                <button onClick={() => handleCopy(q.content)} title="Copy Content" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 hover:text-blue-500 transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                            )}
                                            {q.teacher === authUser?._id && !isSuperAdmin && (
                                                <>
                                                    <button onClick={() => handleEdit(q)} title="Edit" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 hover:text-brand-mid transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(q._id)} title="Delete" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#2C1810] dark:text-white line-clamp-1">{q.subjectName}</h3>
                                            <p className="text-sm font-bold text-brand-mid">{q.subjectCode}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">
                                                <span className="font-bold mr-1 text-[#2C1810]/50 dark:text-gray-400">Dept:</span> {q.department}
                                            </div>
                                            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">
                                                <span className="font-bold mr-1 text-[#2C1810]/50 dark:text-gray-400">Sem:</span> {q.semester}
                                            </div>
                                            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">
                                                <span className="font-bold mr-1 text-[#2C1810]/50 dark:text-gray-400">Shift:</span> {q.shift}
                                            </div>
                                            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">
                                                <span className="font-bold mr-1 text-[#2C1810]/50 dark:text-gray-400">Grp:</span> {q.group}
                                            </div>
                                        </div>

                                        {isSuperAdmin && (
                                            <div className="pt-2 italic text-xs text-gray-400 border-t border-gray-50 dark:border-gray-800">
                                                By: {q.teacherName} ({q.teacherEmail})
                                            </div>
                                        )}

                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                                                {q.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create / Edit Form */}
            {activeTab === 'create' && (
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-xl max-w-4xl mx-auto">
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">Subject Name</label>
                                <select required className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-brand-mid outline-none"
                                    value={formData.subjectName} onChange={e => onSubjectSelect(e.target.value)}>
                                    <option value="">Select Subject</option>
                                    {[...subjects].sort((a, b) => a.name.localeCompare(b.name)).map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">Subject Code</label>
                                <input required type="text" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.subjectCode} readOnly />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">Department</label>
                                <select required className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                    <option value="">Select Department</option>
                                    {[...departments].sort((a, b) => a.name.localeCompare(b.name)).map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">Semester</label>
                                <select required className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}>
                                    <option value="">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s === 1 ? '1st' : s === 2 ? '2nd' : s === 3 ? '3rd' : s + 'th'}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">Shift</label>
                                <select required className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700"
                                    value={formData.shift} onChange={e => setFormData({ ...formData, shift: e.target.value })}>
                                    <option value="">Select Shift</option>
                                    <option value="1st">1st Shift</option>
                                    <option value="2nd">2nd Shift</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">Group</label>
                                <select required className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-brand-mid outline-none"
                                    value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value })}>
                                    <option value="">Select Group</option>
                                    {getAvailableGroups(formData.department, formData.shift).map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">Question Content</label>
                                <textarea
                                    required
                                    rows="8"
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-brand-mid outline-none whitespace-pre-wrap"
                                    placeholder="Type or paste the exam question content here..."
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <button type="button" onClick={() => { setActiveTab('list'); resetForm(); }} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                                Cancel
                            </button>
                            <button type="submit" className="px-10 py-3 bg-[#FF5C35] hover:bg-[#e64722] text-white rounded-xl shadow-lg shadow-[#FF5C35]/20 font-bold transition-all">
                                {editingId ? 'Update Question' : 'Submit Question'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
