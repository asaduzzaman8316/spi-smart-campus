"use client";
import React, { useState, useEffect } from 'react';
import { fetchRoutines } from '../../Lib/api';
import { useSelector } from 'react-redux';
import { selectUser } from '@/Lib/features/auth/authReducer';
import { Clock, MapPin, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherToday({ onBack }) {
    const user = useSelector(selectUser);
    const [todayClasses, setTodayClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDayStr, setCurrentDayStr] = useState('');

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
        <div className="space-y-6">
            <div className="bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Today&apos;s Schedule</h2>
                        <p className="text-purple-100 text-lg flex items-center gap-2">
                            <Calendar size={20} />
                            {currentDayStr}, {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
                        <div className="text-3xl font-bold">{todayClasses.length}</div>
                        <div className="text-sm text-purple-100">Classes Today</div>
                    </div>
                </div>
            </div>

            {todayClasses.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Classes Today</h3>
                    <p className="text-gray-500 dark:text-gray-400">Enjoy your free day!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {todayClasses.map((cls, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Accent Line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-purple-500 to-pink-500 group-hover:w-2 transition-all"></div>

                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center pl-4">
                                {/* Time */}
                                <div className="min-w-[140px]">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{cls.startTime}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">to {cls.endTime}</p>
                                </div>

                                {/* Subject */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BookOpen size={18} className="text-purple-500" />
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{cls.subject}</h4>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{cls.subjectCode}</span>
                                        {cls.room && (
                                            <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                                                <MapPin size={12} /> {cls.room}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Class Details */}
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{cls.department}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {cls.shift} Shift • Group {cls.group}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
