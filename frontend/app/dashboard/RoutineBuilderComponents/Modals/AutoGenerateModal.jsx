import React from 'react';
import { X, Sparkles, User, Clock, Trash2, Layers, Plus, GitMerge } from 'lucide-react';
import { DAYS } from '../constants';

const AutoGenerateModal = ({
    show,
    onClose,
    batchShift,
    teacherSearchTerm,
    setTeacherSearchTerm,
    showTeacherDropdown,
    setShowTeacherDropdown,
    teachers,
    addTeacherAssignment,
    assignments,
    removeTeacherAssignment,
    removeBlockedTime,
    addBlockedTime,
    subjects,
    updateAssignmentSubject,
    technologyOptions,
    handleOpenBatchMerge,
    handleOpenTechModal,
    removeSubjectRow,
    addSubjectRow,
    toggleTechnology,
    handleBatchGenerate
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="text-indigo-500" /> Batch Routine Generator <span className='text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200'>{batchShift} Shift</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Distribute teacher load across multiple technologies automatically.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-slate-950/50">
                    {/* Add Teacher Section (Searchable) */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add Teacher Load:</label>
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Search & Select Teacher..."
                                value={teacherSearchTerm}
                                onChange={(e) => { setTeacherSearchTerm(e.target.value); setShowTeacherDropdown(true); }}
                                onFocus={() => setShowTeacherDropdown(true)}
                                className="w-full p-3 pl-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                            />
                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            {showTeacherDropdown && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                                    {teachers.filter(t => t.name.toLowerCase().includes(teacherSearchTerm.toLowerCase())).map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => addTeacherAssignment(t)}
                                            className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-sm font-medium border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                                        >
                                            {t.name} <span className="text-xs text-gray-400 block">{t.department}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assignments List */}
                    <div className="space-y-6">
                        {assignments.map((assignment, idx) => {
                            const totalTheory = assignment.subjects.reduce((sum, s) => sum + (s.theory * s.technologies.length), 0);
                            const totalLab = assignment.subjects.reduce((sum, s) => sum + (s.lab * s.technologies.length), 0);

                            return (
                                <div key={assignment.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center group">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                                <User size={20} className="text-blue-500" />
                                                {assignment.teacherName}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Total Load: <span className="font-bold text-indigo-600">{totalTheory} Theory</span> + <span className="font-bold text-pink-500">{totalLab} Lab</span> = {totalTheory + totalLab} periods
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                {(assignment.blockedTimes || []).map((bt, btIdx) => (
                                                    <span key={btIdx} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                        {bt.day.slice(0, 3)} {bt.start}
                                                        <X size={10} className="cursor-pointer" onClick={() => removeBlockedTime(assignment.id, btIdx)} />
                                                    </span>
                                                ))}
                                                <div className="relative group/blocked">
                                                    <button className="text-xs font-semibold text-gray-500 hover:text-red-500 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                                                        <Clock size={12} /> Block Time
                                                    </button>
                                                    <div className="hidden group-hover/blocked:block absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-50">
                                                        <h4 className="text-xs font-bold mb-2">Add Unavailability</h4>
                                                        <select id={`day-${assignment.id}`} className="w-full text-xs p-1 mb-2 bg-gray-50 dark:bg-slate-900 border rounded">
                                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                        <div className="flex gap-2 mb-2">
                                                            <input type="time" id={`start-${assignment.id}`} className="w-1/2 text-xs p-1 bg-gray-50 dark:bg-slate-900 border rounded" />
                                                            <input type="time" id={`end-${assignment.id}`} className="w-1/2 text-xs p-1 bg-gray-50 dark:bg-slate-900 border rounded" />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const d = document.getElementById(`day-${assignment.id}`).value;
                                                                const s = document.getElementById(`start-${assignment.id}`).value;
                                                                const e = document.getElementById(`end-${assignment.id}`).value;
                                                                if (d && s && e) addBlockedTime(assignment.id, d, s, e);
                                                            }}
                                                            className="w-full bg-red-500 text-white text-xs py-1 rounded"
                                                        >Add Block</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeTeacherAssignment(assignment.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="text-xs uppercase text-gray-400 font-semibold border-b border-gray-100 dark:border-slate-800">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left w-1/5">Subject</th>
                                                        <th className="px-3 py-2 text-left w-2/5">Technologies (Class Groups)</th>
                                                        <th className="px-3 py-2 text-center w-20">Theory/Grp</th>
                                                        <th className="px-3 py-2 text-center w-20">Lab/Grp</th>
                                                        <th className="px-3 py-2 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                    {assignment.subjects.map((sub, sIdx) => {
                                                        const subTotal = (sub.theory + sub.lab) * sub.technologies.length;
                                                        return (
                                                            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                <td className="px-3 py-3 align-top">
                                                                    <div className="relative group/sub">
                                                                        <input
                                                                            type="text"
                                                                            value={sub.subject}
                                                                            onChange={(e) => updateAssignmentSubject(assignment.id, sub.id, 'subject', e.target.value)}
                                                                            placeholder="Search..."
                                                                            className="w-full p-2 bg-gray-50 dark:bg-slate-800 border rounded-lg border-gray-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500"
                                                                        />
                                                                        {sub.subject && !subjects.find(s => s.name === sub.subject) && (
                                                                            <div className="hidden group-hover/sub:block absolute top-full left-0 w-full bg-white dark:bg-slate-800 border rounded shadow-lg z-20 max-h-40 overflow-auto">
                                                                                {subjects.filter(s => s.name.toLowerCase().includes(sub.subject.toLowerCase()) || (s.code && s.code.toString().includes(sub.subject))).map(s => (
                                                                                    <div
                                                                                        key={s.id}
                                                                                        onClick={() => updateAssignmentSubject(assignment.id, sub.id, 'subject', s.name)}
                                                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-xs"
                                                                                    >
                                                                                        {s.name} <span className='text-gray-400'>({s.code})</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-gray-400">Total: {subTotal} periods</div>
                                                                </td>
                                                                <td className="px-3 py-3 align-top">
                                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                                        {sub.technologies.map(techId => {
                                                                            const tech = technologyOptions.find(t => t.id === techId);
                                                                            const mergedWith = sub.mergedGroups?.[techId] || [];
                                                                            return (
                                                                                <span
                                                                                    key={techId}
                                                                                    onDoubleClick={() => handleOpenBatchMerge(assignment.id, sub.id, techId)}
                                                                                    title={mergedWith.length > 0 ? `Merged with: ${mergedWith.length} groups` : "Double-click to merge"}
                                                                                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border cursor-pointer select-none transition-colors ${mergedWith.length > 0 ? 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800' : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'}`}
                                                                                >
                                                                                    {mergedWith.length > 0 && <GitMerge size={12} className="mr-1" />}
                                                                                    {tech?.label}
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); toggleTechnology(assignment.id, sub.id, techId); }}
                                                                                        className="ml-1.5 opacity-60 hover:opacity-100"
                                                                                    >
                                                                                        <X size={12} />
                                                                                    </button>
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleOpenTechModal(assignment.id, sub.id)}
                                                                        className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 w-full justify-center"
                                                                    >
                                                                        <Plus size={12} /> Add Technology / Class Group
                                                                    </button>
                                                                </td>
                                                                <td className="px-3 py-3 align-top">
                                                                    <input
                                                                        type="number" min="0" max="10"
                                                                        value={sub.theory}
                                                                        onChange={(e) => updateAssignmentSubject(assignment.id, sub.id, 'theory', parseInt(e.target.value) || 0)}
                                                                        className="w-full text-center p-2 bg-gray-50 dark:bg-slate-800 border rounded-lg border-gray-200 dark:border-slate-700"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-3 align-top">
                                                                    <input
                                                                        type="number" min="0" max="10"
                                                                        value={sub.lab}
                                                                        onChange={(e) => updateAssignmentSubject(assignment.id, sub.id, 'lab', parseInt(e.target.value) || 0)}
                                                                        className="w-full text-center p-2 bg-gray-50 dark:bg-slate-800 border rounded-lg border-gray-200 dark:border-slate-700"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-3 align-top">
                                                                    <button
                                                                        onClick={() => removeSubjectRow(assignment.id, sub.id)}
                                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                    <tr>
                                                        <td colSpan="5" className="px-3 py-2">
                                                            <button
                                                                onClick={() => addSubjectRow(assignment.id)}
                                                                className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Plus size={16} /> Add Subject
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {assignments.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Layers className="text-indigo-500" size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start Planning Loads</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-6">
                                    Select a teacher above to begin distributing their subject load across the institute.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBatchGenerate}
                        disabled={assignments.length === 0}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={18} /> Generate All Routines
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoGenerateModal;
