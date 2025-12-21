"use client";
import React, { useState, useEffect } from 'react';
import { fetchRoutines } from '../../Lib/api';
import { useAuth } from '@/context/AuthContext';
import { Clock, MapPin, BookOpen, AlertCircle, Calendar, Menu } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useSidebar } from '@/context/SidebarContext';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherToday({ onBack }) {
    const { user } = useAuth();
    const [todayClasses, setTodayClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDayStr, setCurrentDayStr] = useState('');
    const { toggleMobileSidebar } = useSidebar();

    useEffect(() => {
        const loadToday = async () => {
            if (!user || !user.name) return;

            const todayIndex = new Date().getDay();
            const dayName = DAYS[todayIndex];
            setCurrentDayStr(dayName);

            try {
                const routines = await fetchRoutines();
                const classes = [];

                routines.forEach(routine => {
                    const daySchedule = routine.days.find(d => d.name === dayName);
                    if (daySchedule && daySchedule.classes) {
                        daySchedule.classes.forEach(cls => {
                            if (cls.teacher === user.name) {
                                classes.push({
                                    ...cls,
                                    department: routine.department,
                                    semester: routine.semester,
                                    shift: routine.shift,
                                    group: routine.group
                                });
                            }
                        });
                    }
                });

                classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setTodayClasses(classes);
            } catch (error) {
                console.error("Error loading today's classes:", error);
            } finally {
                setLoading(false);
            }
        };

        loadToday();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className='size-24'>
                    <DotLottieReact src="/loader.lottie" loop autoplay />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Card */}
            <div className="bg-[#FF5C35] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-[#FF5C35]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-black mb-3 tracking-tight">Today&apos;s Classes</h2>
                        <div className="flex items-center justify-center md:justify-start gap-3 bg-black/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 ">
                            <Calendar size={18} className="text-orange-100" />
                            <span className="text-orange-50 font-bold uppercase tracking-wider text-sm">
                                {currentDayStr}, {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white text-[#FF5C35] p-6 rounded-3xl shadow-xl flex items-center gap-6 border-4 border-white/20 transform hover:scale-105 transition-transform">
                        <div className="text-center">
                            <div className="text-5xl font-black leading-none">{todayClasses.length}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Total Sessions</div>
                        </div>
                        <div className="w-px h-12 bg-[#FF5C35]/20"></div>
                        <Clock className="size-10" />
                    </div>
                </div>
            </div>

            {todayClasses.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-[#1E293B] rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-24 h-24 bg-[#FF5C35]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="h-10 w-10 text-[#FF5C35]/30" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Workspace Clear</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No classes scheduled for today. Time for deep work!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {todayClasses.map((cls, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-[#FF5C35]/5 transition-all relative overflow-hidden group border-l-8 border-l-[#FF5C35]">

                            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                {/* Time Column */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl min-w-[160px] text-center border border-gray-100 dark:border-gray-800 group-hover:bg-[#FF5C35] group-hover:text-white transition-colors duration-500">
                                    <h3 className="text-2xl font-black font-mono leading-none tracking-tighter">{cls.startTime}</h3>
                                    <div className="w-8 h-1 bg-[#FF5C35] group-hover:bg-white mx-auto my-3 rounded-full opacity-30"></div>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">to {cls.endTime}</p>
                                </div>

                                {/* Subject Info */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="bg-[#FF5C35]/10 text-[#FF5C35] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-[#FF5C35]/20">
                                                {cls.subjectCode}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase">
                                                <MapPin size={12} className="text-[#FF5C35]" strokeWidth={2.5} />
                                                Room: {cls.room}
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#FF5C35] transition-colors duration-300 tracking-tight leading-tight">
                                            {cls.subject}
                                        </h4>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                                            {cls.department}
                                        </span>
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                                            Sem {cls.semester} • {cls.group}
                                        </span>
                                    </div>
                                </div>

                                {/* Shift Details */}
                                <div className="text-right hidden sm:block">
                                    <div className="bg-[#FF5C35]/5 dark:bg-[#FF5C35]/10 px-6 py-3 rounded-2xl border border-[#FF5C35]/10">
                                        <div className="text-lg font-black text-[#FF5C35] uppercase tracking-tighter leading-none">{cls.shift} Shift</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">Official Session</div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                                <BookOpen size={120} className="text-[#FF5C35]" strokeWidth={1} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
