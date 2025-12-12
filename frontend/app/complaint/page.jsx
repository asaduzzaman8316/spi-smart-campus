'use client'
import { useState, useEffect } from 'react'
import { Send, Shield, AlertCircle, CheckCircle, User, MessageSquare, Plus, X, Search, Filter, Clock } from 'lucide-react'
import api from '../../Lib/api'

export default function ComplaintPage() {
    const [complaints, setComplaints] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Form State
    const [formData, setFormData] = useState({
        isAnonymous: true,
        name: '',
        studentId: '',
        department: '',
        contact: '',
        category: 'Academic',
        subject: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/complaints/public');
            setComplaints(data);
        } catch (err) {
            console.error("Failed to fetch complaints");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/departments');
            setDepartments(data);
        } catch (err) {
            console.error("Failed to fetch departments");
        }
    };

    useEffect(() => {
        fetchComplaints();
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/complaints', formData);
            setSuccess(true);
            setFormData({
                isAnonymous: true,
                name: '',
                studentId: '',
                department: '',
                contact: '',
                category: 'Academic',
                subject: '',
                description: ''
            });
            fetchComplaints(); // Refresh list
        } catch (err) {
            setError('Failed to submit complaint. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredComplaints = complaints.filter(c =>
        (categoryFilter === 'All' || c.category === categoryFilter) &&
        (c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#FFFBF2] dark:bg-[#0B1120] relative">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF5C35]/10 rounded-2xl mb-6">
                        <Shield className="w-8 h-8 text-[#FF5C35]" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-[#2C1810] dark:text-white mb-4">
                        Public Complaint Board
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        See what others are reporting to the administration. Your voice helps us improve.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 animate-fade-in-up delay-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-[#1E293B] pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {['All', 'Academic', 'Facilities', 'Harassment', 'Suggestion', 'Other'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border
                                    ${categoryFilter === cat
                                        ? 'bg-[#FF5C35] text-white border-[#FF5C35]'
                                        : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Complaints List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 h-48 animate-pulse"></div>
                        ))
                    ) : filteredComplaints.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No complaints found. Be the first to submit one!
                        </div>
                    ) : (
                        filteredComplaints.map(complaint => (
                            <div key={complaint._id} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[#2C1810] dark:text-white mb-2 line-clamp-1">
                                    {complaint.subject}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                    {complaint.description}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {complaint.category}
                                        </span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        by {complaint.isAnonymous ? 'Anonymous' : complaint.name}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-[#FF5C35] hover:bg-[#e64722] text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-40 group"
            >
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#1E293B] rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-[#2C1810] dark:text-white mb-2">Submit a Complaint</h2>
                                <p className="text-gray-500">We take every report seriously.</p>
                            </div>

                            {success ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#2C1810] dark:text-white mb-4">Complaint Submitted</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                                        Your complaint has been recorded.
                                    </p>
                                    <button
                                        onClick={() => setSuccess(false)} // Reset for new entry
                                        className="bg-[#FF5C35] text-white font-medium py-3 px-8 rounded-full"
                                    >
                                        Submit Another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Privacy Toggle */}
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                            {formData.isAnonymous ? <Shield size={20} /> : <User size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={formData.isAnonymous}
                                                        onChange={() => setFormData({ ...formData, isAnonymous: true })}
                                                        className="accent-[#FF5C35] w-4 h-4"
                                                    />
                                                    <span className="text-sm font-bold text-[#2C1810] dark:text-gray-200">Stay Anonymous</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={!formData.isAnonymous}
                                                        onChange={() => setFormData({ ...formData, isAnonymous: false })}
                                                        className="accent-[#FF5C35] w-4 h-4"
                                                    />
                                                    <span className="text-sm font-bold text-[#2C1810] dark:text-gray-200">Provide Details</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {!formData.isAnonymous && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                            <input
                                                type="text"
                                                required
                                                className="w-full p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-xl outline-none focus:ring-2 focus:ring-[#FF5C35]/50 border-transparent placeholder:text-gray-400"
                                                placeholder="Your Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                required
                                                className="w-full p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-xl outline-none focus:ring-2 focus:ring-[#FF5C35]/50 border-transparent placeholder:text-gray-400"
                                                placeholder="Roll"
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            />
                                            <select
                                                required
                                                className="w-full p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-xl outline-none focus:ring-2 focus:ring-[#FF5C35]/50 border-transparent text-gray-700 dark:text-gray-300"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            >
                                                <option value="">Select Dept</option>
                                                {departments.map(dept => (
                                                    <option key={dept._id} value={dept.name}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                required
                                                className="w-full p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-xl outline-none focus:ring-2 focus:ring-[#FF5C35]/50 border-transparent placeholder:text-gray-400"
                                                placeholder="Phone"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <select
                                                className="w-full p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-xl outline-none focus:ring-2 focus:ring-[#FF5C35]/50 border-transparent text-gray-700 dark:text-gray-300"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option value="Academic">Academic</option>
                                                <option value="Facilities">Facilities</option>
                                                <option value="Harassment">Harassment</option>
                                                <option value="Suggestion">Suggestion</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-xl outline-none focus:ring-2 focus:ring-[#FF5C35]/50 border-transparent placeholder:text-gray-400"
                                                    placeholder="Subject of complaint..."
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <textarea
                                            required
                                            rows={5}
                                            className="w-full p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-xl outline-none focus:ring-2 focus:ring-[#FF5C35]/50 border-transparent placeholder:text-gray-400 resize-none"
                                            placeholder="Describe the issue..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <AlertCircle size={20} />
                                            <p className="text-sm font-medium">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-[#FF5C35] hover:bg-[#e64722] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#FF5C35]/20 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Complaint'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
