import React from 'react';
import { Clock } from 'lucide-react';

const ShiftSelectionModal = ({ show, onClose, onSelect }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700 scale-100 transition-transform">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Shift</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a shift to generate routines for</p>
                </div>
                <div className="p-6 grid gap-4">
                    {["1st", "2nd"].map(shift => (
                        <button
                            key={shift}
                            onClick={() => onSelect(shift)}
                            className="py-4 px-6 rounded-xl border-2 border-gray-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group flex items-center justify-between"
                        >
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{shift} Shift</span>
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 flex items-center justify-center">
                                <Clock size={16} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftSelectionModal;
