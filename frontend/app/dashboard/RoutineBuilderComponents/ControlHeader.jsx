import React from 'react';
import { ArrowLeft, Sparkles, RefreshCcw, Eye, Edit, Save } from 'lucide-react';

const ControlHeader = ({
    isEditMode,
    onBack,
    onAutoGenerate,
    onRefactorAll,
    isPreviewMode,
    setIsPreviewMode,
    onSave,
    saving
}) => {
    return (
        <div className="flex items-center justify-between mb-8 rounded-md bg-white dark:bg-gray-800 z-30 p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Routine' : 'Create Routine'}
                </h1>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onAutoGenerate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors shadow-sm"
                >
                    <Sparkles size={18} className="mr-2" /> Auto Generate
                </button>
                <button
                    onClick={onRefactorAll}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors shadow-sm"
                >
                    <RefreshCcw size={18} className="mr-2" /> Refactor All
                </button>

                <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="min-w-[120px] bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-md flex items-center justify-center border border-gray-300 dark:border-slate-600 transition-colors"
                >
                    {isPreviewMode ? (
                        <><Edit size={18} className="mr-2" /> Edit Mode</>
                    ) : (
                        <><Eye size={18} className="mr-2" /> Preview</>
                    )}
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="min-w-[120px] bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                    {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Routine</>}
                </button>
            </div>
        </div>
    );
};

export default ControlHeader;
