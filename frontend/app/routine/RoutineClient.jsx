"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { fetchDepartments, fetchRoutines } from '../../Lib/api';
import { Filter, Calendar, Clock, MapPin, User, BookOpen, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
const SHIFTS = ["1st", "2nd"];
const GROUPS = ["A1", "A2", "B1", "B2"];

export default function RoutineDisplay() {
  const [departments, setDepartments] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const [filteredRoutine, setFilteredRoutine] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsData, routinesData] = await Promise.all([
          fetchDepartments(),
          fetchRoutines()
        ]);

        setDepartments(departmentsData.map(d => ({ ...d, id: d._id })));
        setRoutines(routinesData.map(r => ({ ...r, id: r._id })));
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
        { label: "02:00 - 02:45", start: "14:00", end: "14:45" },
        { label: "02:45 - 03:30", start: "14:45", end: "15:30" },
        { label: "03:30 - 04:15", start: "15:30", end: "16:15" },
        { label: "04:15 - 05:00", start: "16:15", end: "17:00" },
        { label: "05:00 - 05:45", start: "17:00", end: "17:45" },
        { label: "05:45 - 06:30", start: "17:45", end: "18:30" },
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

    // Header Background
    doc.setFillColor(88, 28, 135); // Purple-900
    doc.rect(0, 0, 297, 35, 'F'); // Reduced height slightly

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("SPI Smart Campus", 148, 12, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class Routine: ${filteredRoutine.department}`, 148, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Semester: ${filteredRoutine.semester} | Shift: ${filteredRoutine.shift} | Group: ${filteredRoutine.group}`, 148, 28, { align: 'center' });

    // Table Headers
    const headers = [
      'Day',
      ...timeSlots.map(slot => slot.label)
    ];

    // Table Body
    const body = DAYS.map(dayName => {
      const row = [{ content: dayName, styles: { fontStyle: 'bold', fillColor: [237, 233, 254] } }];
      const day = filteredRoutine.days.find(d => d.name === dayName);

      for (let i = 0; i < timeSlots.length; i++) {
        // Check if this slot is covered by a previous merged cell
        if (shouldSkipSlot(dayName, i)) {
          continue; // Skip adding a cell for this slot
        }

        const classInfo = getClassForSlot(dayName, i);
        const spanInfo = classInfo ? getClassSpanInfo(classInfo, timeSlots) : null;
        const colspan = spanInfo ? spanInfo.colspan : 1;

        if (classInfo) {
          row.push({
            content: `${classInfo.subjectCode}\n${classInfo.subject}\n${classInfo.teacher || ''}\n${classInfo.room || ''}`,
            colSpan: colspan,
            styles: { halign: 'center', valign: 'middle' }
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

    // Generate Table
    autoTable(doc, {
      startY: 40,
      head: [headers],
      body: body,
      styles: {
        fontSize: 8, // Reduced font size
        cellPadding: 2, // Reduced padding
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [109, 40, 217], // Purple-700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [245, 243, 255] // Purple-50
      },
      theme: 'grid',
      margin: { top: 40, left: 10, right: 10, bottom: 10 }, // Adjust margins
      tableWidth: 'auto' // Use full width
    });

    doc.save(`Routine_${filteredRoutine.department}_Sem${filteredRoutine.semester}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
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
    <div className="min-h-screen relative   bg-gray-950 py-8 px-4">
      <div className="container mx-auto pt-18 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
            Class Routine
          </h1>
          <p className="text-gray-300 mb-4">View your personalized class schedule</p>
        </div>

        {/* Filters */}
        <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-8 border border-gray-700 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-purple-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Filter Your Routine</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="" className="text-gray-200">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name} className="text-gray-200">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="" className="text-gray-200">Select Semester</option>
                {SEMESTERS.map(sem => (
                  <option key={sem} value={sem} className="text-gray-200">
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Shift</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="" className="text-gray-200">Select Shift</option>
                {SHIFTS.map(shift => (
                  <option key={shift} value={shift} className="text-gray-200">
                    {shift} Shift
                  </option>
                ))}
              </select>
            </div>

            {/* Group Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="" className="text-gray-200">Select Group</option>
                {GROUPS.filter(grp => {
                  if (selectedShift === "1st") return ["A1", "B1"].includes(grp);
                  if (selectedShift === "2nd") return ["A2", "B2"].includes(grp);
                  return true;
                }).map(grp => (
                  <option key={grp} value={grp} className="text-gray-200">
                    Group {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Routine Table */}
        {!filteredRoutine ? (
          <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700 text-center">
            <Calendar className="mx-auto mb-4 text-purple-400" size={64} />
            <h3 className="text-2xl font-semibold text-white mb-2">No Routine Selected</h3>
            <p className="text-gray-300">Please select all filters to view your routine</p>
          </div>
        ) : (
          <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl overflow-x-auto">
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {filteredRoutine.department} - Semester {filteredRoutine.semester}
                </h3>
                <p className="text-gray-300 text-sm">
                  {filteredRoutine.shift} Shift • Group {filteredRoutine.group}
                </p>
              </div>
              <button
                onClick={downloadPDF}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-500/30"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-linear-to-r from-purple-600 via-pink-600 to-red-600">
                    <th className="border border-purple-500 px-4 py-3 text-white font-semibold text-left min-w-[120px]">
                      Day
                    </th>
                    {timeSlots.map((slot, index) => (
                      <th key={index} className="border border-purple-500 px-3 py-3 text-white font-semibold text-center min-w-[150px]">
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={14} />
                          <span className="text-sm">{slot.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, dayIndex) => (
                    <tr key={day} className={dayIndex % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-800/50'}>
                      <td className="border border-gray-700 px-4 py-3 font-semibold text-white">
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
                            className="border border-gray-700 px-3 py-3 text-center transition-all hover:bg-purple-900/30 hover:border-purple-500"
                          >
                            {classInfo ? (
                              <div className="space-y-1">
                                <div className="font-bold text-purple-300 text-sm">
                                  {classInfo.subjectCode}
                                </div>
                                <div className="text-white text-xs font-medium">
                                  {classInfo.subject}
                                </div>
                                {classInfo.teacher && (
                                  <div className="flex items-center justify-center gap-1 text-gray-300 text-xs">
                                    <User size={10} />
                                    <span>{classInfo.teacher}</span>
                                  </div>
                                )}
                                {classInfo.room && (
                                  <div className="flex items-center justify-center gap-1 text-gray-300 text-xs">
                                    <MapPin size={10} />
                                    <span>{classInfo.room}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm italic">----</span>
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