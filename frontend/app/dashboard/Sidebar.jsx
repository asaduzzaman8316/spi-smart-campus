import { Home, PlusCircle, List, Users, Briefcase, BookOpen, Building, User, LogOut, Shield, ChevronLeft, ChevronRight, Calendar, BarChart3, Bell } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, setIsOpen, activeView, setActiveView, userRole }) {
    const { isMobileOpen, closeMobileSidebar } = useSidebar();
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const allMenuItems = [
        { id: 'overview', label: 'Overview', icon: Home, roles: ['admin', 'teacher', 'super_admin'] },
        { id: 'routine-builder', label: 'Routine Create', icon: Calendar, roles: ['admin', 'super_admin'] },
        { id: 'show', label: 'Show Routines', icon: List, roles: ['admin', 'super_admin'] },
        { id: 'load-analysis', label: 'Load Analysis', icon: BarChart3, roles: ['admin', 'super_admin'] },
        { id: 'notices', label: 'Notice Board', icon: Bell, roles: ['admin', 'super_admin', 'teacher'] },
        { id: 'complaints', label: 'Complaints', icon: Shield, roles: ['admin', 'super_admin'] },
        { id: 'teacher-load', label: 'Teacher Load', icon: BarChart3, roles: ['admin', 'super_admin'] },
        { id: 'teachers', label: 'Teacher Management', icon: Users, roles: ['admin', 'super_admin'] },
        { id: 'subjects', label: 'Manage Subjects', icon: BookOpen, roles: ['admin', 'super_admin'] },
        { id: 'rooms', label: 'Manage Rooms', icon: Building, roles: ['admin', 'super_admin'] },
        { id: 'accounts', label: 'Teacher Accounts', icon: Users, roles: ['admin', 'super_admin'] },
        { id: 'my-routine', label: 'My Routine', icon: List, roles: ['teacher', 'admin', 'super_admin'] },
        { id: 'today-routine', label: "Today's Schedule", icon: Briefcase, roles: ['teacher', 'admin', 'super_admin'] },
        { id: 'profile', label: 'Profile', icon: User, roles: ['teacher', 'admin', 'super_admin'] },
        { id: 'admins', label: 'Manage Admins', icon: Shield, roles: ['super_admin'] },
    ];

    const filteredMenuItems = allMenuItems.filter(item => {
        const effectiveRole = userRole === 'department_admin' ? 'admin' : userRole;
        // Default to teacher if no role found
        return item.roles.includes(effectiveRole || 'teacher');
    });

    const handleMenuClick = (viewId) => {
        setActiveView(viewId);
        if (window.innerWidth < 768) {
            setIsOpen(false);
            // If utilizing the context mobile sidebar, use closeMobileSidebar()
            closeMobileSidebar();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div
                className={`fixed top-0 left-0 h-full bg-card-bg border-r border-border-color z-30 transition-all duration-300 ease-in-out flex flex-col shadow-2xl
                ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
            `}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border-color bg-card-bg/50 backdrop-blur-xl">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${!isOpen && 'md:opacity-0 md:hidden'}`}>
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-start to-brand-mid flex items-center justify-center shadow-lg shadow-brand-start/20">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="font-bold text-lg bg-linear-to-r from-brand-start to-brand-mid bg-clip-text text-transparent">
                            SPI Admin
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
                    <nav className="space-y-2 px-3">
                        {filteredMenuItems.map((item) => {
                            const isActive = activeView === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 cursor-pointer rounded-2xl transition-all duration-300 group relative overflow-hidden
                                    ${isActive
                                            ? 'bg-linear-to-r from-brand-start/10 to-brand-mid/10 text-brand-mid shadow-sm'
                                            : 'text-text-secondary hover:bg-icon-bg hover:text-foreground'
                                        }
                                `}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-mid rounded-r-full" />
                                    )}

                                    <Icon
                                        size={22}
                                        className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-mid' : 'text-text-secondary group-hover:text-brand-mid'}`}
                                    />

                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && 'md:opacity-0 md:w-0 md:hidden'}`}>
                                        {item.label}
                                    </span>

                                    {!isOpen && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200 shadow-xl">
                                            {item.label}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-border-color bg-card-bg/50 backdrop-blur-sm">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                        text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-sm
                    `}
                    >
                        <LogOut size={22} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
                    </button>
                </div>

                {/* Collapse Toggle (Desktop only) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-3 top-20 bg-card-bg border border-border-color rounded-full p-1.5 text-text-secondary hover:text-brand-mid shadow-lg cursor-pointer hidden md:flex items-center justify-center transition-transform hover:scale-110 z-40"
                    title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>
        </>
    );
}
