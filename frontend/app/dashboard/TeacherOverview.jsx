"use client";
import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Bell,
    Clock,
    Calendar,
    MapPin,
    ArrowRight,
    GraduationCap,
    CheckCircle
} from 'lucide-react';
import { fetchNotices, fetchRoutines } from '../../Lib/api';
import { useRouter } from 'next/navigation';

export default function TeacherOverview({ user, setActiveView }) {
    const [stats, setStats] = useState({
        todayClasses: 0,
        weeklyLoad: 0,
        nextClass: null
    });
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const [routinesData, noticesData] = await Promise.all([
                    fetchRoutines(),
                    fetchNotices('', user.department) // Filter notices by teacher's department
                ]);

                // Filter Routines for this Teacher
                const teacherName = user.name;
                const teacherNickName = user.nickName || ""; // Assuming user object might have this
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const currentDayName = days[new Date().getDay()];

                let myWeeklyLoad = 0;
                let todaysClasses = [];
                let everything = [];

                routinesData.forEach(routine => {
                    routine.days.forEach(day => {
                        day.classes.forEach(cls => {
                            if (cls.teacher === teacherName || (teacherNickName && cls.teacher === teacherNickName)) {
                                // Calculate Load
                                const start = new Date(`2000-01-01 ${cls.startTime}`);
                                const end = new Date(`2000-01-01 ${cls.endTime}`);
                                const diffMinutes = (end - start) / 60000;
                                let periods = 1;
                                if (diffMinutes > 50) periods = 2;
                                myWeeklyLoad += periods;

                                // Check if today
                                if (day.day === currentDayName) {
                                    todaysClasses.push({
                                        ...cls,
                                        department: routine.department,
                                        semester: routine.semester,
                                        group: routine.group,
                                        startTimeDate: start
                                    });
                                }
                            }
                        });
                    });
                });

                // Sort today's classes by time
                todaysClasses.sort((a, b) => a.startTimeDate - b.startTimeDate);

                // Find next class (if any remain today)
                const now = new Date();
                const currentTime = new Date(`2000-01-01 ${now.getHours()}:${now.getMinutes()}`);
                const next = todaysClasses.find(c => new Date(`2000-01-01 ${c.startTime}`) > currentTime);

                setStats({
                    todayClasses: todaysClasses.length,
                    weeklyLoad: myWeeklyLoad,
                    nextClass: next ? `${next.subject} (${next.room})` : 'No more classes'
                });

                setTodaySchedule(todaysClasses);
                setNotices(noticesData.data ? noticesData.data.slice(0, 3) : []);

            } catch (error) {
                console.error("Failed to fetch teacher data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 bg-[#FFFBF2] dark:bg-[#0B1120] min-h-screen pt-18 p-6 rounded-3xl font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C1810] dark:text-white tracking-tight mb-2">
                        Welcome, {user.name.split(' ')[0]}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Your academic dashboard and daily schedule
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-2xl font-bold text-[#FF5C35]">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Classes Today"
                    value={stats.todayClasses}
                    icon={Calendar}
                    color="orange"
                    trend="Daily Info"
                />
                <StatCard
                    label="Weekly Load"
                    value={stats.weeklyLoad}
                    icon={BookOpen}
                    color="blue"
                    trend="Periods/Week"
                />
                <StatCard
                    label="Next Class"
                    value={stats.nextClass || "Free"}
                    icon={Clock}
                    color="green"
                    trend="Upcoming"
                    isTextSmall={!!stats.nextClass}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white flex items-center gap-2">
                            <Clock className="text-[#FF5C35]" size={24} />
                            Today's Schedule
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {todaySchedule.length > 0 ? (
                            todaySchedule.map((cls, index) => (
                                <div key={index} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-[#FF5C35]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        {index !== todaySchedule.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1"></div>}
                                    </div>
                                    <div className="flex-1 pb-6 relative">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#FF5C35]/30 transition-all hover:shadow-md group-hover:-translate-y-1 duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-lg text-[#2C1810] dark:text-white">{cls.subject}</h4>
                                                    <p className="text-[#FF5C35] font-medium text-sm">{cls.subjectCode}</p>
                                                </div>
                                                <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                    {cls.startTime} - {cls.endTime}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={16} />
                                                    <span>{cls.room || "Room TBD"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap size={16} />
                                                    <span>{cls.department} ({cls.semester})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-gray-400" size={32} />
                                </div>
                                <h3 className="font-bold text-gray-600 dark:text-gray-300">No classes today!</h3>
                                <p className="text-gray-400 text-sm mt-1">Enjoy your free time.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notices Sidebar */}
                <div className="bg-white dark:bg-[#1E293B] p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-serif font-bold text-[#2C1810] dark:text-white">Recent Notices</h3>
                        <button onClick={() => setActiveView('notices')} className="text-sm font-bold text-[#FF5C35] hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {notices.length > 0 ? notices.map((notice, i) => (
                            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#FF5C35]/30 transition group cursor-pointer">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <Bell size={16} className="text-[#FF5C35]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2 group-hover:text-[#FF5C35] transition-colors">
                                            {notice.title}
                                        </h4>
                                        <span className="text-xs font-bold text-gray-400 block mt-2">
                                            {new Date(notice.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-4">No recent notices</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, trend, isTextSmall }) {
    const colors = {
        white: 'text-gray-600 bg-gray-50 dark:bg-gray-500/10',
        orange: 'text-[#FF5C35] bg-orange-50 dark:bg-orange-500/10',
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
        green: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
    };

    return (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color] || colors.orange} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{trend}</span>
                </div>
            </div>
            <h3 className={`${isTextSmall ? 'text-xl' : 'text-3xl'} font-bold text-[#2C1810] dark:text-white mb-1 truncate`}>
                {value}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
        </div>
    );
}
