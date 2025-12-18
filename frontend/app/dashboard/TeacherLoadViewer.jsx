'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, Briefcase, Users, ChevronLeft, MapPin, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { fetchTeachers, analyzeLoad, fetchRoutines, fetchRooms } from '@/Lib/api';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherLoadViewer({ onBack }) {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [loadData, setLoadData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [teachersLoading, setTeachersLoading] = useState(true);
    const [allRoutines, setAllRoutines] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [teacherRoutines, setTeacherRoutines] = useState([]);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        setTeachersLoading(true);
        try {
            const [teachersData, routinesData, roomsData] = await Promise.all([
                fetchTeachers(),
                fetchRoutines(),
                fetchRooms()
            ]);
            setTeachers(teachersData);
            setAllRoutines(Array.isArray(routinesData) ? routinesData : []);
            setRooms(Array.isArray(roomsData) ? roomsData : []);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error('Failed to load data');
        } finally {
            setTeachersLoading(false);
        }
    };

    const handleTeacherSelect = async (teacherName) => {
        setSelectedTeacher(teacherName);
        if (!teacherName) {
            setLoadData(null);
            setTeacherRoutines([]);
            return;
        }

        setLoading(true);
        try {
            // Fetch ALL routines across all departments and semesters
            const result = await analyzeLoad('', '', '');
            if (result.success && result.data) {
                // Filter assignments for selected teacher
                const teacherAssignments = result.data.assignments.filter(
                    assignment => assignment.teacherName === teacherName
                );

                // Calculate totals (Using Class Counts NOT Periods)
                const totalTheory = teacherAssignments.reduce((sum, a) => sum + (a.theoryCount || 0), 0);
                const totalLab = teacherAssignments.reduce((sum, a) => sum + (a.practicalCount || 0), 0);
                const totalLoad = teacherAssignments.reduce((sum, a) => sum + (a.totalClasses || 0), 0);

                setLoadData({
                    assignments: teacherAssignments,
                    totalTheory,
                    totalLab,
                    totalLoad
                });

                // Filter routines for this teacher
                const routines = allRoutines.filter(routine =>
                    routine.days.some(day =>
                        day.classes.some(cls => cls.teacher === teacherName)
                    )
                );
                setTeacherRoutines(routines);
            } else {
                setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch load data:', error);
            setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
            setTeacherRoutines([]);
        } finally {
            setLoading(false);
        }
    };

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
        const cls = day.classes.find(c => c.startTime === slot.start && c.teacher === selectedTeacher);
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
            const classInfo = day.classes.find(c => c.startTime === slot.start && c.teacher === selectedTeacher); // Check ONLY teacher's classes for merging

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

        teacherRoutines.forEach((routine) => {
            if (!isFirstPage) {
                doc.addPage();
            }
            isFirstPage = false;

            const timeSlots = getTimeSlots(routine.shift);

            // Header Background (Grayscale)
            doc.setFillColor(240, 240, 240); // Light gray
            doc.rect(0, 0, 297, 35, 'F');

            // Title
            doc.setTextColor(0, 0, 0); // Black
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text("Teacher Routine", 148, 12, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`${selectedTeacher}`, 148, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`${routine.department} - Semester ${routine.semester} (${routine.shift} Shift, Group ${routine.group})`, 148, 28, { align: 'center' });

            // Table Headers
            const headers = ['Day', ...timeSlots.map(slot => slot.label)];

            // Table Body
            const body = DAYS.map(dayName => {
                const row = [{ content: dayName, styles: { fontStyle: 'bold', fillColor: [230, 230, 230], textColor: [0, 0, 0] } }]; // Light gray bg for days

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
                        // Resolve room name if needed
                        const room = rooms.find(r => r.number === roomStr || r.name === roomStr);
                        if (room && room.type) {
                            roomStr += ` (${room.type})`;
                        }

                        row.push({
                            content: `${classInfo.subjectCode}\n${classInfo.subject}\n${roomStr}`,
                            colSpan: colspan,
                            // White bg for class cells with black text
                            styles: { halign: 'center', valign: 'middle', fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] }
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
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', lineWidth: 0.1, lineColor: [0, 0, 0], textColor: [0, 0, 0] },
                headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', valign: 'middle' }, // Dark gray header
                theme: 'grid', // Use grid theme for lines
                margin: { top: 40, left: 10, right: 10 },
            });
        });

        doc.save(`${selectedTeacher}_Routine_Full.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-card-bg rounded-3xl p-8 shadow border border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onBack}
                        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF5C35] transition">
                        <ChevronLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#FF5C35]/10 flex items-center justify-center">
                            <BarChart3 className="text-[#FF5C35]" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Load Viewer</h1>
                            <p className="text-gray-500 dark:text-gray-400">View teaching workload for any teacher</p>
                        </div>
                    </div>
                </div>

                {/* Download Button (Only visible when a teacher is selected) */}
                {selectedTeacher && teacherRoutines.length > 0 && !loading && (
                    <div className="flex justify-end">
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg cursor-pointer"
                        >
                            <Download size={18} /> Download All (PDF)
                        </button>
                    </div>
                )}

                {/* Teacher Selection */}
                <div className="bg-white dark:bg-card-bg rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select Teacher
                    </label>
                    {teachersLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF5C35]"></div>
                            Loading teachers...
                        </div>
                    ) : (
                        <select
                            value={selectedTeacher}
                            onChange={(e) => handleTeacherSelect(e.target.value)}
                            className="w-full max-w-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35] focus:border-transparent transition">
                            <option value="">-- Select a teacher --</option>
                            {teachers.map((teacher, index) => (
                                <option key={index} value={teacher.name}>
                                    {teacher.name} - {teacher.department}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C35]"></div>
                    </div>
                )}

                {/* Load Statistics */}
                {!loading && loadData && selectedTeacher && (
                    <>
                        {loadData.assignments.length > 0 ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Theory Classes</p>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{loadData.totalTheory}</p>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">classes/week</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase size={20} className="text-purple-600 dark:text-purple-400" />
                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Lab Classes</p>
                                        </div>
                                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{loadData.totalLab}</p>
                                        <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">classes/week</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 size={20} className="text-orange-600 dark:text-orange-400" />
                                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Load</p>
                                        </div>
                                        <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{loadData.totalLoad}</p>
                                        <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">classes/week</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen size={20} className="text-green-600 dark:text-green-400" />
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Subjects</p>
                                        </div>
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{loadData.assignments.length}</p>
                                        <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">assigned</p>
                                    </div>
                                </div>

                                {/* Subject Breakdown */}
                                <div className="bg-white dark:bg-card-bg rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Subject Breakdown</h3>
                                    <div className="space-y-3">
                                        {loadData.assignments.map((assignment, index) => (
                                            <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h5 className="font-semibold text-gray-900 dark:text-white">{assignment.subject}</h5>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {assignment.subjectCode} • {assignment.technology}
                                                        </p>
                                                        {assignment.rooms && (
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                Rooms: {assignment.rooms}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Theory</p>
                                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{assignment.theoryCount || 0}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Lab</p>
                                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{assignment.practicalCount || 0}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                                            <p className="text-lg font-bold text-[#FF5C35]">{assignment.totalClasses || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Routine Display */}
                                {teacherRoutines.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Assigned Routines</h3>
                                        {teacherRoutines.map((routine) => {
                                            const timeSlots = getTimeSlots(routine.shift);
                                            return (
                                                <div key={routine._id} className="bg-white dark:bg-card-bg rounded-xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
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
                                                                    <tr key={day} className={dayIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-card-bg'}>
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
                                                                                                            const room = Array.isArray(rooms) ? rooms.find(r => r.number === classInfo.room || r.name === classInfo.room) : null;
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
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white dark:bg-card-bg rounded-3xl p-12 shadow border border-gray-100 dark:border-gray-800 text-center">
                                <BarChart3 className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Teaching Assignments</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {selectedTeacher} has no teaching assignments in the current routines.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State - No Teacher Selected */}
                {!loading && !selectedTeacher && (
                    <div className="bg-white dark:bg-card-bg rounded-3xl p-12 shadow border border-gray-100 dark:border-gray-800 text-center">
                        <Users className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Teacher</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Choose a teacher from the dropdown above to view their teaching load
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
