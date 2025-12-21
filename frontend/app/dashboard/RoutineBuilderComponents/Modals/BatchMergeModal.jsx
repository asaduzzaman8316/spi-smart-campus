import React from 'react';
import { X, GitMerge, Plus } from 'lucide-react';

const BatchMergeModal = ({
    show,
    onClose,
    batchMergeData,
    batchMergeSearchTerm,
    setBatchMergeSearchTerm,
    technologyOptions,
    handleConfirmBatchMerge
}) => {
    if (!show || !batchMergeData) return null;

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] border border-gray-200 dark:border-slate-700">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <GitMerge size={18} className="text-teal-500" /> Convert to Combined Class
                        </h3>
                        <p className="text-xs text-gray-500">Select a group to merge with.</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-3 bg-gray-50/50 dark:bg-slate-800/50">
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={batchMergeSearchTerm}
                        onChange={(e) => setBatchMergeSearchTerm(e.target.value)}
                        autoFocus
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-2">
                        {technologyOptions
                            .filter(opt =>
                                opt.label.toLowerCase().includes(batchMergeSearchTerm.toLowerCase()) &&
                                opt.id !== batchMergeData.sourceTechId // Exclude self
                            )
                            .map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => handleConfirmBatchMerge(opt.id)}
                                    className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-800 cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                                            {opt.grp}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</span>
                                            <span className="text-xs text-gray-500">{opt.dept}</span>
                                        </div>
                                    </div>
                                    <Plus size={16} className="text-gray-400 group-hover:text-teal-600" />
                                </div>
                            ))
                        }
                        {technologyOptions.filter(opt =>
                            opt.label.toLowerCase().includes(batchMergeSearchTerm.toLowerCase()) &&
                            opt.id !== batchMergeData.sourceTechId
                        ).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No groups found.
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchMergeModal;
