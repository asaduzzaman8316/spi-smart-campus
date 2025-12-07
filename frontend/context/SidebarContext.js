'use client';
import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
    const closeMobileSidebar = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, isMobileOpen, toggleMobileSidebar, closeMobileSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
