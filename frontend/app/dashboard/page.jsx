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
import QuizManager from './QuizManager';
import QuestionManager from './QuestionManager';

import AdminProfile from "./AdminProfile";
import AdminManager from "./AdminManager";
import LoadAnalysis from "./LoadAnalysis";
import TeacherLoadViewer from "./TeacherLoadViewer";
import Sidebar from './Sidebar';
import { useRouter } from 'next/navigation';
import NoticeManager from "./NoticeManager";
import DashboardNotice from "./DashboardNotice";
import ComplaintManager from "./ComplaintManager";
import { useSearchParams } from 'next/navigation';
import DepartmentOverview from './DepartmentOverview';
import InstituteOverview from './InstituteOverview';
import TeacherOverview from './TeacherOverview';
import { Menu } from 'lucide-react';
import DownloadManager from './DownloadManager';

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
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/login');
        }
    }, [authUser, authLoading, router]);

    // Handle Deep Linking
    useEffect(() => {
        const view = searchParams.get('view');
        if (view) {
            setActiveView(view);
        }
    }, [searchParams]);

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                if (userRole === 'super_admin') {
                    return <InstituteOverview setActiveView={setActiveView} />;
                }
                if (userRole === 'teacher') {
                    return <TeacherOverview user={authUser} setActiveView={setActiveView} />;
                }
                return <DepartmentOverview user={authUser} setActiveView={setActiveView} />;


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
                return <AdminProfile onBack={() => setActiveView('overview')} />;
            case 'admins':
                return <AdminManager onBack={() => setActiveView('overview')} />;
            case 'load-analysis':
                return <LoadAnalysis />;
            case 'notices':
                if (userRole === 'teacher') return <DashboardNotice />;
                return <NoticeManager />;
            case 'complaints':
                return <ComplaintManager />;
            case 'teacher-load':
                return <TeacherLoadViewer onBack={() => setActiveView('overview')} />;
            case 'quiz-manager':
                return <QuizManager />;
            case 'question-bank':
                return <QuestionManager />;
            case 'downloads':
                return <DownloadManager />;
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