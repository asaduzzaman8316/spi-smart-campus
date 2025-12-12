'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchNotices } from '@/Lib/api';
import { Search, Filter, Calendar, AlertCircle, Book, Trophy, Bell, Download, Pin } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AllNoticesPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // PDF Generation State
    const printRef = useRef(null);
    const [printingNotice, setPrintingNotice] = useState(null);

    useEffect(() => {
        const loadNotices = async () => {
            try {
                const data = await fetchNotices();
                setNotices(data);
            } catch (error) {
                console.error("Failed to fetch notices");
            } finally {
                setLoading(false);
            }
        };
        loadNotices();
    }, []);

    const filteredNotices = notices.filter(notice =>
        (categoryFilter === 'All' || notice.category === categoryFilter) &&
        (notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.memoNo?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const generatePDF = async (notice) => {
        setPrintingNotice(notice);

        // Wait for state update and render
        setTimeout(async () => {
            if (!printRef.current) return;

            try {
                const canvas = await html2canvas(printRef.current, {
                    scale: 2, // Higher quality
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 10; // Top margin

                // Calculate height based on width to keep aspect ratio, but fit page width
                const finalImgWidth = pdfWidth - 20; // 10mm margin each side
                const finalImgHeight = (imgHeight * finalImgWidth) / imgWidth;

                pdf.addImage(imgData, 'PNG', 10, 10, finalImgWidth, finalImgHeight);
                pdf.save(`Notice_${notice.title.substring(0, 10)}.pdf`);
            } catch (error) {
                console.error("PDF Generation failed", error);
            } finally {
                setPrintingNotice(null);
            }
        }, 100);
    };

    const getIcon = (category) => {
        switch (category) {
            case 'Urgent': return <AlertCircle size={20} className="text-red-500" />;
            case 'Exam': return <Book size={20} className="text-purple-500" />;
            case 'Event': return <Trophy size={20} className="text-yellow-500" />;
            default: return <Bell size={20} className="text-[#FF5C35]" />;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FFFBF2] dark:bg-[#0B1120] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C35]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FFFBF2] dark:bg-[#0B1120] flex flex-col">
            <main className="flex-1 container mx-auto px-4 max-w-7xl py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <span className="text-[#FF5C35] font-semibold tracking-wider text-sm uppercase bg-[#FF5C35]/10 px-4 py-2 rounded-full">
                        Academic Updates
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-4 font-serif text-[#2C1810] dark:text-white">
                        All Notices
                    </h1>
                    <p className="text-[#2C1810]/70 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Browse all announcements, exam schedules, and academic updates from the institute.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5C35] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search notices by title, content or memo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-[#1E293B] pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35] transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {['All', 'General', 'Academic', 'Exam', 'Event', 'Urgent'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${categoryFilter === cat
                                        ? 'bg-[#FF5C35] text-white shadow-lg shadow-[#FF5C35]/20'
                                        : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredNotices.map((notice) => (
                        <div
                            key={notice._id}
                            className={`group bg-white dark:bg-[#1E293B] rounded-4xl p-8 border hover:border-[#FF5C35] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col
                                ${notice.isPinned ? 'border-[#FF5C35] shadow-lg shadow-[#FF5C35]/10' : 'border-gray-100 dark:border-gray-800'}
                            `}
                        >
                            {/* Pin Indicator */}
                            {notice.isPinned && (
                                <div className="absolute top-0 right-0 bg-[#FF5C35] text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1 z-10">
                                    <Pin size={12} fill="white" /> Pinned
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                        ${notice.category === 'Urgent' ? 'bg-red-50 dark:bg-red-900/10' :
                                            notice.category === 'Exam' ? 'bg-purple-50 dark:bg-purple-900/10' :
                                                'bg-[#FF5C35]/10'}
                                    `}>
                                        {getIcon(notice.category)}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{notice.category}</div>
                                        <div className="text-xs text-gray-400">{new Date(notice.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                {notice.memoNo && (
                                    <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                                        Memo: {notice.memoNo}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-[#2C1810] dark:text-white mb-3 group-hover:text-[#FF5C35] transition-colors">
                                {notice.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed flex-1 whitespace-pre-wrap">
                                {notice.content}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
                                <div className="text-xs">
                                    <span className="text-gray-400">Posted by:</span>
                                    <span className="ml-1 font-medium text-gray-700 dark:text-gray-200">{notice.postedByName}</span>
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
                        <div className="col-span-full text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No notices found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Hidden Official PDF Template */}
            {printingNotice && (
                <div 
                    className="fixed top-0 left-[-9999px] p-12 w-[800px]" 
                    ref={printRef}
                    style={{ backgroundColor: '#ffffff', color: '#000000' }}
                >
                    {/* Header */}
                    <div className="text-center space-y-1 mb-8">
                        <h2 className="text-lg font-bold" style={{ color: '#000000' }}>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h2>
                        <h3 className="text-md" style={{ color: '#000000' }}>অধ্যক্ষের কার্যালয়</h3>
                        <h2 className="text-xl font-bold" style={{ color: '#1e3a8a' }}>সিলেট পলিটেকনিক ইনস্টিটিউট, সিলেট</h2>
                        <p className="text-sm" style={{ color: '#000000' }}>www.sylhet.polytech.gov.bd</p>
                        <p className="text-sm" style={{ color: '#000000' }}>email: principalsylhetpoly@gmail.com</p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <span className="text-xl font-bold px-4" style={{ borderBottom: '2px solid #000000', color: '#000000' }}>নোটিশ</span>
                    </div>

                    {/* Content */}
                    <div className="mb-12 text-justify leading-relaxed whitespace-pre-wrap font-serif text-lg" style={{ color: '#000000' }}>
                        {printingNotice.content}
                    </div>

                    {/* Signature */}
                    <div className="flex justify-end mb-8">
                        <div className="text-center w-64">
                            <div className="mb-4">
                                {/* Simulated signature space */}
                                <img src="/signature-placeholder.png" alt="" className="h-10 mx-auto opacity-0" />
                            </div>
                            <p className="font-bold" style={{ color: '#000000' }}>{printingNotice.signatoryName || "Engr. Md. Rihan Uddin"}</p>
                            <p style={{ color: '#000000' }}>{printingNotice.signatoryDesignation || "Principal (Acting)"}</p>
                            <p style={{ color: '#000000' }}>Sylhet Polytechnic Institute, Sylhet</p>
                        </div>
                    </div>

                    {/* Footer / Meta */}
                    <div className="flex justify-between items-end pt-4 mt-auto" style={{ borderTop: '1px solid #d1d5db', color: '#000000' }}>
                        <div className="text-sm">
                            <p>স্মারক নং: {printingNotice.memoNo || "...................."}</p>
                        </div>
                        <div className="text-sm">
                            <p>তারিখ: {new Date(printingNotice.createdAt).toLocaleDateString('bn-BD')}</p>
                        </div>
                    </div>

                    {/* CC List */}
                    {printingNotice.ccList && printingNotice.ccList.length > 0 && (
                        <div className="mt-8 text-sm" style={{ color: '#000000' }}>
                            <p className="font-bold mb-2">অনুলিপি সদয় অবগতি ও প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য প্রেরণ করা হলো:</p>
                            <ol className="list-decimal pl-5 space-y-1">
                                {printingNotice.ccList.map((cc, idx) => (
                                    <li key={idx}>{cc}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
