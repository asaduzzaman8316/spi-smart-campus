"use client";
import React, { useState, useEffect } from 'react';
import { fetchRoutines, deleteRoutine } from '../../Lib/api';
import { Trash2, Calendar, Clock, Users, BookOpen, Pencil } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function RoutineViewer({ onBack, onEdit }) {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutinesData = async () => {
            try {
                const data = await fetchRoutines();
                const routinesData = data.map(doc => ({
                    id: doc._id,
                    ...doc
                }));
                setRoutines(routinesData);
            } catch (error) {
                console.error("Error fetching routines:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutinesData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this routine?")) {
            try {
                await deleteRoutine(id);
                setRoutines(prev => prev.filter(r => r.id !== id));
            } catch (error) {
                console.error("Error deleting routine:", error);
                alert("Failed to delete routine");
            }
        }
    };

    if (loading) {
        return <div className="text-center flex justify-center items-center  text-white py-10">
            <div className='size-36'>
                <DotLottieReact
                    src="/loader.lottie"
                    loop
                    autoplay
                />
            </div>
        </div>;
    }

    return (
        <div className="space-y-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Saved Routines</h2>
                <button
                    onClick={onBack}
                    className="text-sm text-slate-300 hover:text-white hover:underline"
                >
                    Back to Dashboard
                </button>
            </div>

            {routines.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-slate-400">No routines found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routines.map(routine => (
                        <div key={routine.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors group relative">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => onEdit(routine)}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-full"
                                    title="Edit Routine"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(routine.id)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full"
                                    title="Delete Routine"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-1">{routine.department}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Sem {routine.semester}</span>
                                    <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">{routine.shift} Shift</span>
                                    <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded">Group {routine.group}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-500" />
                                    <span>{routine.days?.filter(d => d.classes.length > 0).length || 0} Active Days</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen size={16} className="text-slate-500" />
                                    <span>{routine.days?.reduce((acc, day) => acc + day.classes.length, 0) || 0} Total Classes</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500 flex justify-between">
                                <span>Last updated</span>
                                <span>{new Date(routine.lastUpdated).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
