import React from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { SEMESTERS, SHIFTS } from './constants';

const ConfigPanels = ({
    routine,
    handleMetaChange,
    isEditMode,
    departments,
    teacherFilterDept,
    setTeacherFilterDept,
    roomFilterType,
    setRoomFilterType,
    roomFilterLocation,
    setRoomFilterLocation,
    roomFilterDept,
    setRoomFilterDept,
    groupsFiltered
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Configuration Panel */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gray-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <GripVertical size={18} className="text-gray-400" />
                        Routine Configuration
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Department</label>
                        <select
                            name="department"
                            value={routine.department}
                            onChange={handleMetaChange}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            disabled={isEditMode}
                        >
                            <option value="">Select Department</option>
                            {departments.slice(0, 7).map((dept, index) => (
                                <option key={index} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Semester</label>
                        <select
                            name="semester"
                            value={routine.semester}
                            onChange={handleMetaChange}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            disabled={isEditMode}
                        >
                            <option value="">Select Semester</option>
                            {SEMESTERS.map((sem, index) => (
                                <option key={index} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Shift</label>
                        <select
                            name="shift"
                            value={routine.shift}
                            onChange={handleMetaChange}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            disabled={isEditMode}
                        >
                            <option value="">Select Shift</option>
                            {SHIFTS.map((shift, index) => (
                                <option key={index} value={shift}>{shift}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Group</label>
                        <select
                            name="group"
                            value={routine.group}
                            onChange={handleMetaChange}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            disabled={isEditMode}
                        >
                            <option value="">Select Group</option>
                            {groupsFiltered.map((grp, index) => (
                                <option key={index} value={grp}>{grp}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Resources Panel */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gray-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Plus size={18} className="text-gray-400" />
                        Resource Filters
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Teachers by Dept</label>
                        <select
                            value={teacherFilterDept}
                            onChange={(e) => setTeacherFilterDept(e.target.value)}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept, index) => (
                                <option key={index} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Rooms by Type</label>
                        <select
                            value={roomFilterType}
                            onChange={(e) => setRoomFilterType(e.target.value)}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="">All Types</option>
                            <option value="Theory">Theory</option>
                            <option value="Lab">Lab</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Rooms by Location</label>
                        <select
                            value={roomFilterLocation}
                            onChange={(e) => setRoomFilterLocation(e.target.value)}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="">All Locations</option>
                            <option value="Computer Building">Computer Building</option>
                            <option value="Administration Building">Administration Building</option>
                            <option value="New Building">New Building</option>
                            <option value="Old Building">Old Building</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Rooms by Dept</label>
                        <select
                            value={roomFilterDept}
                            onChange={(e) => setRoomFilterDept(e.target.value)}
                            className="w-full outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept, index) => (
                                <option key={index} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigPanels;
