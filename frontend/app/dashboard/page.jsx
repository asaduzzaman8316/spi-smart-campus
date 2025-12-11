"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from "@/components/ProtectedRoute";
import RoutineBuilder from "./RoutineBuilder";
import RoutineViewer from "./RoutineViewer";
import TeacherManager from "./TeacherManager";
import SubjectManager from "./SubjectManager";
import RoomManager from "./RoomManager";
import TeacherAccountManager from "./TeacherAccountManager";
import TeacherRoutine from "./TeacherRoutine";
import TeacherToday from "./TeacherToday";
import TeacherProfile from "./TeacherProfile";
import AdminProfile from "./AdminProfile";
import AdminManager from "./AdminManager";
import Sidebar from './Sidebar';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Users,
    FileText,
    Clock,
    BookOpen,
    Building,
    List,
    User,
    Menu
} from 'lucide-react';

const DashboardCard = ({ icon: Icon, label, description, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className="group relative overflow-hidden bg-card-bg p-6 rounded-[2.5rem] border border-border-color hover:border-brand-mid transition-all duration-300 text-left hover:shadow-xl hover:shadow-brand-mid/10 hover:-translate-y-1"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 rotate-12 scale-150`}>
            <Icon size={120} className="text-brand-mid" />
        </div>

        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-lg ${colorClass}`}>
            <Icon size={28} className="text-white" />
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand-mid transition-colors">{label}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>

        <div className="mt-6 flex items-center text-sm font-medium text-brand-mid opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span>Access Module</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        </div>
    </button>
);

