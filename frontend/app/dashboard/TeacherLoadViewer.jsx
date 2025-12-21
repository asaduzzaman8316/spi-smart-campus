'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, BookOpen, Briefcase, Users, ChevronLeft, MapPin, Clock, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchTeachers, analyzeLoad, fetchRoutines, fetchRooms } from '@/Lib/api';

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

export default function TeacherLoadViewer({ onBack }) {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [loadData, setLoadData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [teachersLoading, setTeachersLoading] = useState(true);
    const [allRoutines, setAllRoutines] = useState([]);
    const [rooms, setRooms] = useState([]);

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
            return;
        }

        setLoading(true);
        try {
            const result = await analyzeLoad('', '', '');
            if (result.success && result.data) {
                const teacherAssignments = result.data.assignments.filter(
                    assignment => assignment.teacherName === teacherName
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
            } else {
                setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch load data:', error);
            setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
        } finally {
            setLoading(false);
        }
    };

    const getClassSpanInfo = (classInfo, currentSlots) => {
        if (!classInfo || !currentSlots) return { colSpan: 1 };
        const startIndex = currentSlots.findIndex(s => s.start === classInfo.startTime);
        if (startIndex === -1) return { colSpan: 1 };

        const endIndex = currentSlots.findIndex(s => s.end === classInfo.endTime);
        if (endIndex === -1) return { colSpan: 1 };

        return { colSpan: endIndex - startIndex + 1 };
    };

    const getTeacherSlotData = (day, slotIndex, currentSlots) => {
        let matches = [];
        const slot = currentSlots[slotIndex];
        if (!slot) return null;

        allRoutines.forEach(r => {
            const rDay = r.days.find(d => d.name === day);
            if (!rDay) return;

            rDay.classes.forEach(cls => {
                if (cls.teacher === selectedTeacher && cls.startTime === slot.start) {
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 shadow border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                </div>

                {/* Teacher Selection */}
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-300 mb-3 ml-1 uppercase tracking-wider">
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
                            className="w-full max-w-md bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5C35] transition font-medium">
                            <option value="">-- Select a teacher --</option>
                            {[...teachers].sort((a, b) => a.name.localeCompare(b.name)).map((teacher, index) => (
                                <option key={index} value={teacher.name}>
                                    {teacher.name} - {teacher.department}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF5C35]"></div>
                    </div>
                )}

                {!loading && loadData && selectedTeacher && (
                    <>
                        {loadData.assignments.length > 0 ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Theory Classes</p>
                                        </div>
                                        <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">{loadData.totalTheory}</p>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 uppercase font-bold">classes/week</p>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-100 dark:border-purple-900/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase size={20} className="text-purple-600 dark:text-purple-400" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Lab Classes</p>
                                        </div>
                                        <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">{loadData.totalLab}</p>
                                        <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 uppercase font-bold">classes/week</p>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-900/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 size={20} className="text-orange-600 dark:text-orange-400" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Total Load</p>
                                        </div>
                                        <p className="text-4xl font-bold text-orange-700 dark:text-orange-300">{loadData.totalLoad}</p>
                                        <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1 uppercase font-bold">classes/week</p>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Subjects</p>
                                        </div>
                                        <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">{loadData.assignments.length}</p>
                                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1 uppercase font-bold">assigned</p>
                                    </div>
                                </div>

                                {/* Subject Breakdown */}
                                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 ml-2">Subject Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {loadData.assignments.map((assignment, index) => (
                                            <div key={index} className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 hover:border-[#FF5C35]/30 transition-all flex justify-between items-center group">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-[#FF5C35] transition-colors">{assignment.subject}</h5>
                                                    <div className="flex flex-wrap gap-2 mt-2 font-bold text-xs">
                                                        <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700 uppercase">{assignment.subjectCode}</span>
                                                        <span className="bg-[#FF5C35]/10 text-[#FF5C35] px-3 py-1 rounded-full uppercase">{assignment.technology}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                    <div className="text-center w-12">
                                                        <p className="text-[10px] font-bold text-blue-500 uppercase">Thy</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none mt-1">{assignment.theoryCount || 0}</p>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
                                                    <div className="text-center w-12">
                                                        <p className="text-[10px] font-bold text-purple-500 uppercase">Lab</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none mt-1">{assignment.practicalCount || 0}</p>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
                                                    <div className="text-center w-12">
                                                        <p className="text-[10px] font-bold text-[#FF5C35] uppercase">Tot</p>
                                                        <p className="text-lg font-bold text-[#FF5C35] leading-none mt-1">{assignment.totalClasses || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Consolidated Routine Grid */}
                                <div className="space-y-12">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                            <Printer className="text-[#FF5C35]" size={28} />
                                            Active Teaching Schedule
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
                                            <div key={shift} className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                                <div className="bg-[#FF5C35] px-8 py-5 flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                                        <Clock size={20} className="text-white/80" />
                                                        {shift} Shift Routine
                                                    </h3>
                                                    <span className="bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md">
                                                        Weekly View
                                                    </span>
                                                </div>

                                                <div className="overflow-x-auto p-0">
                                                    <table className="w-full border-collapse min-w-[1000px]">
                                                        <thead>
                                                            <tr className="bg-[#FF5C35]/5 dark:bg-[#FF5C35]/10">
                                                                <th className="border-b border-r border-gray-200 dark:border-gray-700 px-6 py-4 text-left font-bold text-[#FF5C35] uppercase text-xs w-[120px]">Day</th>
                                                                {currentSlots.map((slot, index) => (
                                                                    <th key={index} className="border-b border-r border-gray-200 dark:border-gray-700 px-4 py-4 text-center">
                                                                        <div className="text-[#FF5C35] font-black text-sm mb-0.5">{index + 1} Period</div>
                                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter whitespace-nowrap">{slot.label.replace(' - ', '-')}</div>
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {DAYS.map((day, dayIdx) => (
                                                                <tr key={day} className={dayIdx % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-900/10' : ''}>
                                                                    <td className="border-r border-b border-gray-200 dark:border-gray-700 px-6 py-6 font-bold text-gray-700 dark:text-gray-300 text-sm bg-gray-50/50 dark:bg-gray-900/20">
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
                                                                                    className="border-r border-b border-gray-200 dark:border-gray-700 p-3 text-center transition-all bg-[#FF5C35]/5"
                                                                                >
                                                                                    <div className="space-y-4">
                                                                                        {slotData.map((d, i) => (
                                                                                            <div key={i} className={`space-y-1.5 ${i > 0 ? 'pt-4 border-t-2 border-dashed border-[#FF5C35]/20' : ''}`}>
                                                                                                <div className="text-[#FF5C35] text-[11px] font-black uppercase tracking-tighter">
                                                                                                    {d.header}
                                                                                                </div>
                                                                                                <div className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight px-1">
                                                                                                    {d.subject}
                                                                                                </div>
                                                                                                <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase">
                                                                                                    <MapPin size={10} strokeWidth={3} className="text-[#FF5C35]" />
                                                                                                    {d.room}
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </td>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <td key={slotIndex} className="border-r border-b border-gray-200 dark:border-gray-700 p-4 text-center">
                                                                                <span className="text-gray-200 dark:text-gray-800 font-black text-xs tracking-widest">---</span>
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
                            </>
                        ) : (
                            <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-16 shadow-2xl border border-gray-100 dark:border-gray-800 text-center">
                                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BarChart3 className="text-gray-300 dark:text-gray-600" size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Teaching Assignments</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
                                    {selectedTeacher} currently has no active classes assigned in the system.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State - No Teacher Selected */}
                {!loading && !selectedTeacher && (
                    <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-20 shadow-2xl border border-gray-100 dark:border-gray-800 text-center group">
                        <div className="w-28 h-28 bg-[#FF5C35]/5 group-hover:bg-[#FF5C35]/10 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-500 scale-100 group-hover:scale-110">
                            <Users className="text-[#FF5C35]/30 group-hover:text-[#FF5C35] transition-colors" size={56} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Select a Teacher</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg font-medium leading-relaxed">
                            Start by selecting a teacher from the dropdown menu above to analyze their current workload and routine.
                        </p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
