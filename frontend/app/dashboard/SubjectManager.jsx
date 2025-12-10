"use client";
import React, { useState, useEffect } from 'react';
import { fetchPaginatedSubjects, fetchDepartments, createSubject, updateSubject, deleteSubject } from '../../Lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Search, X, BookOpen, Briefcase, Hash, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// import Pagination from '@/components/Ui/Pagination'; // Removed

const INITIAL_SUBJECT = {
    name: '',
    code: '',
    department: '',
    semester: 1,
    id: 0
};

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];

export default function SubjectManager({ onBack }) {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentSubject, setCurrentSubject] = useState(INITIAL_SUBJECT);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadSubjects();
        loadDepartments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, departmentFilter, semesterFilter]);

    const loadSubjects = async () => {
        try {
            setLoading(true);
            const response = await fetchPaginatedSubjects(1, 1000, searchQuery, departmentFilter, semesterFilter);
            const rawData = response.data || [];

            const subjectsData = rawData.map(s => ({
                docId: s._id,
                ...s,
                code: s.code || '',
                semester: s.semester || 1,
                department: s.department || ''
            }));

            setSubjects(subjectsData);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            toast.error("Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await fetchDepartments();
            setDepartments(data.map(d => ({ ...d, id: d._id || d.id })));
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDepartmentChange = (e) => {
        setDepartmentFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSemesterChange = (e) => {
        setSemesterFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleAddSubject = () => {
        const maxId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id || 0)) : 0;
        setCurrentSubject({ ...INITIAL_SUBJECT, id: maxId + 1 });
        setModalMode('add');
        setShowModal(true);
    };

    const handleEditSubject = (subject) => {
        setCurrentSubject(subject);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDeleteSubject = async (subject) => {
        try {
            await deleteSubject(subject.docId);
            toast.success("Subject deleted successfully");
            loadSubjects();
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting subject:", error);
            toast.error("Failed to delete subject");
        }
    };

    const handleSaveSubject = async (e) => {
        e.preventDefault();

        // Validation
        if (!currentSubject.name || !currentSubject.code || !currentSubject.department || !currentSubject.semester) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            const subjectData = {
                name: currentSubject.name,
                code: currentSubject.code,
                department: currentSubject.department,
                semester: Number(currentSubject.semester),
                id: currentSubject.id
            };

            if (modalMode === 'add') {
                await createSubject(subjectData);
                toast.success("Subject added successfully");
            } else {
                await updateSubject(currentSubject.docId, subjectData);
                toast.success("Subject updated successfully");
            }

            setShowModal(false);
            setCurrentSubject(INITIAL_SUBJECT);
            loadSubjects();
        } catch (error) {
            console.error("Error saving subject:", error);
            toast.error("Failed to save subject");
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSubject(prev => ({
            ...prev,
            [name]: name === 'semester' ? Number(value) : value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
            <div className="max-w-7xl mx-auto px-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft className="text-gray-900 dark:text-white" size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-transparent">
                                <BookOpen className="text-blue-600 dark:text-blue-500" size={28} />
                            </div>
                            <h1 className="text-3xl font-bold hidden lg:block text-gray-900 dark:text-white">Subject Management</h1>
                        </div>
                    </div>
                    <button
                        onClick={handleAddSubject}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        <Plus size={20} />
                        Add Subject
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm dark:shadow-none"
                        />
                    </div>
                    <select
                        value={departmentFilter}
                        onChange={handleDepartmentChange}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm dark:shadow-none"
                    >
                        <option value="">All Departments</option>
                        {departments.slice(0, 7).map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                    <select
                        value={semesterFilter}
                        onChange={handleSemesterChange}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm dark:shadow-none"
                    >
                        <option value="">All Semesters</option>
                        {SEMESTERS.map((sem, index) => (
                            <option key={index} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>

                {/* Subjects Grid */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="flex items-center justify-center ">
                            <div className='size-36'>
                                <DotLottieReact
                                    src="/Loading.lottie"
                                    loop
                                    autoplay
                                />
                            </div>
                        </div>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <BookOpen className="mx-auto text-gray-400 dark:text-slate-600 mb-4" size={64} />
                        <p className="text-gray-500 dark:text-slate-400 text-lg">No subjects found</p>
                        <button
                            onClick={handleAddSubject}
                            className="mt-4 text-blue-500 hover:underline"
                        >
                            Add your first subject
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 relative md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {subjects.map((subject, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-white/5 backdrop-blur-lg group border border-gray-200 dark:border-white/10 rounded-lg p-6 hover:border-blue-500/30 dark:hover:bg-white/10 transition-all duration-200 shadow-sm dark:shadow-none"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border-2 border-blue-100 dark:border-blue-500/30">
                                                <BookOpen className="text-blue-600 dark:text-blue-500" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {subject.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                                                    <Hash size={14} className="text-purple-400 dark:text-purple-500" />
                                                    Code: {subject.code}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                            <Briefcase size={14} className="text-gray-400 dark:text-slate-400" />
                                            <span>{subject.department} Department</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                            <Calendar size={14} className="text-gray-400 dark:text-slate-400" />
                                            <span>Semester {subject.semester}</span>
                                        </div>
                                    </div>
                                    <div className="gap-2 absolute top-2 right-2 lg:hidden group-hover:flex">
                                        <button
                                            onClick={() => handleEditSubject(subject)}
                                            className="p-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-100 dark:border-transparent"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(subject)}
                                            className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-100 dark:border-transparent"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {/* Pagination Controls - Removed */}
                    </>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700 shadow-2xl">
                            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modalMode === 'add' ? 'Add New Subject' : 'Edit Subject'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="text-gray-500 dark:text-slate-400" size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Subject Name <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentSubject.name || ''}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Engineering Drawing"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Subject Code <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={currentSubject.code || ''}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                        placeholder="21011"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Department <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <select
                                        name="department"
                                        value={currentSubject.department}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept, index) => (
                                            <option key={index} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Semester <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <select
                                        name="semester"
                                        value={currentSubject.semester}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {SEMESTERS.map((sem, index) => (
                                            <option key={index} value={sem}>{sem}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg transition-colors font-medium border border-transparent dark:border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Subject'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 shadow-2xl">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-full border border-red-100 dark:border-transparent">
                                        <Trash2 className="text-red-500" size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Subject</h2>
                                </div>
                                <p className="text-gray-600 dark:text-slate-300 mb-6">
                                    Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirm.name}</span>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSubject(deleteConfirm)}
                                        className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
