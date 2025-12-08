"use client";
import React, { useState, useEffect } from 'react';
import { fetchRoutines } from '../../Lib/api';
import { useSelector } from 'react-redux';
import { selectUser } from '@/Lib/features/auth/authReducer';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, Download, Menu } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useSidebar } from '@/context/SidebarContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherRoutine({ onBack }) {
    const user = useSelector(selectUser);
    const { toggleMobileSidebar } = useSidebar();
    const [weeklySchedule, setWeeklySchedule] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRoutine = async () => {
            if (!user || !user.name) return;

            try {
                const routines = await fetchRoutines();
                const schedule = {};

                DAYS.forEach(day => {
                    schedule[day] = [];
                });

                routines.forEach(routine => {
                    routine.days.forEach(day => {
                        day.classes.forEach(cls => {
                            if (cls.teacher === user.name) {
                                schedule[day.name].push({
                                    ...cls,
                                    department: routine.department,
                                    semester: routine.semester,
                                    shift: routine.shift,
                                    group: routine.group
                                });
                            }
                        });
                    });
                });

                // Sort classes by time for each day
                DAYS.forEach(day => {
                    schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
                });

                setWeeklySchedule(schedule);
            } catch (error) {
                console.error("Error loading routine:", error);
            } finally {
                setLoading(false);
            }
        };

        loadRoutine();
    }, [user]);

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(88, 28, 135);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Teacher Routine", 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text(user.name, 105, 30, { align: 'center' });

        let yPos = 50;

        DAYS.forEach(day => {
            const classes = weeklySchedule[day];
            if (classes && classes.length > 0) {
                // Check for page break
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(day, 14, yPos);
                yPos += 5;

                const tableBody = classes.map(cls => [
                    `${cls.startTime} - ${cls.endTime}`,
                    `${cls.subject}\n(${cls.subjectCode})`,
                    `${cls.department} (S${cls.semester})`,
                    `${cls.shift} / ${cls.group}`,
                    cls.room || '-'
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [['Time', 'Subject', 'Dept', 'Group', 'Room']],
                    body: tableBody,
                    styles: { fontSize: 10, cellPadding: 2 },
                    theme: 'grid',
                    headStyles: { fillColor: [109, 40, 217] },
                });

                yPos = doc.lastAutoTable.finalY + 15;
            }
        });

        doc.save(`${user.name}_Routine.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className='size-24'>
                    <DotLottieReact src="/loader.lottie" loop autoplay />
                </div>
            </div>
        );
    }

    const hasClasses = Object.values(weeklySchedule).some(arr => arr.length > 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="text-purple-500" />
                    My Weekly Routine
                </h2>
                {hasClasses && (
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                        <Download size={18} /> Download PDF
                    </button>
                )}
            </div>

            {!hasClasses ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Classes Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any classes assigned in the routines.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {DAYS.map(day => {
                        const classes = weeklySchedule[day];
                        if (!classes || classes.length === 0) return null;

                        return (
                            <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400">{day}</h3>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {classes.map((cls, idx) => (
                                        <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                {/* Time & Room */}
                                                <div className="flex items-center gap-6 min-w-[200px]">
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                        <Clock size={16} className="text-purple-500" />
                                                        <span className="font-mono font-medium">{cls.startTime} - {cls.endTime}</span>
                                                    </div>
                                                    {cls.room && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                            <MapPin size={14} />
                                                            <span>{cls.room}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Subject */}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{cls.subject}</h4>
                                                    <p className="text-sm text-purple-500 font-medium">{cls.subjectCode}</p>
                                                </div>

                                                {/* Class Info */}
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-900/30">
                                                        {cls.department}
                                                    </span>
                                                    <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-100 dark:border-emerald-900/30">
                                                        {cls.shift} / G-{cls.group}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Mobile Sidebar Toggle */}
            <div className="fixed bottom-6 right-6 z-50 md:hidden">
                <button
                    onClick={()=> toggleMobileSidebar()}
                    className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-transform active:scale-95"
                >
                    <Menu size={24} />
                </button>
            </div>
        </div>
    );
}
