"use client";
import React, { useState, useEffect } from 'react';
import { fetchTeachers, fetchDepartments, createTeacher, updateTeacher, deleteTeacher } from '../../Lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Search, X, Users, Briefcase, Mail, Phone, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Image from 'next/image';

const INITIAL_TEACHER = {
    name: '',
    email: '',
    phone: '',
    department: '',
    shift: '',
    role: '',
    image: '',
    id: 0
};

export default function TeacherManager({ onBack }) {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentTeacher, setCurrentTeacher] = useState(INITIAL_TEACHER);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTeachers();
        loadDepartments();
    }, []);

    useEffect(() => {
        filterTeachers();
    }, [teachers, searchQuery, departmentFilter]);

    const loadTeachers = async () => {
        try {
            setLoading(true);
            const data = await fetchTeachers();
            // Map _id to docId and ensure id is present if needed for UI, or use _id as key
            const teachersData = data.map(t => ({
                docId: t._id,
                ...t,
                shift: t.shift || '',
                role: t.role || '',
                phone: t.phone || '',
                email: t.email || '',
                image: t.image || '',
                department: t.department || ''
            }));
            setTeachers(teachersData);
        } catch (error) {
            console.error("Error fetching teachers:", error);
            toast.error("Failed to load teachers");
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

    const filterTeachers = () => {
        let filtered = [...teachers];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.name?.toLowerCase().includes(query) ||
                t.email?.toLowerCase().includes(query) ||
                t.shift?.toLowerCase().includes(query)
            );
        }

        if (departmentFilter) {
            filtered = filtered.filter(t => t.department === departmentFilter);
        }

        setFilteredTeachers(filtered);
    };

    const handleAddTeacher = () => {
        const maxId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id || 0)) : 0;
        setCurrentTeacher({ ...INITIAL_TEACHER, id: maxId + 1 });
        setModalMode('add');
        setShowModal(true);
    };

    const handleEditTeacher = (teacher) => {
        setCurrentTeacher(teacher);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDeleteTeacher = async (teacher) => {
        try {
            await deleteTeacher(teacher.docId);
            toast.success("Teacher deleted successfully");
            loadTeachers();
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting teacher:", error);
            toast.error("Failed to delete teacher");
        }
    };

    const handleSaveTeacher = async (e) => {
        e.preventDefault();

        // Validation
        if (!currentTeacher.name || !currentTeacher.email || !currentTeacher.department) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentTeacher.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setSaving(true);
        try {
            const teacherData = {
                name: currentTeacher.name,
                email: currentTeacher.email,
                phone: currentTeacher.phone,
                department: currentTeacher.department,
                shift: currentTeacher.shift,
                role: currentTeacher.role,
                image: currentTeacher.image,
                id: currentTeacher.id
            };

            if (modalMode === 'add') {
                await createTeacher(teacherData);
                toast.success("Teacher added successfully");
            } else {
                await updateTeacher(currentTeacher.docId, teacherData);
                toast.success("Teacher updated successfully");
            }

            setShowModal(false);
            setCurrentTeacher(INITIAL_TEACHER);
            loadTeachers();
        } catch (error) {
            console.error("Error saving teacher:", error);
            toast.error("Failed to save teacher");
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTeacher(prev => ({
            ...prev,
            [name]: name === 'id' ? Number(value) : value
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
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-transparent">
                                <Users className="text-emerald-600 dark:text-emerald-500" size={28} />
                            </div>
                            <h1 className="text-3xl font-bold hidden lg:block text-gray-900 dark:text-white">Teacher Management</h1>
                        </div>
                    </div>
                    <button
                        onClick={handleAddTeacher}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        <Plus size={20} />
                        Add Teacher
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or shift..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm dark:shadow-none"
                        />
                    </div>
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm dark:shadow-none"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                {/* Teachers Grid */}
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
                ) : filteredTeachers.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <Users className="mx-auto text-gray-400 dark:text-slate-600 mb-4" size={64} />
                        <p className="text-gray-500 dark:text-slate-400 text-lg">No teachers found</p>
                        <button
                            onClick={handleAddTeacher}
                            className="mt-4 text-emerald-500 hover:underline"
                        >
                            Add your first teacher
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1  relative md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeachers.map(teacher => (
                            <div
                                key={teacher.docId || teacher.id}
                                className="bg-white dark:bg-white/5 backdrop-blur-lg group border border-gray-200 dark:border-white/10 rounded-lg p-6 hover:border-emerald-500/30 dark:hover:bg-white/10 transition-all duration-200 shadow-sm dark:shadow-none"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        {teacher.image ? (
                                            <Image
                                                unoptimized
                                                src={teacher.image}
                                                alt={teacher.name}
                                                width={64}
                                                height={64}
                                                className="w-16 h-16 object-cover rounded-full border-2 border-slate-100 dark:border-transparent"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-100 dark:border-emerald-500/30">
                                                <User className="text-emerald-600 dark:text-emerald-500" size={20} />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                {teacher.name}
                                            </h3>
                                            <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                                                {teacher.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                        <Briefcase size={14} className="text-gray-400 dark:text-slate-400" />
                                        <span>{teacher.department}</span>
                                    </div>
                                    {teacher.email && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                            <Mail size={14} className="text-gray-400 dark:text-slate-400" />
                                            <span className="truncate">{teacher.email}</span>
                                        </div>
                                    )}
                                    {teacher.phone && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                            <Phone size={14} className="text-gray-400 dark:text-slate-400" />
                                            <span>{teacher.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className=" gap-2 absolute top-2 right-2 lg:hidden group-hover:flex">
                                    <button
                                        onClick={() => handleEditTeacher(teacher)}
                                        className="p-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-100 dark:border-transparent"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(teacher)}
                                        className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-100 dark:border-transparent"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                {teacher.shift && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-white/10">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Shift: <span className="text-gray-700 dark:text-gray-300">{teacher.shift}</span>
                                        </p>
                                    </div>

                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700 shadow-2xl">
                            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modalMode === 'add' ? 'Add New Teacher' : 'Edit Teacher'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="text-gray-500 dark:text-slate-400" size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Name <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentTeacher.name || ''}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Email <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={currentTeacher.email || ''}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="john.doe@spi.edu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={currentTeacher.phone || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="0 1734-****"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Department <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <select
                                        name="department"
                                        value={currentTeacher.department}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Shift
                                    </label>
                                    <input
                                        type="text"
                                        name="shift"
                                        value={currentTeacher.shift || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="Shift"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={currentTeacher.role || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="Professor"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={currentTeacher.image || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="https://example.com/photo.jpg"
                                    />
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
                                        className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Teacher'}
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
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Teacher</h2>
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
                                        onClick={() => handleDeleteTeacher(deleteConfirm)}
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
