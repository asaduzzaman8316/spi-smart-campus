import React from 'react';
import { Trash2 } from 'lucide-react';

const ClassItem = ({
    cls,
    index,
    updateClass,
    removeClass,
    handleCodeKeyDown,
    subjects,
    teachers,
    filteredTeachers,
    rooms,
    filteredRooms,
    busyTeachers,
    sharedTeachers,
    busyRooms,
    sharedRooms,
    toast
}) => {
    return (
        <div className="group flex flex-col xl:flex-row gap-4 items-start xl:items-center bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md dark:shadow-none">
            {/* Adjusted Grid for Code input */}
            <div className="grid grid-cols-2 md:grid-cols-12 gap-4 w-full">
                <div className="col-span-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Start Time</label>
                    <input
                        type="time"
                        value={cls.startTime || ''}
                        onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                        className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">End Time</label>
                    <input
                        type="time"
                        value={cls.endTime || ''}
                        onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                        className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="col-span-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Sub Code</label>
                    <input
                        type="text"
                        placeholder="Code"
                        value={cls.subjectCode || ''}
                        onChange={(e) => updateClass(cls.id, 'subjectCode', e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(e, cls.id, cls.subjectCode)}
                        className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
                <div className="col-span-2 md:col-span-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Subject</label>
                    <select
                        value={cls.subject || ''}
                        onChange={(e) => updateClass(cls.id, 'subject', e.target.value)}
                        className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option className='text-gray-500' value="">Select Subject</option>
                        {subjects.map((sub, sIndex) => (
                            <option className='text-gray-900 dark:text-white bg-white dark:bg-slate-800' key={sIndex} value={sub.name}>{sub.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Teacher</label>
                    <select
                        value={cls.teacher || ''}
                        onChange={(e) => {
                            const selectedTeacher = e.target.value;
                            if (busyTeachers.has(selectedTeacher) && selectedTeacher !== cls.teacher) {
                                toast.error("This teacher is currently busy in another class.");
                                return;
                            }
                            updateClass(cls.id, 'teacher', selectedTeacher);
                        }}
                        className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option className='text-gray-500' value="">Select Teacher</option>
                        {(() => {
                            const selectedTeacherObj = teachers.find(t => t.name === cls.teacher);
                            let teachersToShow = filteredTeachers;

                            if (selectedTeacherObj && !teachersToShow.find(t => t.id === selectedTeacherObj.id)) {
                                teachersToShow = [...teachersToShow, selectedTeacherObj];
                                teachersToShow.sort((a, b) => a.name.localeCompare(b.name));
                            }

                            return teachersToShow.map((t, tIndex) => {
                                const isBusy = busyTeachers.has(t.name);
                                const isShared = sharedTeachers.has(t.name);
                                let statusClass = "text-gray-900 dark:text-white bg-white dark:bg-slate-800";
                                if (isBusy) statusClass = "text-red-500 font-medium";
                                else if (isShared) statusClass = "text-green-600 font-bold";

                                return (
                                    <option
                                        className={statusClass}
                                        key={tIndex}
                                        value={t.name}
                                        disabled={isBusy && t.name !== cls.teacher}
                                    >
                                        {t.name} {isBusy ? '(Busy)' : ''} {isShared ? '(Shared)' : ''}
                                    </option>
                                );
                            });
                        })()}
                    </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Room</label>
                    <select
                        value={cls.room || ''}
                        onChange={(e) => {
                            const selectedRoom = e.target.value;
                            if (busyRooms.has(selectedRoom) && selectedRoom !== cls.room) {
                                toast.error("This room is currently fully booked.");
                                return;
                            }
                            updateClass(cls.id, 'room', selectedRoom);
                        }}
                        className="w-full text-sm font-medium bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg p-2.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option className='text-gray-500' value="">Room</option>
                        {(() => {
                            const selectedRoomObj = rooms.find(r => (r.number || r.name) === cls.room);
                            let roomsToShow = filteredRooms;

                            if (selectedRoomObj && !roomsToShow.find(r => r.id === selectedRoomObj.id)) {
                                roomsToShow = [...roomsToShow, selectedRoomObj];
                                roomsToShow.sort((a, b) => (a.number || a.name).localeCompare(b.number || b.name));
                            }

                            return roomsToShow.map((r, rIndex) => {
                                const isBusy = busyRooms.has(r.number || r.name);
                                const isShared = sharedRooms.has(r.number || r.name);

                                let statusClass = "text-gray-900 dark:text-white bg-white dark:bg-slate-800";
                                if (isBusy) statusClass = "text-red-500 font-medium";
                                else if (isShared) statusClass = "text-green-600 font-bold";

                                return (
                                    <option
                                        className={statusClass}
                                        key={rIndex}
                                        value={r.number || r.name}
                                        disabled={isBusy && (r.number || r.name) !== cls.room}
                                    >
                                        {r.number || r.name} {r.type ? `(${r.type})` : ''} {r.capacity ? `[Cap: ${r.capacity}]` : ''} {isBusy ? '(Busy)' : ''} {isShared ? '(Shared)' : ''}
                                    </option>
                                );
                            });
                        })()}
                    </select>
                </div>
            </div>
            <button
                onClick={() => removeClass(cls.id)}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/20 xl:self-center self-end"
                title="Remove Class"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

export default ClassItem;
