'use client';

import React, { useState, useEffect } from 'react';
import { fetchNotices } from '../../Lib/api';
import { Search, Filter, Bell, Pin, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DashboardNotice() {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // PDF Generation State
    const printRef = React.useRef(null);
    const [printingNotice, setPrintingNotice] = useState(null);

    const loadData = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const data = await fetchNotices();
            setNotices(data);
        } catch (error) {
            console.error('Failed to load notices');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => loadData(true), 10000); // Poll every 10s silently
        return () => clearInterval(interval);
    }, []);

    const generatePDF = async (notice) => {
        setPrintingNotice(notice);
        setTimeout(async () => {
            if (!printRef.current) return;
            try {
                const canvas = await html2canvas(printRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Notice_${notice.title.substring(0, 10)}.pdf`);
            } catch (error) {
                console.error("PDF Generation failed", error);
                toast.error("Failed to generate PDF");
            } finally {
                setPrintingNotice(null);
            }
        }, 100);
    };

    const filteredNotices = notices.filter(notice => {
        // Role based filtering
        if (user?.userType === 'teacher' && notice.targetAudience !== 'Teachers' && notice.targetAudience !== 'All') {
            return false;
        }
        // Admin sees all? Or use notice manager for that. This is "View Mode".

        return (
            (categoryFilter === 'All' || notice.category === categoryFilter) &&
            (notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notice.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C35]"></div>
        </div>
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
                            Latest announcements and academic updates
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
                        </div>

                        <div
                            className="text-gray-600 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: notice.content }}
                        />

                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Posted by: <span className="font-medium text-gray-700 dark:text-gray-200">{notice.postedByName}</span></span>
                            </div>
                            <button
                                onClick={() => generatePDF(notice)}
                                className="flex items-center gap-2 text-sm font-medium text-[#FF5C35] hover:bg-[#FF5C35]/10 px-3 py-2 rounded-lg transition-colors"
                            >
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                ))}

                {filteredNotices.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notices found</h3>
                        <p className="text-gray-500">Check back later for updates</p>
                    </div>
                )}
            </div>

            {/* Hidden Template - Simplified for now, reusing page.jsx logic if complex needed */}
            {printingNotice && (
                <div ref={printRef} className="fixed top-0 left-[-9999px] p-12 w-[800px] bg-white text-black">
                    <div className="text-center space-y-1 mb-8">
                        <h2 className="text-xl font-bold">Sylhet Polytechnic Institute</h2>
                        <h3 className="text-lg">Office of the Principal</h3>
                    </div>
                    <div className="mb-4 text-center border-b-2 border-black pb-2">
                        <h1 className="text-2xl font-bold uppercase">Notice</h1>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-2">{printingNotice.title}</h2>
                        <p className="text-sm text-gray-600">Date: {new Date(printingNotice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-lg leading-relaxed whitespace-pre-wrap text-justify">
                        {printingNotice.content.replace(/<[^>]+>/g, '')}
                    </div>
                </div>
            )}
        </div>
    );
}
