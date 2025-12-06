"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import RoutineBuilder from "./RoutineBuilder";
import RoutineViewer from "./RoutineViewer";
import TeacherManager from "./TeacherManager";
import { PlusCircle, List, LayoutDashboard, Users, Building2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { useSidebar } from '@/context/SidebarContext';

export default function DashboardPage() {
    const [view, setView] = useState('home'); // 'home', 'create', 'show', 'teachers'
    const [editingRoutine, setEditingRoutine] = useState(null);
    const { isCollapsed } = useSidebar();

    const handleEditRoutine = (routine) => {
        setEditingRoutine(routine);
        setView('create');
    };

    const handleBack = () => {
        setView('home');
        setEditingRoutine(null);
    };

    const renderContent = () => {
        switch (view) {
            case 'create':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <RoutineBuilder onBack={handleBack} initialData={editingRoutine} />
                    </div>
                );
            case 'show':
                return <RoutineViewer onBack={() => setView('home')} onEdit={handleEditRoutine} />;
            case 'teachers':
                return <TeacherManager onBack={() => setView('home')} />;
            case 'home':
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                        <DashboardCard
                            title="Create Routine"
                            icon={PlusCircle}
                            color="blue"
                            desc="Build a new class routine from scratch."
                            onClick={() => { setEditingRoutine(null); setView('create'); }}
                        />
                        <DashboardCard
                            title="Show Routines"
                            icon={List}
                            color="purple"
                            desc="View and manage existing routines."
                            onClick={() => setView('show')}
                        />
                        <DashboardCard
                            title="Manage Teachers"
                            icon={Users}
                            color="emerald"
                            desc="Add, edit, and manage teacher information."
                            onClick={() => setView('teachers')}
                        />
                    </div>
                );
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
                <Sidebar currentView={view} setView={setView} />

                <div
                    className={`transition-all duration-300 p-2 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'
                        }`}
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <LayoutDashboard className="text-blue-500" size={32} />
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        </div>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function DashboardCard({ title, icon: Icon, color, desc, onClick }) {
    const colorClasses = {
        blue: 'hover:border-blue-500 text-blue-500 bg-blue-500/10',
        purple: 'hover:border-purple-500 text-purple-500 bg-purple-500/10',
        emerald: 'hover:border-emerald-500 text-emerald-500 bg-emerald-500/10'
    };

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 text-left shadow-lg dark:shadow-none ${colorClasses[color].split(' ')[0]}`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={120} />
            </div>
            <div className="relative z-10">
                <div className={`${colorClasses[color].split(' ').slice(2).join(' ')} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={colorClasses[color].split(' ')[1]} size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
        </button>
    )
}