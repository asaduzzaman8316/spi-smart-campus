import React, { useMemo } from 'react';
import { Clock, BookOpen, User, MapPin } from 'lucide-react';
import { DAYS } from './constants';

const RoutinePreview = ({ routine }) => {
    const timeSlots = useMemo(() => {
        if (routine.shift === "1st") {
            return [
                { label: "08:00 - 08:45", start: "08:00", end: "08:45" },
                { label: "08:45 - 09:30", start: "08:45", end: "09:30" },
                { label: "09:30 - 10:15", start: "09:30", end: "10:15" },
                { label: "10:15 - 11:00", start: "10:15", end: "11:00" },
                { label: "11:00 - 11:45", start: "11:00", end: "11:45" },
                { label: "11:45 - 12:30", start: "11:45", end: "12:30" },
                { label: "12:30 - 01:15", start: "12:30", end: "13:15" },
            ];
        } else if (routine.shift === "2nd") {
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
    }, [routine.shift]);

    const getClassForSlot = (dayName, slotIndex) => {
        const day = routine.days.find(d => d.name === dayName);
        if (!day) return null;

        const slot = timeSlots[slotIndex];
        if (!slot) return null;

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

    const shouldSkipSlot = (dayName, slotIndex) => {
        const day = routine.days.find(d => d.name === dayName);
        if (!day) return false;

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

    return (
        <div className="mt-6 space-y-6">
            {/* Routine Info Header */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
                <h2 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white mb-4">Routine Preview</h2>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white mb-1">
                            {routine.department || 'Not Set'} - Semester {routine.semester || 'N/A'}
                        </h3>
                        <p className="text-[#2C1810]/70 dark:text-gray-400 text-sm">
                            {routine.shift || 'N/A'} Shift • Group {routine.group || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Routine Table - Exact template from /routine page */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg overflow-x-auto">
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
                                                className="border border-gray-200 dark:border-gray-700 px-3 py-3 text-center"
                                            >
                                                {classInfo ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <BookOpen size={14} className="text-[#FF5C35]" />
                                                            <p className="font-semibold text-sm text-[#2C1810] dark:text-white">
                                                                {classInfo.subjectCode || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-[#2C1810]/80 dark:text-gray-300 font-medium">
                                                            {classInfo.subject || 'No Subject'}
                                                        </p>
                                                        <div className="flex items-center justify-center gap-1 mt-1">
                                                            <User size={12} className="text-[#FF5C35]" />
                                                            <p className="text-xs text-[#2C1810]/70 dark:text-gray-400">
                                                                {classInfo.teacher || 'No Teacher'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <MapPin size={12} className="text-[#FF5C35]" />
                                                            <p className="text-xs text-[#FF5C35] font-medium">
                                                                {classInfo.room || 'No Room'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600 text-xs">----</span>
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
        </div>
    );
};

export default RoutinePreview;
