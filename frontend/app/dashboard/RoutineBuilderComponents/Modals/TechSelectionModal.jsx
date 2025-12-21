import React from 'react';
import { X, Check } from 'lucide-react';

const TechSelectionModal = ({
    show,
    onClose,
    activeTechSelection,
    techModalSearchTerm,
    setTechModalSearchTerm,
    technologyOptions,
    handleSelectAllTech,
    handleToggleTechFromModal,
    assignments
}) => {
    if (!show || !activeTechSelection) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] border border-gray-200 dark:border-slate-700">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Class Groups</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-3 bg-gray-50/50 dark:bg-slate-800/50">
                    <input
                        type="text"
                        placeholder="Search technologies (e.g. 'Computer 5th')..."
                        value={techModalSearchTerm}
                        onChange={(e) => setTechModalSearchTerm(e.target.value)}
                        autoFocus
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-gray-500">
                            Showing {technologyOptions.filter(t => t.label.toLowerCase().includes(techModalSearchTerm.toLowerCase())).length} options
                        </span>
                        <button
                            onClick={handleSelectAllTech}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                            Toggle All Visible
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {technologyOptions
                            .filter(opt => opt.label.toLowerCase().includes(techModalSearchTerm.toLowerCase()))
                            .map(opt => {
                                const assignment = assignments.find(a => a.id === activeTechSelection.assignId);
                                const subject = assignment?.subjects.find(s => s.id === activeTechSelection.subId);
                                const isSelected = subject?.technologies.includes(opt.id);

                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleToggleTechFromModal(opt.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{opt.label}</span>
                                        {isSelected && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                                    </div>
                                );
                            })
                        }
                        {technologyOptions.filter(opt => opt.label.toLowerCase().includes(techModalSearchTerm.toLowerCase())).length === 0 && (
                            <div className="col-span-2 text-center py-8 text-gray-500">
                                No class groups found matching "{techModalSearchTerm}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TechSelectionModal;
