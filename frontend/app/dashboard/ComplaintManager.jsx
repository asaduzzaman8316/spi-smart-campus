'use client';
import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, Trash2, CheckCircle, AlertCircle, X, Shield, Clock, User } from 'lucide-react';
import api from '../../Lib/api';
import { toast } from 'react-toastify';

export default function ComplaintManager() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [complaintToDelete, setComplaintToDelete] = useState(null);

    // Load initial data
    const loadComplaints = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/complaints');
            setComplaints(data);
        } catch (error) {
            console.error("Failed to load complaints", error);
            toast.error("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComplaints();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/complaints/${id}`);
            setComplaints(complaints.filter(c => c._id !== id));
            toast.success('Complaint deleted successfully');
            if (selectedComplaint && selectedComplaint._id === id) {
                setSelectedComplaint(null);
            }
            setShowDeleteConfirm(false); // Close modal
        } catch (error) {
            toast.error('Failed to delete complaint');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const { data } = await api.put(`/complaints/${id}`, { status: newStatus });
            setComplaints(complaints.map(c => c._id === id ? data : c));
            if (selectedComplaint && selectedComplaint._id === id) {
                setSelectedComplaint(data);
            }
            toast.success(`Marked as ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredComplaints = complaints.filter(c =>
        (statusFilter === 'All' || c.status === statusFilter) &&
        (c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };


    return (
        <div className="space-y-6 animate-fade-in pt-12">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Total Complaints</p>
                        <h3 className="text-2xl font-bold text-[#2C1810] dark:text-white">{complaints.length}</h3>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                        <MessageSquareIcon size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">In Progress</p>
                        <h3 className="text-2xl font-bold text-blue-600">{complaints.filter(c => c.status === 'In Progress').length}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Resolved</p>
                        <h3 className="text-2xl font-bold text-green-600">{complaints.filter(c => c.status === 'Resolved').length}</h3>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-[#1E293B] pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['All', 'In Progress', 'Resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                                ${statusFilter === status
                                    ? 'bg-[#FF5C35] text-white'
                                    : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'}
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-1 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[600px]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-[#2C1810] dark:text-white">
                        Complaint List
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {filteredComplaints.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">No complaints found</div>
                        ) : (
                            filteredComplaints.map(complaint => (
                                <div
                                    key={complaint._id}
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border
                                        ${selectedComplaint?._id === complaint._id
                                            ? 'bg-[#FF5C35]/5 border-[#FF5C35] dark:bg-[#FF5C35]/10'
                                            : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-[#2C1810] dark:text-white line-clamp-1 mb-1">
                                        {complaint.subject}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] uppercase">
                                            {complaint.category}
                                        </span>
                                        {complaint.isAnonymous && (
                                            <span className="flex items-center gap-0.5 text-gray-400">
                                                <Shield size={10} /> Anon
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Details View */}
                <div className="lg:col-span-2">
                    {selectedComplaint ? (
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 animate-fade-in relative">
                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setComplaintToDelete(selectedComplaint._id);
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Complaint"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                    className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedComplaint.status)}`}>
                                        {selectedComplaint.status}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        ID: {selectedComplaint._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-[#2C1810] dark:text-white mb-2">
                                    {selectedComplaint.subject}
                                </h2>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(selectedComplaint.createdAt).toLocaleString()}
                                    </span>
                                    <span>•</span>
                                    <span className="font-medium text-[#FF5C35]">{selectedComplaint.category}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Description</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedComplaint.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-800/20">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500 mb-3 flex items-center gap-2">
                                        <User size={16} /> Submitter Info
                                    </h3>
                                    {selectedComplaint.isAnonymous ? (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 italic">
                                            <Shield size={18} className="text-gray-400" />
                                            Submitter chose to remain anonymous
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500 w-20 inline-block">Name:</span>
                                                <span className="font-semibold text-[#2C1810] dark:text-white">{selectedComplaint.name}</span>
                                            </p>
                                            <p><span className="text-gray-500 w-20 inline-block">Roll:</span>
                                                <span className="font-medium">{selectedComplaint.studentId}</span>
                                            </p>
                                            <p><span className="text-gray-500 w-20 inline-block">Dept:</span>
                                                <span className="font-medium">{selectedComplaint.department}</span>
                                            </p>
                                            <p><span className="text-gray-500 w-20 inline-block">Contact:</span>
                                                <span className="font-medium">{selectedComplaint.contact}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Update Status
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['In Progress', 'Resolved'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(selectedComplaint._id, status)}
                                                disabled={selectedComplaint.status === status}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border
                                                    ${selectedComplaint.status === status
                                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default opacity-50'
                                                        : status === 'Resolved' ? 'border-green-200 hover:bg-green-50 text-green-600'
                                                            : 'border-blue-200 hover:bg-blue-50 text-blue-600'}
                                                `}
                                            >
                                                Mark {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20">
                            <Shield size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">Select a complaint to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Delete Complaint?</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this complaint? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(complaintToDelete)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-500/30"
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

// Icon component since MessageSquare isn't imported from lucide properly in all projects sometimes
function MessageSquareIcon({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    )
}
