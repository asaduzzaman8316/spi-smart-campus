'use client'
import React, { useState, useEffect } from 'react'
import { usePreferences } from '@/context/PreferencesContext'
import { fetchDepartments, fetchRoutines, fetchTeachers, fetchRooms } from '../../Lib/api'
import { Filter, Calendar, Clock, MapPin, User, BookOpen, Sun, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Loader1 from '@/components/Ui/Loader1'

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
    const { preferences, updatePreferences, isLoaded, consent } = usePreferences()

    // Load saved preferences
    useEffect(() => {
        if (isLoaded && consent === 'accepted' && preferences.todayFilters) {
            const { department, semester, shift, group } = preferences.todayFilters
            if (department) setSelectedDepartment(department)
            if (semester) setSelectedSemester(semester)
            if (shift) setSelectedShift(shift)
            if (group) setSelectedGroup(group)
        }
    }, [isLoaded, consent, preferences])

    // Save preferences when filters change
    useEffect(() => {
        if (consent === 'accepted' && selectedDepartment && selectedSemester && selectedShift && selectedGroup) {
            updatePreferences({
                todayFilters: {
                    department: selectedDepartment,
                    semester: selectedSemester,
                    shift: selectedShift,
                    group: selectedGroup
                }
            })
        }
    }, [selectedDepartment, selectedSemester, selectedShift, selectedGroup, consent])

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


    if (loading) {
        return (
            <Loader1 />
        )
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center  mb-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFFBF2] dark:bg-[#0B1120] border border-gray-100 dark:border-gray-800 rounded-full mb-4 shadow-sm">
                            <Sun className="w-8 h-8 text-[#FF5C35]" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-2">
                            Today&apos;s Schedule
                        </h1>
                        <p className="text-[#2C1810]/70 dark:text-gray-400 text-lg mb-4">
                            {currentDay}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-4xl p-6 mb-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="text-[#FF5C35]" size={20} />
                            <h2 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white">Select Your Class</h2>
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
                                    {departments.slice(0, 7).map(dept => (
                                        <option key={dept.id} value={dept.name} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
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
                                    {GROUPS.filter(grp => {
                                        if (selectedShift === "1st") return ["A1", "B1"].includes(grp);
                                        if (selectedShift === "2nd") return ["A2", "B2"].includes(grp);
                                        return true;
                                    }).map(grp => (
                                        <option key={grp} value={grp} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
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
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 border border-gray-100 dark:border-gray-800 text-center">
                            <AlertCircle className="mx-auto mb-4 text-[#FF5C35]" size={64} />
                            <h3 className="text-2xl font-semibold font-serif text-[#2C1810] dark:text-white mb-2">No Classes Today</h3>
                            <p className="text-[#2C1810]/70 dark:text-gray-400">
                                There are no scheduled classes for {currentDay}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Class Info Header */}
                            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white mb-1">
                                            {selectedDepartment} - Semester {selectedSemester}
                                        </h3>
                                        <p className="text-[#2C1810]/70 dark:text-gray-400 text-sm">
                                            {selectedShift} Shift • Group {selectedGroup}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Classes List */}
                            <div className="grid gap-4">
                                {todayClasses.map((classInfo, index) => (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-[#FF5C35] dark:hover:border-[#FF5C35] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF5C35]/10"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            {/* Time */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-12 h-12 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-full border border-gray-100 dark:border-gray-800">
                                                    <Clock className="w-6 h-6 text-[#FF5C35]" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-[#2C1810] dark:text-white">
                                                        {classInfo.startTime}
                                                    </div>
                                                    <div className="text-sm text-[#2C1810]/60 dark:text-gray-400">
                                                        to {classInfo.endTime}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subject Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="w-5 h-5 text-[#FF5C35]" />
                                                    <h4 className="text-xl font-bold text-[#2C1810] dark:text-white">
                                                        {classInfo.subject}
                                                    </h4>
                                                </div>
                                                <div className="text-[#FF5C35] font-semibold mb-2">
                                                    {classInfo.subjectCode}
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {classInfo.teacher && (
                                                        <div className="flex items-center gap-2 text-[#2C1810]/70 dark:text-gray-400">
                                                            {(() => {
                                                                const teacher = teachers.find(t => t.name === classInfo.teacher);
                                                                return teacher && teacher.image ? (
                                                                    <Image
                                                                        src={teacher.image}
                                                                        alt={classInfo.teacher}
                                                                        width={24}
                                                                        height={24}
                                                                        className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                                                    />
                                                                ) : (
                                                                    <User size={16} className="text-[#FF5C35]" />
                                                                );
                                                            })()}
                                                            <span>{classInfo.teacher}</span>
                                                        </div>
                                                    )}
                                                    {classInfo.room && (
                                                        <div className="flex items-center gap-2 text-[#2C1810]/70 dark:text-gray-400">
                                                            <MapPin size={16} className="text-[#FF5C35]" />
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
                                            <div className="bg-[#FFFBF2] dark:bg-[#0B1120] border border-gray-100 dark:border-gray-800 rounded-full px-6 py-2 text-center">
                                                <div className="text-sm text-[#2C1810]/60 dark:text-gray-400">Duration</div>
                                                <div className="text-lg font-bold text-[#FF5C35]">
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
                            <div className="bg-[#FFFBF2] dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-6 h-6 text-[#FF5C35]" />
                                        <span className="text-[#2C1810] dark:text-white font-semibold">
                                            Total Classes Today: {todayClasses.length}
                                        </span>
                                    </div>
                                    <div className="text-[#2C1810]/60 dark:text-gray-400 text-sm">
                                        {currentDay}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
