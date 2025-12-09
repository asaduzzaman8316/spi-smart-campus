"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Briefcase, Hash, Clock, Shield, Edit2, Key, Save, X, Camera, Menu } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { InfoCard } from './InfoCard';
import { updateTeacher } from '../../Lib/api';

export default function TeacherProfile() {
    const { user, login } = useAuth(); // login to update user state if needed
    const { toggleMobileSidebar } = useSidebar();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showHint, setShowHint] = useState(true);

    // Edit Form State
    const [formData, setFormData] = useState({
        phone: user?.phone || '',
        image: user?.image || '',
        shift: user?.shift || ''
    });

    // Password Form State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [loading, setLoading] = useState(false);

    if (!user) return <div className="p-8 text-center text-gray-500">No profile data found.</div>;

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update in MongoDB
            const updatedUser = await updateTeacher(user._id, formData);

            // Update Auth Context user
            // Assuming useAuth exposes a method to update user, or we relying on next fetch.
            // But simple way is to reload or we can just update local state if context supports direct update.
            // For now, toast success.
            // Ideally AuthContext should provide `updateUser`.
            // As a fallback, we can trigger a profile re-fetch or login again with new data?
            // Let's assume we just note success.

            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error("New passwords do not match");
        }

        setLoading(true);
        try {
            // Update password via API
            await updateTeacher(user._id, { password: passwords.new });

            toast.success("Password changed successfully!");
            setIsChangingPassword(false);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Failed to change password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header / Banner */}
            <div className="relative h-48 rounded-3xl overflow-hidden bg-linear-to-r from-purple-600 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Profile Image */}
                <div className="flex  left-1/2 transform -translate-x-1/2 absolute items-center justify-center">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-900 p-0.5 shadow-2xl ">
                            {formData.image ? (
                                <Image src={formData.image}
                                    unoptimized
                                    width={128} height={128} alt={user.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800    rounded-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                    {user.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-600 transition">
                                <Camera className="text-white" size={16} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-16 px-4 md:px-8">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Shield size={14} className="text-green-500" />
                            {user.role === 'teacher' ? 'Faculty Member' : 'Administrator'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!isEditing && !isChangingPassword && (
                            <>
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Key size={16} /> Change Password
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Info Cards Column */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                                <h3 className="font-bold text-lg mb-4">Edit Details</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <InfoCard icon={Mail} label="Email Address" value={user.email} color="bg-blue-500 text-blue-500" />
                                <InfoCard icon={Briefcase} label="Department" value={user.department} color="bg-purple-500 text-purple-500" />
                                <InfoCard icon={Phone} label="Phone Number" value={user.phone} color="bg-green-500 text-green-500" />
                                <InfoCard icon={Hash} label="Employee ID" value={user._id?.slice(-6).toUpperCase()} color="bg-orange-500 text-orange-500" />
                                <InfoCard icon={Clock} label="Shift" value={user.shift || "All Shifts"} color="bg-pink-500 text-pink-500" />
                            </>
                        )}
                    </div>

                    {/* Password Change Column */}
                    {isChangingPassword && (
                        <div className="lg:col-span-1">
                            <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg">Change Password</h3>
                                    <button onClick={() => setIsChangingPassword(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Sidebar Toggle & Hint */}
            <div className="fixed bottom-6 right-6 z-50 md:hidden flex flex-col items-end gap-2">
                {/* Hint Bubble */}
                {showHint && (
                    <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg relative max-w-[200px] animate-bounce">
                        <p className="text-xs font-medium">Click here to access usage options & menu</p>
                        <div className="absolute -bottom-1 right-4 w-3 h-3 bg-blue-600 transform rotate-45"></div>
                        <button
                            onClick={() => setShowHint(false)}
                            className="absolute -top-2 -left-2 bg-white text-blue-600 rounded-full p-0.5 shadow-sm"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

                {/* Toggle Button */}
                <button
                    onClick={() => {
                        setShowHint(false);
                        toggleMobileSidebar();
                    }}
                    className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-95"
                >
                    <Menu size={24} />
                </button>
            </div>
        </div>
    );
}


