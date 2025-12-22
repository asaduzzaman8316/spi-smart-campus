"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { fetchRoutines, fetchRooms, analyzeLoad } from '../../Lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, Download, BarChart3, Briefcase, Users, Printer } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const DEPT_MAP = {
    "Computer Science and Technology": "CST",
    "Computer": "CST",
    "Mechanical Technology": "MT",
    "Mechanical": "MT",
    "Electronics Technology": "ENT",
    "Electronics": "ENT",
    "Electrical Technology": "ET",
    "Electrical": "ET",
    "Civil Technology": "CT",
    "Civil": "CT",
    "Power Technology": "PT",
    "Power": "PT",
    "Electromechanical Technology": "EMT",
    "Electromechanical": "EMT"
};

const TIME_SLOTS = {
    "1st": [
        { label: "08:00 - 08:45", start: "08:00", end: "08:45" },
        { label: "08:45 - 09:30", start: "08:45", end: "09:30" },
        { label: "09:30 - 10:15", start: "09:30", end: "10:15" },
        { label: "10:15 - 11:00", start: "10:15", end: "11:00" },
        { label: "11:00 - 11:45", start: "11:00", end: "11:45" },
        { label: "11:45 - 12:30", start: "11:45", end: "12:30" },
        { label: "12:30 - 01:15", start: "12:30", end: "13:15" },
    ],
    "2nd": [
        { label: "01:30 - 02:15", start: "13:30", end: "14:15" },
        { label: "02:15 - 03:00", start: "14:15", end: "15:00" },
        { label: "03:00 - 03:45", start: "15:00", end: "15:45" },
        { label: "03:45 - 04:30", start: "15:45", end: "16:30" },
        { label: "04:30 - 05:15", start: "16:30", end: "17:15" },
        { label: "05:15 - 06:00", start: "17:15", end: "18:00" },
        { label: "06:00 - 06:45", start: "18:00", end: "18:45" }
    ]
};

const getDeptShortHand = (dept) => {
    for (let key in DEPT_MAP) {
        if (dept.includes(key)) return DEPT_MAP[key];
    }
    return dept.slice(0, 3).toUpperCase();
};

