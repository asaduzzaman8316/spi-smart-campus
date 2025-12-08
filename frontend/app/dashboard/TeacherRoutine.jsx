"use client";
import React, { useState, useEffect } from 'react';
import { fetchRoutines, fetchRooms } from '../../Lib/api';
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
    const [myRoutines, setMyRoutines] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user || !user.name) return;

            try {
                const [routinesData, roomsData] = await Promise.all([
                    fetchRoutines(),
                    fetchRooms()
                ]);

                setRooms(roomsData);

                // Filter routines where the teacher has at least one class
                const teacherRoutines = routinesData.filter(routine =>
                    routine.days.some(day =>
                        day.classes.some(cls => cls.teacher === user.name)
                    )
                );

                setMyRoutines(teacherRoutines);
            } catch (error) {
                console.error("Error loading routine:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Helper to generate time slots based on shift
    const getTimeSlots = (shift) => {
        if (shift === "1st") {
            return [
                { label: "08:00 - 08:45", start: "08:00", end: "08:45" },
                { label: "08:45 - 09:30", start: "08:45", end: "09:30" },
                { label: "09:30 - 10:15", start: "09:30", end: "10:15" },
                { label: "10:15 - 11:00", start: "10:15", end: "11:00" },
                { label: "11:00 - 11:45", start: "11:00", end: "11:45" },
                { label: "11:45 - 12:30", start: "11:45", end: "12:30" },
                { label: "12:30 - 01:15", start: "12:30", end: "13:15" },
            ];
        } else {
            return [
                { label: "01:30 - 02:15", start: "13:30", end: "14:15" },
                { label: "02:15 - 03:00", start: "14:15", end: "15:00" },
                { label: "03:00 - 03:45", start: "15:00", end: "15:45" },
                { label: "03:45 - 04:30", start: "15:45", end: "16:30" },
                { label: "04:30 - 05:15", start: "16:30", end: "17:15" },
                { label: "05:15 - 06:00", start: "17:15", end: "18:00" },
                { label: "06:00 - 06:45", start: "18:00", end: "18:45" }
            ];
        }
    };

    const getClassForSlot = (routine, dayName, slot, timeSlots) => {
        const day = routine.days.find(d => d.name === dayName);
        if (!day) return null;

        // Find class starting at this slot
        const cls = day.classes.find(c => c.startTime === slot.start && c.teacher === user.name);
        return cls || null;
    };

    const getClassSpanInfo = (classInfo, slots) => {
        if (!classInfo || !slots) return { colspan: 1 };
        const startIndex = slots.findIndex(s => s.start === classInfo.startTime);
        if (startIndex === -1) return { colspan: 1 };

        const endIndex = slots.findIndex(s => s.end === classInfo.endTime);
        if (endIndex === -1) return { colspan: 1 };

        return { colspan: endIndex - startIndex + 1 };
    };

    const shouldSkipSlot = (routine, dayName, slotIndex, timeSlots) => {
        const day = routine.days.find(d => d.name === dayName);
        if (!day) return false;

        for (let i = 0; i < slotIndex; i++) {
            const slot = timeSlots[i];
            const classInfo = day.classes.find(c => c.startTime === slot.start && c.teacher === user.name); // Check ONLY teacher's classes for merging

            if (classInfo) {
                const spanInfo = getClassSpanInfo(classInfo, timeSlots);
                if (spanInfo && (i + spanInfo.colspan) > slotIndex) {
                    return true;
                }
            }
        }
        return false;
    };

    const downloadPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        let isFirstPage = true;

        myRoutines.forEach((routine) => {
            if (!isFirstPage) {
                doc.addPage();
            }
            isFirstPage = false;

            const timeSlots = getTimeSlots(routine.shift);

            // Header Background
            doc.setFillColor(88, 28, 135);
            doc.rect(0, 0, 297, 35, 'F');

            // Title
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text("Teacher Routine", 148, 12, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`${user.name}`, 148, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`${routine.department} - Semester ${routine.semester} (${routine.shift} Shift, Group ${routine.group})`, 148, 28, { align: 'center' });

            // Table Headers
            const headers = ['Day', ...timeSlots.map(slot => slot.label)];

            // Table Body
            const body = DAYS.map(dayName => {
                const row = [{ content: dayName, styles: { fontStyle: 'bold', fillColor: [237, 233, 254] } }];

                for (let i = 0; i < timeSlots.length; i++) {
                    if (shouldSkipSlot(routine, dayName, i, timeSlots)) {
                        continue;
                    }

                    const slot = timeSlots[i];
                    const classInfo = getClassForSlot(routine, dayName, slot, timeSlots);
                    const spanInfo = classInfo ? getClassSpanInfo(classInfo, timeSlots) : null;
                    const colspan = spanInfo ? spanInfo.colspan : 1;

                    if (classInfo) {
                        let roomStr = classInfo.room || '';
                        // Resolve room name if needed (optional for PDF but good for completeness)
                        const room = rooms.find(r => r.number === roomStr || r.name === roomStr);
                        if (room && room.type) {
                            roomStr += ` (${room.type})`;
                        }

                        row.push({
                            content: `${classInfo.subjectCode}\n${classInfo.subject}\n${roomStr}`,
                            colSpan: colspan,
                            styles: { halign: 'center', valign: 'middle', fillColor: [243, 232, 255] } // Light purple for classes
                        });
                    } else {
                        row.push({
                            content: '----',
                            colSpan: 1,
                            styles: { halign: 'center', valign: 'middle', textColor: [150, 150, 150] }
                        });
                    }
                }
                return row;
            });

            autoTable(doc, {
                startY: 40,
                head: [headers],
                body: body,
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', lineWidth: 0.1 },
                headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', valign: 'middle' },
                theme: 'grid',
                margin: { top: 40, left: 10, right: 10 },
            });
        });

        doc.save(`${user.name}_Routine_Full.pdf`);
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

    if (myRoutines.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Classes Found</h3>
                <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any classes assigned in the routines.</p>
                {/* Mobile Sidebar Toggle */}
                <div className="fixed bottom-6 right-6 z-50 md:hidden">
                    <button
                        onClick={() => toggleMobileSidebar()}
                        className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-transform active:scale-95"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="text-purple-500" />
                    My Weekly Routine
                </h2>
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-500/30"
                >
                    <Download size={18} /> Download All (PDF)
                </button>
            </div>

            {myRoutines.map((routine) => {
                const timeSlots = getTimeSlots(routine.shift);
                return (
                    <div key={routine._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {routine.department}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Semester {routine.semester} • {routine.shift} Shift • Group {routine.group}
                            </p>
                        </div>

                        <div className="overflow-x-auto p-4">
                            <table className="w-full border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-purple-600 text-white">
                                        <th className="border border-purple-500 px-4 py-3 text-left min-w-[100px]">Day</th>
                                        {timeSlots.map((slot, index) => (
                                            <th key={index} className="border border-purple-500 px-2 py-3 text-center min-w-[140px]">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs opacity-75">{slot.label}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map((day, dayIndex) => (
                                        <tr key={day} className={dayIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'}>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                                {day}
                                            </td>
                                            {timeSlots.map((slot, slotIndex) => {
                                                if (shouldSkipSlot(routine, day, slotIndex, timeSlots)) return null;

                                                const classInfo = getClassForSlot(routine, day, slot, timeSlots);
                                                const spanInfo = classInfo ? getClassSpanInfo(classInfo, timeSlots) : null;
                                                const colspan = spanInfo ? spanInfo.colspan : 1;

                                                return (
                                                    <td
                                                        key={slotIndex}
                                                        colSpan={colspan}
                                                        className={`border border-gray-200 dark:border-gray-700 px-2 py-3 text-center transition-colors
                                                            ${classInfo ? 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40' : ''}
                                                        `}
                                                    >
                                                        {classInfo ? (
                                                            <div className="space-y-1">
                                                                <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                                                                    {classInfo.subjectCode}
                                                                </div>
                                                                <div className="text-gray-900 dark:text-white text-xs font-medium line-clamp-2">
                                                                    {classInfo.subject}
                                                                </div>
                                                                {classInfo.room && (
                                                                    <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                                                        <MapPin size={10} />
                                                                        <span>
                                                                            {classInfo.room}
                                                                            {(() => {
                                                                                const room = rooms.find(r => r.number === classInfo.room || r.name === classInfo.room);
                                                                                return room && room.type ? ` (${room.type})` : '';
                                                                            })()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-600 text-xs">---</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {/* Mobile Sidebar Toggle */}
            <div className="fixed bottom-6 right-6 z-50 md:hidden">
                <button
                    onClick={() => toggleMobileSidebar()}
                    className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-transform active:scale-95"
                >
                    <Menu size={24} />
                </button>
            </div>
        </div>
    );
}
