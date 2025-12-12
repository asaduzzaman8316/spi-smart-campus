'use client';

import React, { useState, useEffect } from 'react';
import { fetchNotices } from '../../Lib/api';
import { Bell, Calendar, Pin, AlertCircle, Book, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function NoticeBoardSection() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getNotices = async () => {
            try {
                const data = await fetchNotices('', '', 5); // Fetch top 5 notices
                // Filter for students only
                const studentNotices = data.filter(n => n.targetAudience === 'Students' || n.targetAudience === 'All');
                setNotices(studentNotices);
            } catch (error) {
                console.error("Failed to fetch notices");
            } finally {
                setLoading(false);
            }
        };
        getNotices();
    }, []);

    const getIcon = (category) => {
        switch (category) {
            case 'Urgent': return <AlertCircle size={20} className="text-red-500" />;
            case 'Exam': return <Book size={20} className="text-purple-500" />;
            case 'Event': return <Trophy size={20} className="text-yellow-500" />;
            default: return <Bell size={20} className="text-[#FF5C35]" />;
        }
    };

    if (loading) return null;

    return (
        <section className="py-20 relative bg-[#FFFBF2] dark:bg-[#0B1120]">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="text-[#FF5C35] font-semibold tracking-wider text-sm uppercase bg-[#FF5C35]/10 px-4 py-2 rounded-full">
                        Latest Updates
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4 font-serif text-[#2C1810] dark:text-white">
                        Notice Board
                    </h2>
                    <p className="text-[#2C1810]/70 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Stay informed with the latest announcements, exam schedules, and academic updates.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {notices.map((notice, index) => (
                        <div
                            key={notice._id}
                            className={`group bg-white dark:bg-[#1E293B] rounded-4xl p-8 border hover:border-[#FF5C35] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden
                                ${notice.isPinned ? 'border-[#FF5C35] shadow-lg shadow-[#FF5C35]/10' : 'border-gray-100 dark:border-gray-800'}
                            `}
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5C35]/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>

                            {notice.isPinned && (
                                <div className="absolute top-6 right-6 z-10 text-[#FF5C35]">
                                    <Pin size={20} fill="#FF5C35" className="transform rotate-45" />
                                </div>
                            )}

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                                        ${notice.category === 'Urgent' ? 'bg-red-50 dark:bg-red-900/10' :
                                            notice.category === 'Exam' ? 'bg-purple-50 dark:bg-purple-900/10' :
                                                'bg-[#FF5C35]/10'}
                                    `}>
                                        {getIcon(notice.category)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold uppercase tracking-wider
                                            ${notice.category === 'Urgent' ? 'text-red-500' :
                                                notice.category === 'Exam' ? 'text-purple-500' :
                                                    'text-[#FF5C35]'}
                                        `}>
                                            {notice.category}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                            <Calendar size={12} />
                                            <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-[#2C1810] dark:text-white mb-4 line-clamp-2 min-h-14 group-hover:text-[#FF5C35] transition-colors">
                                    {notice.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed text-sm">
                                    {notice.content}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        By {notice.postedByName}
                                    </div>
                                    {notice.attachments && notice.attachments.length > 0 && (
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                            Attachment available
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {notices.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500">No notices at the moment.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/notices" className="inline-flex items-center gap-2 text-[#FF5C35] font-semibold hover:gap-3 transition-all group">
                        View All Notices
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