export default function TeacherRoutine({ onBack }) {
    const { user } = useAuth();
    const [allRoutines, setAllRoutines] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadData, setLoadData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user?.name) return;
            setLoading(true);
            try {
                const [routinesData, roomsData, result] = await Promise.all([
                    fetchRoutines(),
                    fetchRooms(),
                    analyzeLoad('', '', '')
                ]);

                setAllRoutines(Array.isArray(routinesData) ? routinesData : []);
                setRooms(Array.isArray(roomsData) ? roomsData : []);

                if (result.success && result.data) {
                    const teacherAssignments = result.data.assignments.filter(
                        assignment => assignment.teacherName === user.name
                    );

                    const totalTheory = teacherAssignments.reduce((sum, a) => sum + (a.theoryCount || 0), 0);
                    const totalLab = teacherAssignments.reduce((sum, a) => sum + (a.practicalCount || 0), 0);
                    const totalLoad = teacherAssignments.reduce((sum, a) => sum + (a.totalClasses || 0), 0);

                    setLoadData({
                        assignments: teacherAssignments,
                        totalTheory,
                        totalLab,
                        totalLoad
                    });
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [user]);

    const getClassSpanInfo = (classInfo, currentSlots) => {
        if (!classInfo || !currentSlots) return { colSpan: 1 };
        const startIndex = currentSlots.findIndex(s => s.start === classInfo.startTime);
        if (startIndex === -1) return { colSpan: 1 };

        const endIndex = currentSlots.findIndex(s => s.end === classInfo.endTime);
        if (endIndex === -1) return { colSpan: 1 };

        return { colSpan: endIndex - startIndex + 1 };
    };

    const getTeacherSlotData = (day, slotIndex, currentSlots) => {
        if (!user?.name) return null;
        let matches = [];
        const slot = currentSlots[slotIndex];
        if (!slot) return null;

        allRoutines.forEach(r => {
            const rDay = r.days.find(d => d.name === day);
            if (!rDay) return;

            rDay.classes.forEach(cls => {
                if (cls.teacher === user.name && cls.startTime === slot.start) {
                    matches.push({ ...cls, semester: r.semester, department: r.department, group: r.group });
                }
            });
        });

        if (matches.length === 0) return null;

        const grouped = {};
        matches.forEach(m => {
            const key = `${m.subjectCode || m.subject}-${m.room}`;
            if (!grouped[key]) {
                const spanInfo = getClassSpanInfo(m, currentSlots);
                grouped[key] = {
                    ...m,
                    groups: [m.group],
                    colSpan: spanInfo.colSpan
                };
            } else {
                if (!grouped[key].groups.includes(m.group)) {
                    grouped[key].groups.push(m.group);
                }
            }
        });

        return Object.values(grouped).map(g => {
            const deptShort = getDeptShortHand(g.department);
            const groupsStr = g.groups.sort().join('/');
            return {
                header: `${g.semester}/${deptShort}/${groupsStr}`,
                subject: g.subjectCode || g.subject,
                room: g.room,
                colSpan: g.colSpan
            };
        });
    };

    const downloadPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("OFFICIAL WEEKLY SCHEDULE", pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(16);
        doc.text(user.name.toUpperCase(), pageWidth / 2, 23, { align: 'center' });

        let currentY = 30;

        ["1st", "2nd"].forEach(shift => {
            const currentSlots = TIME_SLOTS[shift];
            const hasClasses = DAYS.some(day =>
                currentSlots.some((_, i) => getTeacherSlotData(day, i, currentSlots) !== null)
            );

            if (!hasClasses) return;

            doc.setFontSize(12);
            doc.setFillColor(230, 230, 230);
            doc.rect(10, currentY, pageWidth - 20, 8, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text(`${shift} SHIFT ROUTINE`, 15, currentY + 6);

            const headers = ['Day', ...currentSlots.map((_, i) => `${i + 1} Period`)];
            const subHeaders = ['', ...currentSlots.map(s => s.label)];

            const body = DAYS.map(day => {
                const row = [day];
                for (let i = 0; i < currentSlots.length; i++) {
                    const slotData = getTeacherSlotData(day, i, currentSlots);

                    // Improved skipping logic for PDF
                    let isSkipped = false;
                    for (let prevIdx = 0; prevIdx < i; prevIdx++) {
                        const prevData = getTeacherSlotData(day, prevIdx, currentSlots);
                        if (prevData) {
                            const maxSpan = Math.max(...prevData.map(d => d.colSpan));
                            if (prevIdx + maxSpan > i) {
                                isSkipped = true;
                                break;
                            }
                        }
                    }

                    if (isSkipped) continue;

                    if (slotData) {
                        const maxSpan = Math.max(...slotData.map(d => d.colSpan));
                        const content = slotData.map(d => `${d.header}\n\n${d.subject}\n\n[T]${user.name}\n\nRM: ${d.room}`).join('\n---\n');
                        row.push({
                            content,
                            colSpan: maxSpan,
                            styles: { halign: 'center', valign: 'middle', fontSize: 8.5, fontStyle: 'bold' }
                        });
                    } else {
                        row.push({
                            content: '---',
                            styles: { halign: 'center', valign: 'middle' }
                        });
                    }
                }
                return row;
            });

            autoTable(doc, {
                startY: currentY + 10,
                head: [headers, subHeaders],
                body: body,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    minCellHeight: 22, // Reduced row height
                    textColor: [0, 0, 0],
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    fillColor: [250, 250, 250] // Light gray for odd rows
                },
                headStyles: {
                    fillColor: [250, 250, 250],
                    textColor: [0, 0, 0],
                    halign: 'center',
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    minCellHeight: 12
                },
                columnStyles: {
                    0: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: 25, halign: 'center', valign: 'middle' },
                    1: { cellWidth: 36 },
                    2: { cellWidth: 36 },
                    3: { cellWidth: 36 },
                    4: { cellWidth: 36 },
                    5: { cellWidth: 36 },
                    6: { cellWidth: 36 },
                    7: { cellWidth: 36 }
                },
                margin: { left: 10, right: 10 },
                tableWidth: 'fixed',
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index > 0 && data.cell.raw && data.cell.raw.content !== '---') {
                        // Hide default text drawing to prevent "doubling" or "shadows"
                        data.cell.styles.textColor = [255, 255, 255];
                    }
                },
                didDrawCell: function (data) {
                    if (data.section === 'body' && data.column.index > 0 && data.cell.raw && data.cell.raw.content !== '---') {
                        const doc = data.doc;
                        const cell = data.cell;
                        const lines = cell.text;

                        const fontSize = cell.styles.fontSize;
                        const lineHeight = (fontSize * 1.2) / doc.internal.scaleFactor;
                        const totalHeight = lines.length * lineHeight;
                        let y = cell.y + (cell.height / 2) - (totalHeight / 2) + lineHeight;

                        lines.forEach((line) => {
                            const isTeacher = line.includes('[T]');
                            const cleanLine = line.replace('[T]', '');

                            if (isTeacher) { // Teacher name line
                                doc.setFont('helvetica', 'italic');
                                doc.setTextColor(100, 100, 100);
                            } else {
                                doc.setFont('helvetica', 'bold');
                                doc.setTextColor(0, 0, 0);
                            }
                            doc.text(cleanLine, cell.x + cell.width / 2, y, { align: 'center' });
                            y += lineHeight;
                        });
                    }
                },
                didDrawPage: (data) => { currentY = data.cursor.y + 15; }
            });
        });

        doc.save(`${user.name}_Schedule.pdf`);
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

    if (!loadData || loadData.assignments.length === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 mx-auto max-w-2xl mt-12 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="text-gray-300 dark:text-gray-600" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Schedule Found</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium px-8">
                    You currently have no active teaching assignments in the system. Please contact the academic coordinator.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10">
                <div className="flex items-center gap-4">
                    <div className="bg-[#FF5C35]/10 p-4 rounded-2xl">
                        <Calendar className="text-[#FF5C35]" size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Professional Routine</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Consolidated weekly schedule and analysis</p>
                    </div>
                </div>
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-gray-200 dark:shadow-none active:scale-95"
                >
                    <Download size={20} /> Download PDF
                </button>
            </div>

            {/* Active Weekly Schedule */}
            <div className="space-y-12 pt-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-4">
                        <Printer className="text-[#FF5C35]" size={36} />
                        Active Weekly Schedule
                    </h3>
                </div>

                {["1st", "2nd"].filter(shift => {
                    const currentSlots = TIME_SLOTS[shift];
                    return DAYS.some(day =>
                        currentSlots.some((_, i) => getTeacherSlotData(day, i, currentSlots) !== null)
                    );
                }).map(shift => {
                    const currentSlots = TIME_SLOTS[shift];
                    return (
                        <div key={shift} className="bg-white dark:bg-[#1E293B] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden group">
                            <div className="bg-[#FF5C35] px-10 py-6 flex items-center justify-between">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                                    <Clock size={24} className="text-white/80" />
                                    {shift} Shift Timetable
                                </h3>
                                <div className="bg-white/20 text-white text-[10px] font-black px-6 py-2 rounded-full backdrop-blur-xl border border-white/30 uppercase tracking-tighter">
                                    Official Weekly View
                                </div>
                            </div>

                            <div className="overflow-x-auto p-0 scrollbar-hide">
                                <table className="w-full border-collapse min-w-[1200px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-gray-900/40">
                                            <th className="border-b border-r border-gray-100 dark:border-gray-800 px-8 py-6 text-left font-black text-[#FF5C35] uppercase text-xs w-[150px]">Standard Day</th>
                                            {currentSlots.map((slot, index) => (
                                                <th key={index} className="border-b border-r border-gray-100 dark:border-gray-800 px-4 py-6 text-center">
                                                    <div className="text-[#FF5C35] font-black text-sm mb-1">{index + 1} Period</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter whitespace-nowrap">{slot.label.replace(' - ', '-')}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DAYS.map((day, dayIdx) => (
                                            <tr key={day} className={`group/row ${dayIdx % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-900/10' : ''}`}>
                                                <td className="border-r border-b border-gray-100 dark:border-gray-800 px-8 py-10 font-black text-gray-900 dark:text-gray-300 text-sm bg-gray-50/50 dark:bg-gray-900/20 group-hover/row:bg-[#FF5C35]/5 transition-colors">
                                                    {day}
                                                </td>
                                                {currentSlots.map((slot, slotIndex) => {
                                                    const slotData = getTeacherSlotData(day, slotIndex, currentSlots);

                                                    const isSkipped = () => {
                                                        for (let i = 0; i < slotIndex; i++) {
                                                            const prevData = getTeacherSlotData(day, i, currentSlots);
                                                            if (prevData) {
                                                                const maxSpan = Math.max(...prevData.map(d => d.colSpan));
                                                                if ((i + maxSpan) > slotIndex) return true;
                                                            }
                                                        }
                                                        return false;
                                                    };

                                                    if (isSkipped()) return null;

                                                    if (slotData && slotData.length > 0) {
                                                        const maxSpan = Math.max(...slotData.map(d => d.colSpan));
                                                        return (
                                                            <td
                                                                key={slotIndex}
                                                                colSpan={maxSpan}
                                                                className="border-r border-b border-gray-100 dark:border-gray-800 p-4 text-center transition-all bg-[#FF5C35]/5 hover:bg-[#FF5C35]/10"
                                                            >
                                                                <div className="space-y-6">
                                                                    {slotData.map((d, i) => (
                                                                        <div key={i} className={`space-y-2.5 ${i > 0 ? 'pt-6 border-t border-dashed border-[#FF5C35]/20' : ''}`}>
                                                                            <div className="bg-[#FF5C35]/10 text-[#FF5C35] text-[10px] font-black uppercase tracking-tighter inline-block px-3 py-1 rounded-lg border border-[#FF5C35]/20">
                                                                                {d.header}
                                                                            </div>
                                                                            <div className="font-extrabold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight px-2 group-hover:text-[#FF5C35] transition-colors">
                                                                                {d.subject}
                                                                            </div>
                                                                            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase">
                                                                                <MapPin size={12} strokeWidth={3} className="text-[#FF5C35]" />
                                                                                Room: {d.room}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        );
                                                    }

                                                    return (
                                                        <td key={slotIndex} className="border-r border-b border-gray-100 dark:border-gray-800 p-4 text-center opacity-20">
                                                            <span className="text-gray-300 dark:text-gray-700 font-black text-xs tracking-[0.5em]">---</span>
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
        </div>
    );
}
