"use client";
import React, { useState, useEffect } from 'react';
import { Download, FileText, Printer, CheckSquare, Square, Clock, MapPin, User, BookOpen, Filter } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { fetchRoutines, fetchTeachers, fetchPaginatedRooms, fetchDepartments } from '../../Lib/api';

const DownloadManager = () => {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'teacher', 'room'

    // Data States
    const [routines, setRoutines] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedShift, setSelectedShift] = useState('');

    // Teacher/Room Selection States
    const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
    const [selectedRoomIds, setSelectedRoomIds] = useState([]);

    // Constants
    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
    const SHIFTS = ["1st", "2nd"];
    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

    // Time Slots for both shifts
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

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [routinesData, teachersData, roomsRes, deptsData] = await Promise.all([
                    fetchRoutines(),
                    fetchTeachers(),
                    fetchPaginatedRooms(1, 1000),
                    fetchDepartments()
                ]);

                setRoutines(routinesData);
                setTeachers(teachersData);
                setRooms(roomsRes.data || roomsRes);
                setDepartments(deptsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data for downloads.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtered Lists
    const filteredTeachers = selectedDept
        ? teachers.filter(t => t.department === selectedDept)
        : teachers;

    const labRooms = rooms.filter(r => r.isLab || r.type === 'Lab');

    // Selection Handlers
    const toggleTeacher = (id) => {
        setSelectedTeacherIds(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const toggleAllTeachers = () => {
        if (selectedTeacherIds.length === filteredTeachers.length) {
            setSelectedTeacherIds([]);
        } else {
            setSelectedTeacherIds(filteredTeachers.map(t => t.id || t._id));
        }
    };

    const toggleRoom = (id) => {
        setSelectedRoomIds(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    const toggleAllRooms = () => {
        if (selectedRoomIds.length === labRooms.length) {
            setSelectedRoomIds([]);
        } else {
            setSelectedRoomIds(labRooms.map(r => r.id || r._id));
        }
    };

    // --- PDF GENERATION LOGIC ---

    const getDeptShortHand = (dept) => {
        const map = {
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
        for (let key in map) {
            if (dept.includes(key)) return map[key];
        }
        return dept.slice(0, 3).toUpperCase();
    };

    const getClassSpanInfo = (classInfo, currentSlots) => {
        if (!classInfo || !currentSlots) return { colSpan: 1 };
        const startIndex = currentSlots.findIndex(s => s.start === classInfo.startTime);
        if (startIndex === -1) return { colSpan: 1 };

        const endIndex = currentSlots.findIndex(s => s.end === classInfo.endTime);
        if (endIndex === -1) return { colSpan: 1 };

        return { colSpan: endIndex - startIndex + 1 };
    };

    const getSlotData = (routineList, day, slotIndex, filterType, filterId, currentSlots) => {
        let matches = [];
        const slot = currentSlots[slotIndex];
        if (!slot) return null;

        routineList.forEach(r => {
            const rDay = r.days.find(d => d.name === day);
            if (!rDay) return;

            rDay.classes.forEach(cls => {
                const isMatch = filterType === 'teacher'
                    ? cls.teacher === filterId
                    : filterType === 'room'
                        ? (cls.room === filterId || (Array.isArray(cls.rooms) && cls.rooms.includes(filterId)))
                        : false;

                if (isMatch && cls.startTime === slot.start) {
                    matches.push({ ...cls, semester: r.semester, department: r.department, group: r.group });
                }
            });
        });

        if (matches.length === 0) return null;

        // Combine logic
        const grouped = {};
        matches.forEach(m => {
            const key = filterType === 'teacher'
                ? `${m.subjectCode || m.subject}-${m.room}`
                : `${m.subjectCode || m.subject}-${m.teacher}`;

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

        const results = Object.values(grouped).map(g => {
            const deptShort = getDeptShortHand(g.department);
            const groupsStr = g.groups.sort().join('/');
            const header = `${g.semester}/${deptShort}/${groupsStr}`;
            const subjectInfo = g.subjectCode || g.subject;
            const extraInfo = filterType === 'teacher' ? g.room : g.teacher;

            return {
                text: `${header}\n${subjectInfo}\n${extraInfo || ''}`,
                colSpan: g.colSpan
            };
        });

        // For simplicity in teacher/room routines where multiple subjects might start in same slot (unlikely for same room/teacher but possible in raw data)
        // We pick the max span and join texts. Most cases will have 1 item.
        return {
            content: results.map(r => r.text).join('\n---\n'),
            colSpan: Math.max(...results.map(r => r.colSpan))
        };
    };

    const generatePDF = (type) => {
        const doc = new jsPDF('l', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const brandColor = [255, 92, 53]; // #FF5C35

        const renderTable = (headerTitle, subHeader, data, slots, fileName) => {
            const pageWidth = doc.internal.pageSize.getWidth();

            // Professional grayscale header (matching RoutineClient)
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text("SYLHET POLYTECHNIC INSTITUTE, SYLHET", pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(headerTitle, pageWidth / 2, 23, { align: 'center' });

            if (subHeader) {
                let subStr = "";
                if (subHeader.left && subHeader.right) subStr = `${subHeader.left} | ${subHeader.right}`;
                else if (subHeader.center) subStr = subHeader.center;

                doc.setFontSize(10);
                doc.text(subStr, pageWidth / 2, 30, { align: 'center' });
            }

            autoTable(doc, {
                startY: 35,
                head: [['Day', ...slots.map((t, i) => `${i + 1}\n${t.label.replace(' - ', '-')}`)]],
                body: data,
                theme: 'grid',
                styles: {
                    fontSize: 7.5,
                    cellPadding: 2,
                    minCellHeight: 14,
                    valign: 'middle',
                    halign: 'center',
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    textColor: [0, 0, 0],
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: 22, halign: 'center' }
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255]
                }
            });
        };

        if (type === 'teacher' && selectedTeacherIds.length > 0) {
            const selectedTeachers = teachers.filter(t => selectedTeacherIds.includes(t.id || t._id));

            selectedTeachers.forEach((teacher, idx) => {
                if (idx > 0) doc.addPage();

                // For teachers, we produce ONE table. If teacher has classes in multiple shifts, 
                // we might need to decide which shift slots to show.
                // Usually teachers stick to one shift or a mix. 
                // Let's default to a merged view or allow user to pick? 
                // Given the instructions, let's show 1st shift as base but filter classes for that teacher.
                // Actually, let's use the shift of the selected routines if possible.
                const currentSlots = TIME_SLOTS["1st"]; // Default for composite view

                const tableBody = DAYS.map(day => {
                    const row = [day];
                    let skipCount = 0;
                    currentSlots.forEach((slot, i) => {
                        if (skipCount > 0) {
                            skipCount--;
                            return;
                        }
                        const slotData = getSlotData(routines, day, i, 'teacher', teacher.name, currentSlots);
                        if (slotData) {
                            row.push({
                                content: slotData.content,
                                colSpan: slotData.colSpan,
                                styles: { fontStyle: 'bold' }
                            });
                            skipCount = slotData.colSpan - 1;
                        } else {
                            row.push({ content: "---", styles: { halign: 'center', valign: 'middle' } });
                        }
                    });
                    return row;
                });

                renderTable(`Department: ${teacher.department}`,
                    { left: `Teacher Name: ${teacher.name}`, right: `Designation: ${teacher.designation || 'Instructor'}` },
                    tableBody, currentSlots);
            });
            doc.save(`Teacher_Routines_${new Date().toLocaleDateString()}.pdf`);
        }
        else if (type === 'room' && selectedRoomIds.length > 0) {
            const selectedRooms = rooms.filter(r => selectedRoomIds.includes(r.id || r._id));

            selectedRooms.forEach((room, idx) => {
                if (idx > 0) doc.addPage();
                const currentSlots = TIME_SLOTS["1st"];

                const tableBody = DAYS.map(day => {
                    const row = [day];
                    let skipCount = 0;
                    currentSlots.forEach((slot, i) => {
                        if (skipCount > 0) {
                            skipCount--;
                            return;
                        }
                        const slotData = getSlotData(routines, day, i, 'room', room.number || room.name, currentSlots);
                        if (slotData) {
                            row.push({
                                content: slotData.content,
                                colSpan: slotData.colSpan,
                                styles: { fontStyle: 'bold' }
                            });
                            skipCount = slotData.colSpan - 1;
                        } else {
                            row.push({ content: "---", styles: { halign: 'center', valign: 'middle' } });
                        }
                    });
                    return row;
                });

                renderTable(`Lab/Shop: ${room.number || room.name}`, null, tableBody, currentSlots);
            });
            doc.save(`Room_Routines_${new Date().toLocaleDateString()}.pdf`);
        }
        else if (type === 'routine') {
            let filteredRoutines = routines;
            if (selectedDept) filteredRoutines = filteredRoutines.filter(r => r.department === selectedDept);
            if (selectedSemester) filteredRoutines = filteredRoutines.filter(r => r.semester == selectedSemester);
            if (selectedShift) filteredRoutines = filteredRoutines.filter(r => r.shift === selectedShift);

            if (filteredRoutines.length === 0) {
                toast.warning("No routines match the filters.");
                return;
            }

            filteredRoutines.forEach((routine, idx) => {
                if (idx > 0) doc.addPage();

                const currentSlots = TIME_SLOTS[routine.shift] || TIME_SLOTS["1st"];

                const tableBody = DAYS.map(dayName => {
                    const row = [dayName];
                    const day = routine.days.find(d => d.name === dayName);
                    let skipCount = 0;

                    currentSlots.forEach((slot, i) => {
                        if (skipCount > 0) {
                            skipCount--;
                            return;
                        }
                        const cls = day?.classes.find(c => c.startTime === slot.start);
                        if (cls) {
                            const spanInfo = getClassSpanInfo(cls, currentSlots);
                            row.push({
                                content: `${cls.subjectCode}\n${cls.subject}\n${cls.teacher}\n${cls.room}`,
                                colSpan: spanInfo.colSpan,
                                styles: { fontStyle: 'bold' }
                            });
                            skipCount = spanInfo.colSpan - 1;
                        } else {
                            row.push({ content: "---", styles: { halign: 'center', valign: 'middle' } });
                        }
                    });
                    return row;
                });

                renderTable(`${routine.department} - ${routine.semester} Semester`,
                    { center: `Shift: ${routine.shift} | Group: ${routine.group}` },
                    tableBody, currentSlots);
            });
            doc.save(`Class_Routines_${new Date().toLocaleDateString()}.pdf`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5C35]"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-linear-to-br from-[#FF5C35] to-[#FF7D5F] rounded-3xl p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Download size={40} className="text-white/90" />
                        Download Center
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl">
                        Generate professional PDF routines with merged time slots for 1st and 2nd shifts.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 scale-150">
                    <Download size={200} />
                </div>
            </div>

            {/* Tabs Interface */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-2 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'Class Routines', icon: FileText },
                    { id: 'teacher', label: 'Teacher Routines', icon: CheckSquare },
                    { id: 'room', label: 'Room/Lab Routines', icon: Square },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-[#FF5C35] text-white shadow-lg shadow-[#FF5C35]/30'
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 transition-all duration-500">

                {activeTab === 'all' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-2">
                            <Filter className="text-[#FF5C35]" size={24} />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Filter Routines</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Department</label>
                                <select
                                    className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[#FF5C35] outline-hidden transition-all font-medium"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Semester</label>
                                <select
                                    className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[#FF5C35] outline-hidden transition-all font-medium"
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                >
                                    <option value="">All Semesters</option>
                                    {SEMESTERS.map(s => <option key={s} value={s}>{s} Semester</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Shift</label>
                                <select
                                    className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[#FF5C35] outline-hidden transition-all font-medium"
                                    value={selectedShift}
                                    onChange={(e) => setSelectedShift(e.target.value)}
                                >
                                    <option value="">All Shifts</option>
                                    {SHIFTS.map(s => <option key={s} value={s}>{s} Shift</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <button
                                onClick={() => generatePDF('routine')}
                                className="bg-[#FF5C35] hover:bg-[#FF7D5F] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-[#FF5C35]/20 hover:scale-105 active:scale-95"
                            >
                                <Printer size={24} /> Download PDF Report
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'teacher' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Select Department</label>
                            <select
                                className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[#FF5C35] outline-hidden transition-all font-medium"
                                value={selectedDept}
                                onChange={(e) => { setSelectedDept(e.target.value); setSelectedTeacherIds([]); }}
                            >
                                <option value="">Select Department to Load Teachers</option>
                                {departments.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>

                        {selectedDept && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Teachers ({filteredTeachers.length})</h3>
                                    <button
                                        onClick={toggleAllTeachers}
                                        className="text-[#FF5C35] font-bold hover:underline"
                                    >
                                        {selectedTeacherIds.length === filteredTeachers.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredTeachers.map((t) => (
                                        <label
                                            key={t.id || t._id}
                                            className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedTeacherIds.includes(t.id || t._id)
                                                ? 'bg-[#FF5C35]/10 border-[#FF5C35] text-[#FF5C35]'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-[#FF5C35]/30'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTeacherIds.includes(t.id || t._id)}
                                                onChange={() => toggleTeacher(t.id || t._id)}
                                                className="hidden"
                                            />
                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedTeacherIds.includes(t.id || t._id) ? 'bg-[#FF5C35] border-[#FF5C35]' : 'border-gray-300'
                                                }`}>
                                                {selectedTeacherIds.includes(t.id || t._id) && <CheckSquare size={16} className="text-white" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{t.name}</p>
                                                <p className="text-xs opacity-70">{t.designation || 'Instructor'}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <button
                                onClick={() => generatePDF('teacher')}
                                disabled={selectedTeacherIds.length === 0}
                                className="bg-[#FF5C35] hover:bg-[#FF7D5F] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-[#FF5C35]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            >
                                <Download size={24} /> Download Selected ({selectedTeacherIds.length})
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'room' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Lab Rooms ({labRooms.length})</h3>
                                <button
                                    onClick={toggleAllRooms}
                                    className="text-[#FF5C35] font-bold hover:underline"
                                >
                                    {selectedRoomIds.length === labRooms.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {labRooms.map(r => (
                                    <label
                                        key={r.id || r._id}
                                        className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedRoomIds.includes(r.id || r._id)
                                            ? 'bg-[#FF5C35]/10 border-[#FF5C35] text-[#FF5C35]'
                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-[#FF5C35]/30'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoomIds.includes(r.id || r._id)}
                                            onChange={() => toggleRoom(r.id || r._id)}
                                            className="hidden"
                                        />
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedRoomIds.includes(r.id || r._id) ? 'bg-[#FF5C35] border-[#FF5C35]' : 'border-gray-300'
                                            }`}>
                                            {selectedRoomIds.includes(r.id || r._id) && <CheckSquare size={16} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{r.number || r.name}</p>
                                            <p className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-1 text-center font-bold">
                                                {getDeptShortHand(r.department || 'GEN')}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <button
                                onClick={() => generatePDF('room')}
                                disabled={selectedRoomIds.length === 0}
                                className="bg-[#FF5C35] hover:bg-[#FF7D5F] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-[#FF5C35]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            >
                                <Download size={24} /> Download Selected ({selectedRoomIds.length})
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadManager;
