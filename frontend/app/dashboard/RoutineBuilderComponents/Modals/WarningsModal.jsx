import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const WarningsModal = ({ show, onClose, warnings }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-yellow-200 dark:border-yellow-900 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-yellow-100 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                            <AlertTriangle size={24} />
                            Routine Adjustments
                        </h2>
                        <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">Some classes were modified during generation to fit the schedule.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-full transition-colors">
                        <X size={20} className="text-yellow-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {warnings.map((warnBlock, idx) => (
                        <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 border-b border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-gray-300">
                                {warnBlock.routine}
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                {warnBlock.items.map((item, i) => (
                                    <div key={i} className="p-4 bg-white dark:bg-slate-900 flex justify-between items-center group hover:bg-yellow-50/30 dark:hover:bg-yellow-900/5 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {item.subject}
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 border border-gray-200 dark:border-slate-700">LAB</span>
                                            </h4>
                                            <p className="text-sm text-gray-500">{item.teacher}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-semibold mb-1 border border-yellow-200 dark:border-yellow-800">
                                                <AlertTriangle size={10} />
                                                {item.reason}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Reduced from <span className="font-medium text-gray-600 dark:text-gray-300">{item.originalDuration}</span> to <span className="font-medium text-gray-600 dark:text-gray-300">{item.finalDuration}</span> periods
                                            </p>
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
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningsModal;