export default function DashboardPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('overview');
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();

    const userRole = authUser?.userType;
    const [editingRoutine, setEditingRoutine] = useState(null);

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/login');
        }
    }, [authUser, authLoading, router]);

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* Welcome Header */}
                        <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12">
                            <div className="absolute inset-0 bg-linear-to-r from-brand-start via-brand-mid to-brand-end opacity-90"></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black opacity-10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 text-white">
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                                    Welcome Back, {userRole === 'admin' ? 'Admin' : 'Teacher'}
                                </h1>
                                <p className="text-lg text-white/90 max-w-2xl font-light leading-relaxed">
                                    Here&apos;s your command center for managing the academic schedule. Overview your metrics and manage resources efficiently.
                                </p>
                            </div>
                        </div>

                        {/* Quick Access Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(userRole === 'admin' || userRole === 'super_admin') && (
                                <>
                                    <DashboardCard
                                        icon={Calendar}
                                        label="Routine Create"
                                        description="Create, edit, and manage class schedules with the intelligent builder."
                                        onClick={() => setActiveView('routine-builder')}
                                        colorClass="bg-linear-to-br from-brand-start to-brand-mid shadow-brand-start/40"
                                    />
                                    <DashboardCard
                                        icon={List}
                                        label="Show Routines"
                                        description="View and manage existing class schedules."
                                        onClick={() => setActiveView('show')}
                                        colorClass="bg-linear-to-br from-brand-start to-brand-mid shadow-brand-start/40"
                                    />
                                </>
                            )}
                            {(userRole === 'admin' || userRole === 'super_admin') && (
                                <DashboardCard
                                    icon={Users}
                                    label="Teacher Management"
                                    description="Manage faculty members, view profiles, and assign responsibilities."
                                    onClick={() => setActiveView('teachers')}
                                    colorClass="bg-linear-to-br from-brand-mid to-brand-end shadow-brand-mid/40"
                                />
                            )}
                            {(userRole === 'admin' || userRole === 'super_admin') && (
                                <DashboardCard
                                    icon={FileText}
                                    label="Department Reports"
                                    description="Generate comprehensive reports and view academic insights."
                                    onClick={() => setActiveView('overview')} // Placeholder for now
                                    colorClass="bg-linear-to-br from-brand-end to-brand-start shadow-brand-end/40"
                                />
                            )}
                            {(userRole === 'admin' || userRole === 'super_admin') && (
                                <>
                                    <DashboardCard
                                        icon={BookOpen}
                                        label="Manage Subjects"
                                        description="Add and edit subjects for your department."
                                        onClick={() => setActiveView('subjects')}
                                        colorClass="bg-linear-to-br from-brand-start to-brand-mid shadow-brand-start/40"
                                    />
                                    <DashboardCard
                                        icon={Building}
                                        label="Manage Rooms"
                                        description="Configure classrooms and labs."
                                        onClick={() => setActiveView('rooms')}
                                        colorClass="bg-linear-to-br from-brand-mid to-brand-end shadow-brand-mid/40"
                                    />
                                    <DashboardCard
                                        icon={Users}
                                        label="Teacher Accounts"
                                        description="Create and manage teacher login accounts."
                                        onClick={() => setActiveView('accounts')}
                                        colorClass="bg-linear-to-br from-brand-end to-brand-start shadow-brand-end/40"
                                    />
                                </>
                            )}
                            {(userRole === 'teacher' || userRole === 'admin' || userRole === 'super_admin') && (
                                <>
                                    <DashboardCard
                                        icon={List}
                                        label="My Routine"
                                        description="View your personal teaching schedule."
                                        onClick={() => setActiveView('my-routine')}
                                        colorClass="bg-linear-to-br from-brand-start to-brand-mid shadow-brand-start/40"
                                    />
                                    <DashboardCard
                                        icon={Clock}
                                        label="Today's Schedule"
                                        description="Quick view of today's classes."
                                        onClick={() => setActiveView('today-routine')}
                                        colorClass="bg-linear-to-br from-brand-mid to-brand-end shadow-brand-mid/40"
                                    />
                                    <DashboardCard
                                        icon={User}
                                        label="Profile"
                                        description="View and edit your profile information."
                                        onClick={() => setActiveView('profile')}
                                        colorClass="bg-linear-to-br from-brand-end to-brand-start shadow-brand-end/40"
                                    />

                                </>
                            )}
                        </div>

                        {/* Recent Activity / Stats Placeholder */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-card-bg p-6 rounded-[2.5rem] border border-border-color shadow-sm">
                                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-brand-mid" />
                                    System Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-text-secondary">Server Status</span>
                                        </div>
                                        <span className="text-green-500 font-medium bg-green-500/10 px-3 py-1 rounded-full text-sm">Operational</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-brand-mid"></div>
                                            <span className="text-text-secondary">Last Sync</span>
                                        </div>
                                        <span className="text-foreground font-medium">Just now</span>
                                    </div>
                                </div>
                            </div>



                            <div className="bg-linear-to-br from-brand-start/5 to-brand-mid/5 p-6 rounded-[2.5rem] border border-brand-mid/20 flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                                    <BookOpen size={32} className="text-brand-mid" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Need Help?</h3>
                                <p className="text-text-secondary mb-4 max-w-xs">
                                    Check the documentation for guides on how to use the routine builder.
                                </p>
                                <button className="text-brand-mid font-medium hover:underline">
                                    View Documentation
                                </button>
                            </div>
                        </div>
                    </div >
                );


            case 'routine-builder':
                return <RoutineBuilder initialData={editingRoutine} onBack={() => {
                    setEditingRoutine(null);
                    setActiveView('overview');
                }} />;
            case 'show':
                return <RoutineViewer
                    onBack={() => setActiveView('overview')}
                    onEdit={(routine) => {
                        setEditingRoutine(routine);
                        setActiveView('routine-builder');
                    }}
                />;
            case 'teachers':
                return <TeacherManager onBack={() => setActiveView('overview')} />;
            case 'subjects':
                return <SubjectManager onBack={() => setActiveView('overview')} />;
            case 'rooms':
                return <RoomManager onBack={() => setActiveView('overview')} />;
            case 'accounts':
                return <TeacherAccountManager onBack={() => setActiveView('overview')} />;
            case 'my-routine':
                return <TeacherRoutine onBack={() => setActiveView('overview')} />;
            case 'today-routine':
                return <TeacherToday onBack={() => setActiveView('overview')} />;
            case 'profile':
                if (authUser?.userType === 'super_admin') return <AdminProfile onBack={() => setActiveView('overview')} />;
                return <TeacherProfile onBack={() => setActiveView('overview')} />;
            case 'admins':
                return <AdminManager onBack={() => setActiveView('overview')} />;
            default:
                return <div>Select a view</div>;
        }
    };


    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-mid/30">
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    userRole={userRole}
                />

                <main
                    className={`transition-all duration-300 ease-in-out min-h-screen
                    ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
                `}
                >
                    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-[1600px] mx-auto">
                        {renderContent()}
                    </div>

                    {/* Floating Mobile Menu Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-linear-to-br from-brand-start to-brand-mid text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 border-2 border-white/20"
                        aria-label="Toggle Menu"
                    >
                        <Menu size={24} />
                    </button>
                </main>
            </div>
        </ProtectedRoute>
    );
}