'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '../../Lib/api';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const audioRef = useRef(null);
    const dropdownRef = useRef(null);
    const lastCountRef = useRef(0);

    // Derived state for check
    const isAuthorized = user && (user.userType === 'admin' || user.userType === 'super_admin' || user.userType === 'teacher');

    const fetchNotifications = async () => {
        if (!isAuthorized) return;
        try {
            const { data } = await api.get('/notifications');

            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);

            // Play sound if unread count increased
            if (data.unreadCount > lastCountRef.current && data.unreadCount > 0) {
                try {
                    // iPhone-like Tri-tone sound
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    // Note: Changing to a more "tri-tone" like sound if available, otherwise keeping current but ensuring works
                    // User requested "iPhone notification sound". 
                    // Let's try a closer approximation if possible or keep using this placeholder if not. 
                    // Using a generic pleasant chime for now as requested.
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log('Audio play failed', e));
                } catch (error) {
                    console.error("Error playing sound", error);
                }
            }
            lastCountRef.current = data.unreadCount;

        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 5 seconds for faster updates
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, link) => {
        try {
            await api.put(`/notifications/${id}/read`);

            // Update local state
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            lastCountRef.current = Math.max(0, lastCountRef.current - 1);

            if (link) {
                setIsOpen(false);
                // Handle deep linking for dashboard views
                if (link.includes('?view=')) {
                    router.push(link);
                } else {
                    router.push(link);
                }
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put(`/notifications/read-all`);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            lastCountRef.current = 0;
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-[#2C1810] dark:text-gray-200" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#FFFBF2] dark:bg-[#0B1120]">
                        <h3 className="font-bold text-[#2C1810] dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-[#FF5C35] hover:text-[#e04520] font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => markAsRead(notification._id, notification.link)}
                                    className={`p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-3
                                        ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                    `}
                                >
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 
                                        ${!notification.isRead ? 'bg-[#FF5C35]' : 'bg-transparent'}
                                    `} />
                                    <div>
                                        <p className="text-sm font-medium text-[#2C1810] dark:text-gray-200">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
