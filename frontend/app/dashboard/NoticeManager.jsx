'use client';

import React, { useState, useEffect } from 'react';
import { fetchNotices, createNotice, updateNotice, deleteNotice, fetchDepartments } from '../../Lib/api';
import { Plus, Search, Filter, Trash2, Edit2, X, Check, Paperclip, Pin, Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function NoticeManager() {
    const { authUser } = useAuth();
    const [notices, setNotices] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        targetAudience: 'All',
        department: 'All',
        isPinned: false
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [noticesData, deptsData] = await Promise.all([
                fetchNotices(),
                fetchDepartments()
            ]);
            setNotices(noticesData);
            setDepartments(deptsData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNotice) {
                await updateNotice(editingNotice._id, formData);
                toast.success('Notice updated successfully');
            } else {
                await createNotice(formData);
                toast.success('Notice published successfully');
            }
            setIsModalOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save notice');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            await deleteNotice(id);
            toast.success('Notice deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete notice');
        }
    };

    const openEditModal = (notice) => {
        setEditingNotice(notice);
        setFormData({
            title: notice.title,
            content: notice.content,
            category: notice.category,
            targetAudience: notice.targetAudience,
            department: notice.department,
            isPinned: notice.isPinned,
            postedByName: notice.postedByName,
            memoNo: notice.memoNo,
            signatoryName: notice.signatoryName,
            signatoryDesignation: notice.signatoryDesignation,
            ccList: notice.ccList || []
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingNotice(null);
        setFormData({
            title: '',
            content: '',
            category: 'General',
            targetAudience: 'All',
            department: 'All',
            isPinned: false,
            postedByName: authUser?.name || 'Admin', // Default to current user
            memoNo: '',
            signatoryName: 'Engr. Md. Rihan Uddin',
            signatoryDesignation: 'Principal (Acting)',
            ccList: []
        });
    };

    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    };

    function imageHandler() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                if (file.size > 102400) { // 100KB limit
                    toast.error('Image size exceeds 100KB limit');
                    return;
                }

                const reader = new FileReader();
                reader.onload = () => {
                    const quill = this.quill; // This usage might fail in functional component, checking alternative
                    // In functional component ref is needed.
                    // But modules handler is separate. 
                    // Let's use a workaround or useRef.
                };
                // React-Quill specific: context 'this' in handler points to quill instance if not arrow function?
                // Actually in functional component it's tricky.

                // Let's just read it and update generic formData.content? No, we need to insert into editor.

                // Better approach with useRef for ReactQuill
            }
        };
    }

    // Adjusted handler using ref
    const quillRef = React.useRef(null);

    const customImageHandler = React.useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                if (file.size > 102400) {
                    toast.error('Image size must be less than 100KB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const range = quillRef.current.getEditor().getSelection(true);
                    quillRef.current.getEditor().insertEmbed(range.index, 'image', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
    }, []);

    const quillModules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                [{ 'align': [] }, { 'color': [] }, { 'background': [] }],
                ['clean']
            ],
            handlers: {
                image: customImageHandler
            }
        }
    }), [customImageHandler]);

    const filteredNotices = notices.filter(notice =>
        (categoryFilter === 'All' || notice.category === categoryFilter) &&
        (notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-[#FF5C35]/10 flex items-center justify-center">
                        <Bell className="text-[#FF5C35]" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#2C1810] dark:text-white">
                            Notice Board
                        </h1>
                        <p className="text-[#2C1810]/70 dark:text-gray-400">
                            Manage announcements and updates for teachers and students
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5C35] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search notices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-[#1E293B] pl-10 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35] transition-all shadow-sm"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white dark:bg-[#1E293B] px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35] appearance-none cursor-pointer shadow-sm"
                    >
                        <option value="All">All Categories</option>
                        <option value="General">General</option>
                        <option value="Academic">Academic</option>
                        <option value="Exam">Exam</option>
                        <option value="Event">Event</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>

                {/* Only Show Create Button for Admins */}
                {(authUser?.userType === 'super_admin' || authUser?.userType === 'department_admin' || authUser?.userType === 'dept_admin') && (
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="w-full md:w-auto bg-[#FF5C35] hover:bg-[#e64722] text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#FF5C35]/20 hover:shadow-[#FF5C35]/30 flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus size={20} />
                        New Notice
                    </button>
                )}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredNotices.map((notice) => (
                    <div key={notice._id} className={`bg-white dark:bg-[#1E293B] rounded-2xl p-6 border ${notice.isPinned ? 'border-[#FF5C35] shadow-md' : 'border-gray-100 dark:border-gray-800'} transition-all hover:shadow-lg group relative`}>
                        {notice.isPinned && (
                            <div className="absolute top-4 right-4 text-[#FF5C35]">
                                <Pin size={20} fill="#FF5C35" />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                        ${notice.category === 'Urgent' ? 'bg-red-100 text-red-600' :
                                            notice.category === 'Exam' ? 'bg-purple-100 text-purple-600' :
                                                'bg-blue-100 text-blue-600'}`}>
                                        {notice.category}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[#2C1810] dark:text-white mb-2">
                                    {notice.title}
                                </h3>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {(authUser?.userType === 'super_admin' || authUser?.userType === 'department_admin' || authUser?.userType === 'dept_admin') && (
                                    <>
                                        <button
                                            onClick={() => openEditModal(notice)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(notice._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div
                            className="text-gray-600 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: notice.content }}
                        />

                        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <span>Posted by: <span className="font-medium text-gray-700 dark:text-gray-200">{notice.postedByName}</span></span>
                            <span>Target: <span className="font-medium text-gray-700 dark:text-gray-200">{notice.targetAudience}</span></span>
                            <span>Dept: <span className="font-medium text-gray-700 dark:text-gray-200">{notice.department}</span></span>
                        </div>
                    </div>
                ))}

                {filteredNotices.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notices found</h3>
                        <p className="text-gray-500">Create a new notice to get started</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1E293B] z-10">
                            <h2 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white">
                                {editingNotice ? 'Edit Notice' : 'New Notice'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35]"
                                        placeholder="Enter notice title"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35]"
                                    >
                                        <option value="General">General</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Event">Event</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</label>
                                    <select
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35]"
                                    >
                                        <option value="All">All</option>
                                        <option value="Teachers">Teachers Only</option>
                                        <option value="Students">Students Only</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35]"
                                    >
                                        <option value="All">All Departments</option>
                                        {departments.map((dept) => (
                                            <option key={dept.code} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-3 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isPinned"
                                        checked={formData.isPinned}
                                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                        className="w-5 h-5 text-[#FF5C35] border-gray-300 rounded focus:ring-[#FF5C35]"
                                    />
                                    <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin to top</label>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content <span className="text-red-500">*</span></label>
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(content) => setFormData({ ...formData, content })}
                                        modules={quillModules}
                                        className="bg-white dark:bg-[#0F172A] rounded-xl overflow-hidden" // style override needed for dark mode text
                                    />
                                    <style jsx global>{`
                                        .ql-toolbar.ql-snow {
                                            border-top-left-radius: 0.75rem;
                                            border-top-right-radius: 0.75rem;
                                            border-color: #e5e7eb;
                                        }
                                        .dark .ql-toolbar.ql-snow {
                                            border-color: #374151;
                                            background-color: #1e293b;
                                        }
                                        .ql-container.ql-snow {
                                            border-bottom-left-radius: 0.75rem;
                                            border-bottom-right-radius: 0.75rem;
                                            border-color: #e5e7eb;
                                            min-height: 200px;
                                        }
                                        .dark .ql-container.ql-snow {
                                            border-color: #374151;
                                            color: white;
                                        }
                                        .dark .ql-picker {
                                            color: #e2e8f0;
                                        }
                                        .dark .ql-stroke {
                                            stroke: #e2e8f0 !important;
                                        }
                                        .dark .ql-fill {
                                            fill: #e2e8f0 !important;
                                        }
                                        .dark .ql-picker-options {
                                            background-color: #1e293b;
                                            color: #e2e8f0;
                                        }
                                    `}</style>
                                </div>

                                {/* Additional Official Notice Fields */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Posted By (Name)</label>
                                    <input
                                        type="text"
                                        value={formData.postedByName || ''}
                                        onChange={(e) => setFormData({ ...formData, postedByName: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35]"
                                        placeholder="e.g. Admin Name"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#FF5C35] hover:bg-[#e64722] text-white rounded-xl transition-colors shadow-lg shadow-[#FF5C35]/20 font-medium flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    {editingNotice ? 'Update Notice' : 'Post Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
