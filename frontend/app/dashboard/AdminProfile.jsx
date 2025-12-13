'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, Shield, Edit2, Save, X, Mail, Phone, Briefcase, Clock, Hash, User as UserIcon, Key, BookOpen, BarChart3 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { updateTeacherProfile } from '@/Lib/teacherApi';
import { analyzeLoad } from '@/Lib/api';
import Loader1 from '@/components/Ui/Loader1';

export default function AdminProfile() {
    const { user, logout, checkUser } = useAuth();
    const fileRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        shift: '',
        image: ''
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [loadData, setLoadData] = useState(null);
    const [loadLoading, setLoadLoading] = useState(false);

    useEffect(() => {
        if (user) {
            console.log('User data from AuthContext:', user);
            console.log('User ID:', user._id);
            console.log('User Type:', user.userType);

            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                shift: user.shift || '',
                image: user.image || ''
            });

            // Fetch user's load data (non-blocking, silent on error)
            fetchUserLoad().catch(() => {
                // Silently fail - load section will show empty state
            });
        }
    }, [user]);

    /* ---------------- FETCH USER LOAD ---------------- */
    const fetchUserLoad = async () => {
        if (!user?.name) return;

        setLoadLoading(true);
        try {
            // Fetch ALL routines across all departments and semesters to get teacher's total load
            const result = await analyzeLoad('', '', '');
            if (result.success && result.data) {
                // Filter assignments for current user
                const userAssignments = result.data.assignments.filter(
                    assignment => assignment.teacherName === user.name
                );

                // Calculate totals
                const totalTheory = userAssignments.reduce((sum, a) => sum + a.theoryPeriods, 0);
                const totalLab = userAssignments.reduce((sum, a) => sum + a.practicalPeriods, 0);
                const totalLoad = userAssignments.reduce((sum, a) => sum + a.totalLoad, 0);

                setLoadData({
                    assignments: userAssignments,
                    totalTheory,
                    totalLab,
                    totalLoad
                });
            } else {
                // No data found, set empty state
                setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
            }
        } catch (error) {
            // Silently handle error - set empty state without logging
            setLoadData({ assignments: [], totalTheory: 0, totalLab: 0, totalLoad: 0 });
        } finally {
            setLoadLoading(false);
        }
    };

    /* ---------------- IMAGE UPLOAD (≤100KB) ---------------- */
    const compressImage = async (file) => {
        return await imageCompression(file, {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 512,
            useWebWorker: true,
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            const reader = new FileReader();

            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
                toast.success('Image selected (will be saved when you click Save)');
            };

            reader.readAsDataURL(compressed);
        } catch (err) {
            toast.error('Image processing failed');
        }
    };

    /* ---------------- SAVE PROFILE ---------------- */
    const handleSave = async () => {
        setLoading(true);
        try {
            if (!user?._id) {
                throw new Error('User ID not found');
            }

            const updateData = {
                name: formData.name,
                phone: formData.phone,
                shift: formData.shift,
                image: formData.image
            };

            console.log('Updating profile for user:', user._id, 'with data:', updateData);

            // Try to update via teacher endpoint first (since admins are in Teacher collection)
            try {
                const response = await updateTeacherProfile(user._id, updateData);
                console.log('Update response:', response);
                toast.success('Profile updated successfully');
            } catch (teacherError) {
                console.log('Teacher endpoint failed, trying admin endpoint:', teacherError);

                // If teacher endpoint fails with 404, try admin endpoint
                if (teacherError.response?.status === 404) {
                    const { updateAdminProfile } = await import('@/Lib/adminApi');
                    const response = await updateAdminProfile(updateData);
                    console.log('Admin update response:', response);
                    toast.success('Profile updated successfully');
                } else {
                    throw teacherError;
                }
            }

            setIsEditing(false);

            // Refresh user data from server without full page reload
            await checkUser();
        } catch (err) {
            console.error('Profile update error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Update failed';
            toast.error(`Failed to update profile: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- CHANGE PASSWORD ---------------- */
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwords.new.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            await updateTeacherProfile(user._id, { password: passwords.new });
            toast.success("Password changed successfully! Please login again.");
            setIsChangingPassword(false);
            setPasswords({ current: '', new: '', confirm: '' });
            logout();
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Failed to change password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Loader1 />
        );
    }

    const getRoleBadge = () => {
        if (user.userType === 'super_admin') {
            return { text: 'Super Admin', color: 'text-purple-600 dark:text-purple-400' };
        } else if (user.userType === 'admin') {
            return { text: 'Department Admin', color: 'text-blue-600 dark:text-blue-400' };
        } else {
            return { text: 'Teacher', color: 'text-green-600 dark:text-green-400' };
        }
    };

    const roleBadge = getRoleBadge();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
            <div className="max-w-5xl mx-auto space-y-8 pb-16">
                {/* HEADER */}
                <div className="relative h-36 cursor-pointer rounded-3xl bg-linear-to-r from-[#FF5C35] to-[#ff8a5c] shadow-lg">
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                        <div className="relative group">
                            <div className="w-32 h-32 cursor-pointer rounded-full bg-white p-1 shadow-xl">
                                {formData.image ? (
                                    <Image src={formData.image} alt="profile" width={128} height={128} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold bg-linear-to-br from-purple-500 to-blue-500 text-white">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <>
                                    <input ref={fileRef} hidden type="file" accept="image/*" onChange={handleImageUpload} />
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="absolute bottom-1 right-1 bg-[#FF5C35] p-2 rounded-full hover:scale-110 transition shadow-lg cursor-pointer">
                                        <Camera size={16} className="text-white" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* BASIC INFO */}
                <div className="pt-20 px-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                            <p className={`flex items-center gap-2 text-sm font-semibold mt-1 ${roleBadge.color}`}>
                                <Shield size={14} /> {roleBadge.text}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: user.name || '',
                                                phone: user.phone || '',
                                                shift: user.shift || '',
                                                image: user.image || ''
                                            });
                                        }}
                                        className="flex items-center gap-2 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                                        <X size={16} /> Cancel
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-2 py-2 bg-[#FF5C35] text-white rounded-full shadow hover:scale-105 transition disabled:opacity-50 cursor-pointer">
                                        {loading ? 'Saving...' : <><Save size={16} /> Save</>}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#FF5C35] text-white rounded-full shadow hover:scale-105 transition cursor-pointer">
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InfoCard
                            label="Name"
                            value={isEditing ? (
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            ) : user.name}
                            icon={UserIcon}
                        />
                        <InfoCard label="Email" value={user.email} icon={Mail} />
                        <InfoCard label="Department" value={user.department} icon={Briefcase} />
                        <InfoCard
                            label="Phone"
                            value={isEditing ? (
                                <input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            ) : (user.phone || 'Not set')}
                            icon={Phone}
                        />
                        <InfoCard
                            label="Shift"
                            value={isEditing ? (
                                <select
                                    value={formData.shift}
                                    onChange={e => setFormData({ ...formData, shift: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <option value="">All</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Day">Day</option>
                                    <option value="Evening">Evening</option>
                                </select>
                            ) : (user.shift || 'All')}
                            icon={Clock}
                        />
                        <InfoCard label="ID" value={user._id?.slice(-8)} icon={Hash} />
                    </div>

                    {/* CHANGE PASSWORD SECTION */}
                    <div className="mt-12 bg-white dark:bg-card-bg rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security</h3>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer">
                                    <Key size={16} /> Change Password
                                </button>
                            )}
                        </div>

                        {isChangingPassword && (
                            <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5C35]"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5C35]"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswords({ current: '', new: '', confirm: '' });
                                        }}
                                        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-[#FF5C35] text-white rounded-full hover:bg-[#e04f2c] transition disabled:opacity-50 shadow-lg shadow-[#FF5C35]/20 cursor-pointer">
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* TEACHING LOAD SECTION */}
                    <div className="mt-12 bg-white dark:bg-card-bg rounded-3xl p-6 shadow border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-[#FF5C35]/10 flex items-center justify-center">
                                <BarChart3 className="text-[#FF5C35]" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Teaching Load</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your current semester workload</p>
                            </div>
                        </div>

                        {loadLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5C35]"></div>
                            </div>
                        ) : loadData && loadData.assignments.length > 0 ? (
                            <>
                                {/* Load Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Theory Classes</p>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{loadData.totalTheory}</p>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70">periods/week</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Briefcase size={16} className="text-purple-600 dark:text-purple-400" />
                                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Lab Classes</p>
                                        </div>
                                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{loadData.totalLab}</p>
                                        <p className="text-xs text-purple-600/70 dark:text-purple-400/70">periods/week</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BarChart3 size={16} className="text-orange-600 dark:text-orange-400" />
                                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Total Load</p>
                                        </div>
                                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{loadData.totalLoad}</p>
                                        <p className="text-xs text-orange-600/70 dark:text-orange-400/70">periods/week</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BookOpen size={16} className="text-green-600 dark:text-green-400" />
                                            <p className="text-xs font-medium text-green-600 dark:text-green-400">Subjects</p>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{loadData.assignments.length}</p>
                                        <p className="text-xs text-green-600/70 dark:text-green-400/70">assigned</p>
                                    </div>
                                </div>

                                {/* Subject List */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Subject Breakdown</h4>
                                    {loadData.assignments.map((assignment, index) => (
                                        <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-900 dark:text-white">{assignment.subject}</h5>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {assignment.subjectCode} • {assignment.technology}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 ml-4">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Theory</p>
                                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{assignment.theoryPeriods}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Lab</p>
                                                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{assignment.practicalPeriods}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                                        <p className="text-lg font-bold text-[#FF5C35]">{assignment.totalLoad}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={48} />
                                <p className="text-gray-500 dark:text-gray-400">No teaching assignments found</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your load will appear here once routines are created</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------- INFO CARD ---------------- */
function InfoCard({ label, value, icon: Icon }) {
    return (
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Icon size={14} /> {label}
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{value}</div>
        </div>
    );
}
