import React from 'react';
import { RefreshCcw, X } from 'lucide-react';

const RefactorModal = ({ show, onClose, onRefactor, config, setConfig, departments, isRefactoring }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 dark:border-slate-700">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <RefreshCcw size={18} className="text-orange-500" /> Refactor Routine
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Refactoring attempts to resolve 'Unplaced' classes by reshuffling rooms and time slots.
                    </p>

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                            <input
                                type="checkbox"
                                checked={config.reduceLab}
                                onChange={(e) => setConfig(prev => ({ ...prev, reduceLab: e.target.checked }))}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <div>
                                <span className="font-semibold text-gray-900 dark:text-white text-sm block">Reduce Lab Duration</span>
                                <span className="text-xs text-gray-500 block">Reduce 3-period labs to 2 periods to free up space (Department specific).</span>
                            </div>
                        </label>

                        {config.reduceLab && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Target Department</label>
                                <select
                                    value={config.targetDept}
                                    onChange={(e) => setConfig(prev => ({ ...prev, targetDept: e.target.value }))}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-lg text-sm"
                                >
                                    <option value="">Select Department</option>
                                    {[...departments].sort((a, b) => a.name.localeCompare(b.name)).map((dept, index) => (
                                        <option key={index} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onRefactor}
                        disabled={isRefactoring || (config.reduceLab && !config.targetDept)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRefactoring ? (
                            <>
                                <RefreshCcw size={16} className="animate-spin" /> Processing...
                            </>
                        ) : (
                            <>
                                <RefreshCcw size={16} /> Start Refactor
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefactorModal;
