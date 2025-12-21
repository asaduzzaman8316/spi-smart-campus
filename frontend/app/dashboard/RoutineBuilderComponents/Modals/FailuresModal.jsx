import React from 'react';
import { X, Sparkles } from 'lucide-react';

const FailuresModal = ({ show, onClose, failures, onManualResolve }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-red-200 dark:border-red-900 overflow-hidden">
                <div className="p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">!</span>
                            Unplaced Classes
                        </h2>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">Some classes could not be assigned a room automatically.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors">
                        <X size={20} className="text-red-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {failures.map((fail, idx) => (
                        <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 border-b border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-gray-300">
                                {fail.routine}
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                {fail.items.map((item, i) => (
                                    <div key={i} className="p-4 bg-white dark:bg-slate-900">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{item.subject}</h4>
                                                <p className="text-sm text-gray-500 mb-2">{item.type} Class • {item.teacher}</p>
                                                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                                    {item.reason}
                                                </span>
                                            </div>

                                            {/* Suggestions (Only Show 'New Slot' Actions) */}
                                            {item.suggestions && item.suggestions.filter(s => s.type === 'New Slot').length > 0 && (
                                                <div className="flex-1 sm:ml-8 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                    <h5 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                                                        <Sparkles size={12} /> Available Options (Click to Assign)
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {item.suggestions.filter(s => s.type === 'New Slot').slice(0, 3).map((sugg, sIdx) => (
                                                            <button
                                                                key={sIdx}
                                                                onClick={() => onManualResolve(fail.routineId, item, sugg)}
                                                                className="w-full text-left flex items-center justify-between p-2 hover:bg-white dark:hover:bg-slate-800 rounded border border-transparent hover:border-blue-200 transition-all group/btn"
                                                            >
                                                                <div>
                                                                    <span className="font-bold text-gray-800 dark:text-white text-sm">{sugg.day}</span>
                                                                    <span className="text-xs text-gray-500 block">{sugg.time} • {sugg.room || 'Any Room'}</span>
                                                                </div>
                                                                <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover/btn:opacity-100 font-semibold text-xs">
                                                                    Select
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {(!item.suggestions || item.suggestions.filter(s => s.type === 'New Slot').length === 0) && (
                                                <div className="text-sm text-gray-400 italic">
                                                    No available slots found. Try manual assignment.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Close & Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FailuresModal;
