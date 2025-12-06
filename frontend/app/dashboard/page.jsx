"use client";
import React, { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import RoutineBuilder from "./RoutineBuilder";
import RoutineViewer from "./RoutineViewer";
import TeacherManager from "./TeacherManager";
import { PlusCircle, List, LayoutDashboard, Users, Building2 } from 'lucide-react';

export default function DashboardPage() {
    const [view, setView] = useState('home'); // 'home', 'create', 'show', 'teachers', 'departments'
    const [editingRoutine, setEditingRoutine] = useState(null);

    const handleEditRoutine = (routine) => {
        setEditingRoutine(routine);
        setView('create');
    };

    const handleBack = () => {
        setView('home');
        setEditingRoutine(null);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-900 py-8">
                <div className="max-w-7xl lg:px-4 pt-18 mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <LayoutDashboard className="text-blue-500" size={32} />
                        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                    </div>

                    {view === 'home' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                            {/* Create Routine Option */}
                            <button
                                onClick={() => {
                                    setEditingRoutine(null);
                                    setView('create');
                                }}
                                className="group relative overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-2xl p-8 transition-all duration-300 text-left"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <PlusCircle size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-blue-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <PlusCircle className="text-blue-500" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Create Routine</h2>
                                    <p className="text-slate-400">
                                        Build a new class routine from scratch. Set departments, semesters, and schedule classes.
                                    </p>
                                </div>
                            </button>

                            {/* Show Routine Option */}
                            <button
                                onClick={() => setView('show')}
                                className="group relative overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 rounded-2xl p-8 transition-all duration-300 text-left"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <List size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-purple-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <List className="text-purple-500" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Show Routines</h2>
                                    <p className="text-slate-400">
                                        View and manage existing routines. Check schedules for different departments and groups.
                                    </p>
                                </div>
                            </button>

                            {/* Manage Teachers Option */}
                            <button
                                onClick={() => setView('teachers')}
                                className="group relative overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 rounded-2xl p-8 transition-all duration-300 text-left"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-emerald-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Users className="text-emerald-500" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Manage Teachers</h2>
                                    <p className="text-slate-400">
                                        Add, edit, and manage teacher information. Update contact details and departments.
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}

                    {view === 'create' && (
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                            <RoutineBuilder
                                onBack={handleBack}
                                initialData={editingRoutine}
                            />
                        </div>
                    )}

                    {view === 'show' && (
                        <div>
                            <RoutineViewer
                                onBack={() => setView('home')}
                                onEdit={handleEditRoutine}
                            />
                        </div>
                    )}

                    {view === 'teachers' && (
                        <TeacherManager
                            onBack={() => setView('home')}
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}