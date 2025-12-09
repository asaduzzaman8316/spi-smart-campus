import { Home, PlusCircle, List, Users, Briefcase, BookOpen, Building, User, LogOut } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Sidebar({ currentView, setView }) {
    const { isCollapsed, isMobileOpen, closeMobileSidebar, toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const allMenuItems = [
        { id: 'home', label: 'Overview', icon: Home, roles: ['admin', 'teacher'] },
        { id: 'create', label: 'Create Routine', icon: PlusCircle, roles: ['admin'] },
        { id: 'show', label: 'Show Routines', icon: List, roles: ['admin'] },
        { id: 'my-routine', label: 'My Routine', icon: List, roles: ['teacher'] },
        { id: 'today-routine', label: "Today's Routine", icon: Briefcase, roles: ['teacher'] },
        { id: 'profile', label: 'Profile', icon: User, roles: ['teacher'] },
        { id: 'teachers', label: 'Manage Teachers', icon: Users, roles: ['admin'] },
        { id: 'subjects', label: 'Manage Subjects', icon: BookOpen, roles: ['admin'] },
        { id: 'rooms', label: 'Manage Rooms', icon: Building, roles: ['admin'] },
        { id: 'accounts', label: 'Manage Accounts', icon: Users, roles: ['admin'] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role || 'admin'));

    const handleItemClick = (viewId) => {
        setView(viewId);
        closeMobileSidebar();
    };

    const sidebarClass = isCollapsed ? 'w-20' : 'w-64';

    return (
        <>
            {/* Mobile Sidebar Overlay & Drawer */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobileSidebar}
                    />
                    <aside className="fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
                        <div className="flex flex-col py-4 gap-2 flex-1 overflow-y-auto mt-16">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id)}
                                    className={`flex items-center px-6 py-4 mx-2 rounded-xl transition-colors
                                        ${currentView === item.id
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                                    `}
                                >
                                    <item.icon size={24} className="mr-4" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-6 py-4 rounded-xl transition-colors text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut size={24} className="mr-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
            {/* Desktop Sidebar */}
            <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 hidden md:flex flex-col z-40 ${sidebarClass}`}>
                <div className="flex flex-col py-4 gap-2 flex-1 overflow-y-auto">
                    {/* Toggle Button in Sidebar */}
                    <button
                        onClick={toggleSidebar}
                        className={`flex items-center px-6 py-4 mx-2 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <List size={24} className={isCollapsed ? "mx-auto" : "mr-4"} />
                        {!isCollapsed && <span className="font-medium truncate">Menu</span>}
                    </button>

                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className={`flex items-center px-6 py-4 mx-2 rounded-xl transition-colors
                                ${currentView === item.id
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                            `}
                            title={isCollapsed ? item.label : ''}
                        >
                            <item.icon size={24} className={isCollapsed ? "mx-auto" : "mr-4"} />
                            {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                        </button>
                    ))}
                </div>

                {/* Logout Button */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-6 py-4 rounded-xl transition-colors text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                        title={isCollapsed ? "Logout" : ""}
                    >
                        <LogOut size={24} className={isCollapsed ? "mx-auto" : "mr-4"} />
                        {!isCollapsed && <span className="font-medium truncate">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
