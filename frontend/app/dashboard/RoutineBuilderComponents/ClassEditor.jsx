import React from 'react';
import { Plus } from 'lucide-react';
import ClassItem from './ClassItem';

const ClassEditor = ({
    activeDay,
    routine,
    addClass,
    updateClass,
    removeClass,
    handleCodeKeyDown,
    getTeacherStatus,
    getRoomStatus,
    subjects,
    teachers,
    filteredTeachers,
    rooms,
    filteredRooms,
    toast
}) => {
    const activeDayClasses = routine.days.find(d => d.name === activeDay)?.classes || [];

    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 min-h-[500px] flex flex-col">
            <div className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                    {activeDay} Schedule
                </h2>
                <button
                    onClick={addClass}
                    className="flex items-center text-sm font-medium bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-500/20"
                >
                    <Plus size={16} className="mr-1.5" /> Add New Class
                </button>
            </div>
            <div className="p-6 space-y-4 flex-1">
                {activeDayClasses.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl h-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-800/50">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                            <Plus className="text-gray-400" size={32} />
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 font-medium mb-1">No classes added for {activeDay}</p>
                        <p className="text-gray-400 text-sm mb-4">Get started by adding your first class</p>
                        <button onClick={addClass} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Add First Class</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeDayClasses.map((cls, index) => {
                            const { busy: busyTeachers, shared: sharedTeachers } = getTeacherStatus(activeDay, cls.startTime, cls.endTime, cls.id, cls.subject);
                            const { busy: busyRooms, shared: sharedRooms } = getRoomStatus(activeDay, cls.startTime, cls.endTime, cls.id, cls.subject);
                            return (
                                <ClassItem
                                    key={cls.id}
                                    cls={cls}
                                    index={index}
                                    updateClass={updateClass}
                                    removeClass={removeClass}
                                    handleCodeKeyDown={handleCodeKeyDown}
                                    subjects={subjects}
                                    teachers={teachers}
                                    filteredTeachers={filteredTeachers}
                                    rooms={rooms}
                                    filteredRooms={filteredRooms}
                                    busyTeachers={busyTeachers}
                                    sharedTeachers={sharedTeachers}
                                    busyRooms={busyRooms}
                                    sharedRooms={sharedRooms}
                                    toast={toast}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassEditor;
