"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import { fetchDepartments, fetchRoutines, fetchRooms } from '../../Lib/api';
import { Filter, Calendar, Clock, MapPin, User, BookOpen, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SHIFTS = ["1st", "2nd"];
const GROUPS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function RoutineDisplay() {
  const [departments, setDepartments] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const [filteredRoutine, setFilteredRoutine] = useState(null);
  const { preferences, updatePreferences, isLoaded, consent } = usePreferences();

  // Load saved preferences
  useEffect(() => {
    if (isLoaded && consent === 'accepted' && preferences.routineFilters) {
      const { department, semester, shift, group } = preferences.routineFilters;
      if (department) setSelectedDepartment(department);
      if (semester) setSelectedSemester(semester);
      if (shift) setSelectedShift(shift);
      if (group) setSelectedGroup(group);
    }
  }, [isLoaded, consent, preferences]);

  // Save preferences when filters change
  useEffect(() => {
    if (consent === 'accepted' && selectedDepartment && selectedSemester && selectedShift && selectedGroup) {
      updatePreferences({
        routineFilters: {
          department: selectedDepartment,
          semester: selectedSemester,
          shift: selectedShift,
          group: selectedGroup
        }
      });
    }
  }, [selectedDepartment, selectedSemester, selectedShift, selectedGroup, consent]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsData, routinesData, roomsData] = await Promise.all([
          fetchDepartments(),
          fetchRoutines(),
          fetchRooms()
        ]);

        setDepartments(departmentsData.map(d => ({ ...d, id: d._id })));
        setRoutines(routinesData.map(r => ({ ...r, id: r._id })));
        setRooms(Array.isArray(roomsData) ? roomsData : (roomsData.data || []));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter routine based on selected criteria
  useEffect(() => {
    if (selectedDepartment && selectedSemester && selectedShift && selectedGroup) {
      const routine = routines.find(r =>
        r.department === selectedDepartment &&
        r.semester === Number(selectedSemester) &&
        r.shift === selectedShift &&
        r.group === selectedGroup
      );
      setFilteredRoutine(routine || null);
    } else {
      setFilteredRoutine(null);
    }
  }, [selectedDepartment, selectedSemester, selectedShift, selectedGroup, routines]);

  // Dynamic Time Slots based on Shift
  const timeSlots = useMemo(() => {
    if (selectedShift === "1st") {
      return [
        { label: "08:00 - 08:45", start: "08:00", end: "08:45" },
        { label: "08:45 - 09:30", start: "08:45", end: "09:30" },
        { label: "09:30 - 10:15", start: "09:30", end: "10:15" },
        { label: "10:15 - 11:00", start: "10:15", end: "11:00" },
        { label: "11:00 - 11:45", start: "11:00", end: "11:45" },
        { label: "11:45 - 12:30", start: "11:45", end: "12:30" },
        { label: "12:30 - 01:15", start: "12:30", end: "13:15" },
      ];
    } else if (selectedShift === "2nd") {
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
    return [];
  }, [selectedShift]);

  const getClassForSlot = (dayName, slotIndex) => {
    if (!filteredRoutine) return null;

    const day = filteredRoutine.days.find(d => d.name === dayName);
    if (!day) return null;

    const slot = timeSlots[slotIndex];
    if (!slot) return null;

    // Find a class that starts at this slot's start time
    return day.classes.find(cls => cls.startTime === slot.start);
  };

  const getClassSpanInfo = (classInfo, slots) => {
    if (!classInfo || !slots) return { colspan: 1 };
    const startIndex = slots.findIndex(s => s.start === classInfo.startTime);
    if (startIndex === -1) return { colspan: 1 };

    const endIndex = slots.findIndex(s => s.end === classInfo.endTime);
    if (endIndex === -1) return { colspan: 1 };

    return { colspan: endIndex - startIndex + 1 };
  };

  // Check if a slot should be skipped (it's part of a previous class's colspan)
  const shouldSkipSlot = (dayName, slotIndex) => {
    if (!filteredRoutine) return false;

    const day = filteredRoutine.days.find(d => d.name === dayName);
    if (!day) return false;

    // Check if any class before this slot spans into this slot
    for (let i = 0; i < slotIndex; i++) {
      const classInfo = getClassForSlot(dayName, i);
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
    if (!filteredRoutine) return;

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    // Center header text on white background
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("SYLHET POLYTECHNIC INSTITUTE, SYLHET", pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class Routine: ${filteredRoutine.department}`, pageWidth / 2, 23, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Semester: ${filteredRoutine.semester} | Shift: ${filteredRoutine.shift} | Group: ${filteredRoutine.group}`, pageWidth / 2, 30, { align: 'center' });

    // Table Headers with period numbers
    const headers = [
      'Day',
      ...timeSlots.map((slot, i) => `${i + 1}\n${slot.label.replace(' - ', '-')}`)
    ];

    // Table Body
    const body = DAYS.map(dayName => {
      const row = [{ content: dayName, styles: { fontStyle: 'bold' } }];
      const day = filteredRoutine.days.find(d => d.name === dayName);

      for (let i = 0; i < timeSlots.length; i++) {
        if (shouldSkipSlot(dayName, i)) {
          continue;
        }

        const classInfo = getClassForSlot(dayName, i);
        const spanInfo = classInfo ? getClassSpanInfo(classInfo, timeSlots) : null;
        const colspan = spanInfo ? spanInfo.colspan : 1;

        if (classInfo) {
          let roomStr = classInfo.room || '';
          if (roomStr) {
            const room = rooms.find(r => r.number === roomStr || r.name === roomStr);
            if (room && room.type) roomStr += ` (${room.type})`;
          }

          row.push({
            content: `${classInfo.subjectCode}\n\n${classInfo.subject}\n\n[T]${classInfo.teacher || ''}\n\n${roomStr}`,
            colSpan: colspan,
            styles: {
              halign: 'center',
              valign: 'middle',
              fontStyle: 'bold' // Applying bold as requested for subject info
            }
          });
        } else {
          row.push({
            content: '---',
            colSpan: 1,
            styles: { halign: 'center', valign: 'middle', textColor: [100, 100, 100] }
          });
        }
      }
      return row;
    });

    // Generate Table with borders and centered margins
    autoTable(doc, {
      startY: 35,
      head: [headers],
      body: body,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        lineWidth: 0.2, // Border thickness
        lineColor: [0, 0, 0], // Black border
        textColor: [0, 0, 0], // Black text
        valign: 'middle',
        halign: 'center',
        fillColor: [250, 250, 250], // Light gray for odd rows
        minCellHeight: 22 // Reduced row height as requested
      },
      headStyles: {
        fillColor: [250, 250, 250], // Very light gray for head
        textColor: [0, 0, 0], // Black text
        fontStyle: 'bold',
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        minCellHeight: 10 // Smaller height for header row
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' }, // Day column
        1: { cellWidth: 36.4 },
        2: { cellWidth: 36.4 },
        3: { cellWidth: 36.4 },
        4: { cellWidth: 36.4 },
        5: { cellWidth: 36.4 },
        6: { cellWidth: 36.4 },
        7: { cellWidth: 36.4 }
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255] // Maintain white background
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

            if (isTeacher) {
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
      }
    });

    doc.save(`Routine_${filteredRoutine.department}_Sem${filteredRoutine.semester}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className='size-36'>
          <DotLottieReact
            src="/loader1.lottie"
            loop
            autoplay

          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative   bg-background py-8 px-4">
      <div className="container mx-auto pt-18 max-w-7xl">
        {/* Header */}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-2">
            Class Routine
          </h1>
          <p className="text-[#2C1810]/70 dark:text-gray-400 mb-4">View your personalized class schedule</p>
        </div>

        {/* Filters */}
        {/* Filters */}
        <div className="bg-white dark:bg-[#1E293B] rounded-4xl p-6 mb-8 border border-gray-100 dark:border-gray-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-[#FF5C35]" size={20} />
            <h2 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white">Filter Your Routine</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5C35] transition-all"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-gray-500">Select Department</option>
                {[...departments].sort((a, b) => a.name.localeCompare(b.name)).map(dept => (
                  <option key={dept.id} value={dept.name} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5C35] transition-all"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-gray-500">Select Semester</option>
                {SEMESTERS.map(sem => (
                  <option key={sem} value={sem} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Shift</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5C35] transition-all"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-gray-500">Select Shift</option>
                {SHIFTS.map(shift => (
                  <option key={shift} value={shift} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
                    {shift} Shift
                  </option>
                ))}
              </select>
            </div>

            {/* Group Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5C35] transition-all"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-gray-500">Select Group</option>
                {(() => {
                  const isCivil = selectedDepartment?.toLowerCase().includes('civil');
                  if (selectedShift === "1st") {
                    return isCivil ? ["A1", "B1", "C1"] : ["A1", "B1"];
                  }
                  if (selectedShift === "2nd") {
                    return isCivil ? ["A2", "B2", "C2"] : ["A2", "B2"];
                  }
                  return GROUPS;
                })().map(grp => (
                  <option key={grp} value={grp} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
                    Group {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Routine Table */}
        {!filteredRoutine ? (
          <div className="bg-card-bg rounded-2xl p-12 border border-border-color text-center">
            <Calendar className="mx-auto mb-4 text-brand-mid" size={64} />
            <h3 className="text-2xl font-semibold text-foreground mb-2">No Routine Selected</h3>
            <p className="text-text-secondary">Please select all filters to view your routine</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg overflow-x-auto">
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white mb-1">
                  {filteredRoutine.department} - Semester {filteredRoutine.semester}
                </h3>
                <p className="text-[#2C1810]/70 dark:text-gray-400 text-sm">
                  {filteredRoutine.shift} Shift • Group {filteredRoutine.group}
                </p>
              </div>
              <button
                onClick={downloadPDF}
                className="inline-flex items-center gap-2 bg-[#FF5C35] hover:bg-[#e64722] text-white px-6 py-3 rounded-full transition-colors shadow-lg shadow-[#FF5C35]/20 hover:shadow-[#FF5C35]/30"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px] border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-[#FF5C35] text-white">
                    <th className="border border-white/20 px-4 py-3 font-semibold text-left min-w-[120px]">
                      Day
                    </th>
                    {timeSlots.map((slot, index) => (
                      <th key={index} className="border border-white/20 px-3 py-3 font-semibold text-center min-w-[150px]">
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={14} className="text-white" />
                          <span className="text-sm">{slot.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, dayIndex) => (
                    <tr key={day} className={dayIndex % 2 === 0 ? 'bg-white dark:bg-[#1E293B]' : 'bg-[#FFFBF2] dark:bg-[#151e2e]'}>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-semibold text-[#2C1810] dark:text-white">
                        {day}
                      </td>
                      {timeSlots.map((slot, slotIndex) => {
                        if (shouldSkipSlot(day, slotIndex)) {
                          return null;
                        }

                        const classInfo = getClassForSlot(day, slotIndex);
                        const spanInfo = classInfo ? getClassSpanInfo(classInfo, timeSlots) : null;
                        const colspan = spanInfo ? spanInfo.colspan : 1;

                        return (
                          <td
                            key={slotIndex}
                            colSpan={colspan}
                            className="border border-gray-200 dark:border-gray-700 px-3 py-3 text-center transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {classInfo ? (
                              <div className="space-y-1">
                                <div className="font-bold text-[#FF5C35] text-sm">
                                  {classInfo.subjectCode}
                                </div>
                                <div className="text-[#2C1810] dark:text-white text-xs font-medium">
                                  {classInfo.subject}
                                </div>
                                {classInfo.teacher && (
                                  <div className="flex items-center justify-center gap-1 text-[#2C1810]/60 dark:text-gray-400 text-xs">
                                    <User size={10} />
                                    <span>{classInfo.teacher}</span>
                                  </div>
                                )}
                                {classInfo.room && (
                                  <div className="flex items-center justify-center gap-1 text-[#2C1810]/60 dark:text-gray-400 text-xs">
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
                              <span className="text-gray-300 dark:text-gray-600 text-sm italic">----</span>
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
        )}
      </div>
    </div>
  );
}