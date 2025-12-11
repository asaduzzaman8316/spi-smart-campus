'use client'
import React, { useState, useEffect } from 'react'
import { fetchDepartments, fetchRoutines, fetchTeachers, fetchRooms } from '../../Lib/api'
import { Filter, Calendar, Clock, MapPin, User, BookOpen, Sun, AlertCircle, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Image from 'next/image'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7]
const SHIFTS = ["1st", "2nd"]
const GROUPS = ["A1", "A2", "B1", "B2"]

export default function TodayRoutine() {
    const [departments, setDepartments] = useState([])
    const [routines, setRoutines] = useState([])
    const [teachers, setTeachers] = useState([])
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDay, setCurrentDay] = useState('')

    // Filter states
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [selectedSemester, setSelectedSemester] = useState('')
    const [selectedShift, setSelectedShift] = useState('')
    const [selectedGroup, setSelectedGroup] = useState('')

    const [todayClasses, setTodayClasses] = useState([])

    useEffect(() => {
        // Get current day
        const today = new Date().getDay()
        const dayName = DAYS[today]
        setCurrentDay(dayName)

        const fetchData = async () => {
            try {
                const [departmentsData, routinesData, teachersData, roomsData] = await Promise.all([
                    fetchDepartments(),
                    fetchRoutines(),
                    fetchTeachers(),
                    fetchRooms()
                ]);

                setDepartments(departmentsData.map(d => ({ ...d, id: d._id })))
                setRoutines(routinesData.map(d => ({ ...d, id: d._id })))
                setTeachers(teachersData.map(d => ({ ...d, id: d._id })))
                setRooms(roomsData)
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Filter and get today's classes
    useEffect(() => {
        if (selectedDepartment && selectedSemester && selectedShift && selectedGroup && currentDay) {
            const routine = routines.find(r =>
                r.department === selectedDepartment &&
                r.semester === Number(selectedSemester) &&
                r.shift === selectedShift &&
                r.group === selectedGroup
            )

            if (routine) {
                const todaySchedule = routine.days.find(d => d.name === currentDay)
                if (todaySchedule && todaySchedule.classes) {
                    // Sort classes by start time
                    const sortedClasses = [...todaySchedule.classes].sort((a, b) => {
                        return a.startTime.localeCompare(b.startTime)
                    })
                    setTodayClasses(sortedClasses)
                } else {
                    setTodayClasses([])
                }
            } else {
                setTodayClasses([])
            }
        } else {
            setTodayClasses([])
        }
    }, [selectedDepartment, selectedSemester, selectedShift, selectedGroup, routines, currentDay])

    const downloadPDF = () => {
        if (todayClasses.length === 0) return

        const doc = new jsPDF()

        // Header Background
        doc.setFillColor(88, 28, 135); // Purple-900
        doc.rect(0, 0, 210, 40, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("CPI Smart Campus", 105, 15, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text(`Today's Schedule: ${currentDay}`, 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`${selectedDepartment} - Semester ${selectedSemester} | ${selectedShift} Shift | Group ${selectedGroup}`, 105, 33, { align: 'center' });
        doc.text(`Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 105, 38, { align: 'center' });

        // Table Columns
        const columns = [
            { header: 'Time', dataKey: 'time' },
            { header: 'Subject', dataKey: 'subject' },
            { header: 'Teacher', dataKey: 'teacher' },
            { header: 'Room', dataKey: 'room' }
        ]

        // Table Rows
        const rows = todayClasses.map(cls => {
            let roomStr = cls.room || '-';
            if (cls.room) {
                const room = rooms.find(r => r.number === cls.room || r.name === cls.room);
                if (room && room.type) {
                    roomStr += `\n(${room.type})`;
                }
            }

            return {
                time: `${cls.startTime} - ${cls.endTime}`,
                subject: `${cls.subjectCode}\n${cls.subject}`,
                teacher: cls.teacher || '-',
                room: roomStr
            }
        })

        // Generate Table
        autoTable(doc, {
            startY: 45,
            head: [columns.map(c => c.header)],
            body: rows.map(r => columns.map(c => r[c.dataKey])),
            styles: {
                fontSize: 10,
                cellPadding: 3,
                overflow: 'linebreak',
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: [200, 200, 200]
            },
            headStyles: {
                fillColor: [109, 40, 217], // Purple-700
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 243, 255] // Purple-50
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 35 }, // Time
                1: { cellWidth: 'auto' }, // Subject
                2: { cellWidth: 40 }, // Teacher
                3: { cellWidth: 25, halign: 'center' } // Room
            },
            theme: 'grid',
        })

        doc.save(`Today_Schedule_${currentDay}.pdf`)
    }

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
        )
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center  mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-brand-start to-brand-mid rounded-2xl mb-4 shadow-lg shadow-brand-start/50">
                        <Sun className="w-8 h-8 text-white " />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent mb-2">
                        Today&apos;s Schedule
                    </h1>
                    <p className="text-text-secondary text-lg mb-4">
                        {currentDay}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-card-bg rounded-2xl p-6 mb-8 border border-border-color shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="text-brand-mid" size={20} />
                        <h2 className="text-xl font-semibold text-foreground">Select Your Class</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Department Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Department</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="" className="text-text-secondary">Select Department</option>
                                {departments.slice(0, 7).map(dept => (
                                    <option key={dept.id} value={dept.name} className="text-foreground">
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Semester Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Semester</label>
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="" className="text-text-secondary">Select Semester</option>
                                {SEMESTERS.map(sem => (
                                    <option key={sem} value={sem} className="text-foreground">
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
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="" className="text-text-secondary">Select Shift</option>
                                {SHIFTS.map(shift => (
                                    <option key={shift} value={shift} className="text-foreground">
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
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="" className="text-text-secondary">Select Group</option>
                                {GROUPS.filter(grp => {
                                    if (selectedShift === "1st") return ["A1", "B1"].includes(grp);
                                    if (selectedShift === "2nd") return ["A2", "B2"].includes(grp);
                                    return true;
                                }).map(grp => (
                                    <option key={grp} value={grp} className="text-foreground">
                                        Group {grp}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Today's Classes Display */}
                {!selectedDepartment || !selectedSemester || !selectedShift || !selectedGroup ? (
                    <div className="bg-card-bg rounded-2xl p-12 border border-border-color text-center">
                        <Calendar className="mx-auto mb-4 text-brand-mid" size={64} />
                        <h3 className="text-2xl font-semibold text-foreground mb-2">Select Your Filters</h3>
                        <p className="text-text-secondary">Please select all filters to view today&apos;s schedule</p>
                    </div>
                ) : todayClasses.length === 0 ? (
                    <div className="bg-card-bg rounded-2xl p-12 border border-border-color text-center">
                        <AlertCircle className="mx-auto mb-4 text-yellow-500" size={64} />
                        <h3 className="text-2xl font-semibold text-foreground mb-2">No Classes Today</h3>
                        <p className="text-text-secondary">
                            There are no scheduled classes for {currentDay}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Class Info Header */}
                        <div className="bg-card-bg rounded-2xl p-6 border border-border-color">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-1">
                                        {selectedDepartment} - Semester {selectedSemester}
                                    </h3>
                                    <p className="text-text-secondary text-sm">
                                        {selectedShift} Shift • Group {selectedGroup}
                                    </p>
                                </div>
                                <button
                                    onClick={downloadPDF}
                                    className="inline-flex items-center gap-2 bg-brand-mid hover:bg-brand-mid/90 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-brand-mid/30"
                                >
                                    <Download size={18} />
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Classes List */}
                        <div className="grid gap-4">
                            {todayClasses.map((classInfo, index) => (
                                <div
                                    key={index}
                                    className="bg-card-bg rounded-2xl p-6 border border-border-color hover:border-brand-mid transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-brand-mid/20"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Time */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-brand-start to-brand-mid rounded-xl">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-foreground">
                                                    {classInfo.startTime}
                                                </div>
                                                <div className="text-sm text-text-secondary">
                                                    to {classInfo.endTime}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subject Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BookOpen className="w-5 h-5 text-brand-mid" />
                                                <h4 className="text-xl font-bold text-foreground">
                                                    {classInfo.subject}
                                                </h4>
                                            </div>
                                            <div className="text-brand-end font-semibold mb-2">
                                                {classInfo.subjectCode}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                {classInfo.teacher && (
                                                    <div className="flex items-center gap-2 text-text-secondary">
                                                        {(() => {
                                                            const teacher = teachers.find(t => t.name === classInfo.teacher);
                                                            return teacher && teacher.image ? (
                                                                <Image
                                                                    src={teacher.image}
                                                                    alt={classInfo.teacher}
                                                                    width={24}
                                                                    height={24}
                                                                    className="w-6 h-6 rounded-full object-cover border border-brand-mid/30"
                                                                />
                                                            ) : (
                                                                <User size={16} className="text-brand-mid" />
                                                            );
                                                        })()}
                                                        <span>{classInfo.teacher}</span>
                                                    </div>
                                                )}
                                                {classInfo.room && (
                                                    <div className="flex items-center gap-2 text-text-secondary">
                                                        <MapPin size={16} className="text-brand-end" />
                                                        <span>
                                                            Room {classInfo.room}
                                                            {(() => {
                                                                const room = rooms.find(r => r.number === classInfo.room || r.name === classInfo.room);
                                                                return room && room.type ? ` (${room.type})` : '';
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Duration Badge */}
                                        <div className="bg-brand-mid/10 border border-brand-mid/20 rounded-lg px-4 py-2 text-center">
                                            <div className="text-sm text-text-secondary">Duration</div>
                                            <div className="text-lg font-bold text-brand-mid">
                                                {(() => {
                                                    const [startHour, startMin] = classInfo.startTime.split(':').map(Number)
                                                    const [endHour, endMin] = classInfo.endTime.split(':').map(Number)
                                                    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                                                    return `${durationMinutes} min`
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-linear-to-r from-brand-start/10 via-brand-mid/10 to-brand-end/10 rounded-2xl p-6 border border-border-color">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-brand-mid" />
                                    <span className="text-foreground font-semibold">
                                        Total Classes Today: {todayClasses.length}
                                    </span>
                                </div>
                                <div className="text-text-secondary text-sm">
                                    {currentDay}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
