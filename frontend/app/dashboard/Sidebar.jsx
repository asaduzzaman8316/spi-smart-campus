'use client';
import { Home, PlusCircle, List, Users, Briefcase, BookOpen } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

export default function Sidebar({ currentView, setView }) {
    const { isCollapsed, isMobileOpen, closeMobileSidebar, toggleSidebar } = useSidebar();

    const menuItems = [
        { id: 'home', label: 'Overview', icon: Home },
        { id: 'create', label: 'Create Routine', icon: PlusCircle },
        { id: 'show', label: 'Show Routines', icon: List },
        { id: 'teachers', label: 'Manage Teachers', icon: Users },
        { id: 'subjects', label: 'Manage Subjects', icon: BookOpen },
    ];

    const handleItemClick = (viewId) => {
        setView(viewId);
        closeMobileSidebar();
    };

    const sidebarClass = isCollapsed ? 'w-20' : 'w-64';

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 hidden md:flex flex-col z-40 ${sidebarClass}`}>
                <div className="flex flex-col py-4 gap-2">
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
            </aside>
        </>
    );
}
