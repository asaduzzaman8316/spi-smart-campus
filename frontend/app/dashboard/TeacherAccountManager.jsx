"use client";
import React, { useState, useEffect } from 'react';
import { fetchTeachers, deleteTeacher, updateTeacher, unregisterTeacher } from '../../Lib/api';
import { UserPlus, Check, X, Loader2, Search, User, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Image from 'next/image';

import { useAuth } from '../../context/AuthContext';

export default function TeacherAccountManager() {
    const { user } = useAuth(); // Get current user
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [createdAccount, setCreatedAccount] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Teacher to delete
    const [accountType, setAccountType] = useState('teacher');

    useEffect(() => {
        loadTeachers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredTeachers(teachers.filter(t =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.email.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } else {
            setFilteredTeachers(teachers);
        }
    }, [searchQuery, teachers]);

    const loadTeachers = async () => {
        try {
            const data = await fetchTeachers();
            setTeachers(data.map(d => ({ ...d, docId: d._id })));
            setFilteredTeachers(data.map(d => ({ ...d, docId: d._id })));
        } catch (error) {
            console.error("Error loading teachers:", error);
            toast.error("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccountClick = (teacher) => {
        const password = generatePassword(teacher.name);
        setSelectedTeacher(teacher);
        setGeneratedPassword(password);
        setAccountType(teacher.userType || 'teacher');
        setCreatedAccount(null);
        setShowModal(true);
    };

    const handleDeleteTeacher = async (teacher) => {
        try {
            if (teacher.hasAccount) {
                // Unregister only (remove access)
                await unregisterTeacher(teacher.docId || teacher._id);
                toast.success("Teacher access removed (Unregistered)");
            } else {
                // Permanently delete
                await deleteTeacher(teacher.docId || teacher._id);
                toast.success("Teacher deleted successfully");
            }
            setDeleteConfirm(null);
            loadTeachers();
        } catch (error) {
            console.error("Error deleting teacher:", error);
            toast.error("Failed to delete/unregister teacher");
        }
    };

    const generatePassword = (name) => {
        const cleanName = name.replace(/\s/g, '').toLowerCase().slice(0, 5);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${cleanName}${randomNum}!`;
    };

    const handleConfirmCreate = async () => {
        if (!selectedTeacher || !generatedPassword) return;

        setProcessing(true);
        try {
            const response = await updateTeacher(selectedTeacher.docId || selectedTeacher._id, {
                password: generatedPassword,
                userType: accountType // Send selected account type
            });

            setCreatedAccount({
                email: selectedTeacher.email,
                password: generatedPassword
            });

            if (response?.emailSent) {
                toast.success("Account credentials sent to teacher's email!");
            } else {
                toast.success("Account created! Credentials displayed (email failed).");
            }

            loadTeachers();
        } catch (error) {
            console.error("Error creating account:", error);
            toast.error("Failed to create account.");
        } finally {
            setProcessing(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedTeacher(null);
        setCreatedAccount(null);
    };

    if (loading) return <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className='size-36'>
            <DotLottieReact
                src="/loader1.lottie"
                loop
                autoplay

            />
        </div>
    </div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserPlus className="text-blue-500" size={24} />
                Manage Teacher Accounts
            </h2>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredTeachers.map(teacher => (
                    <div key={teacher.email} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:border-blue-500 border border-transparent transition-all">
                        <div className="flex items-center gap-4">
                            {teacher.image ? (
                                <Image
                                    unoptimized
                                    height={64}
                                    width={64}
                                    src={teacher.image}
                                    alt={teacher.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border-2 border-blue-500">
                                    {teacher.name.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{teacher.name}</h3>
                                    {teacher.hasAccount && (
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 break-all mb-2">{teacher.email}</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">
                                        {teacher.department}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
                                        {teacher.shift} Shift
                                    </span>
                                    {teacher.phone && (
                                        <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded font-medium">
                                            📞 {teacher.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {teacher.hasAccount ? (
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                                    <Check size={12} /> Account Ready
                                </span>
                                <button
                                    onClick={() => handleCreateAccountClick(teacher)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Reset Password"
                                >
                                    <UserPlus size={18} />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(teacher)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Teacher"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCreateAccountClick(teacher)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <UserPlus size={16} /> <p className='hidden md:block'>Create Account</p>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {createdAccount ? 'Account Created' : (selectedTeacher?.hasAccount ? 'Reset Password' : 'Create Teacher Account')}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {createdAccount ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                                        <p className="text-green-800 dark:text-green-200 text-sm mb-2">Account updated! Please share these credentials.</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">Email:</span>
                                                <span className="text-gray-900 dark:text-white font-mono text-sm select-all">{createdAccount.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">Password:</span>
                                                <span className="text-gray-900 dark:text-white font-mono text-sm font-bold select-all bg-white dark:bg-gray-900 px-2 rounded border border-gray-200 dark:border-gray-700">{createdAccount.password}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-red-500 dark:text-red-400 text-center">Important: This password will not be shown again.</p>
                                    <button onClick={closeModal} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Done</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        {selectedTeacher.image ? (
                                            <Image
                                                unoptimized
                                                height={64}
                                                width={64}
                                                src={selectedTeacher.image}
                                                alt={selectedTeacher.name}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-2 border-purple-500">
                                                <User className="text-purple-600 dark:text-purple-400" size={32} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">{selectedTeacher.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{selectedTeacher.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Account Type</label>
                                            <select
                                                value={accountType}
                                                onChange={(e) => setAccountType(e.target.value)}
                                                className="w-full p-3 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                            >
                                                <option value="teacher">Teacher</option>
                                                <option value="admin">Department Admin</option>
                                                {user?.userType === 'super_admin' && (
                                                    <option value="super_admin">Super Admin</option>
                                                )}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Password</label>
                                            <input
                                                type="text"
                                                value={generatedPassword}
                                                onChange={(e) => setGeneratedPassword(e.target.value)}
                                                className="w-full p-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-mono text-center text-lg tracking-wider border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConfirmCreate}
                                        disabled={processing}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {processing ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                                        {processing ? 'Processing...' : (selectedTeacher?.hasAccount ? 'Reset Password' : 'Create Account')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-full border border-red-100 dark:border-transparent">
                                    <Trash2 className="text-red-500" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Delete Teacher
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-slate-300 mb-6">
                                {deleteConfirm.hasAccount ? (
                                    <>
                                        Are you sure you want to unregister <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirm.name}</span>?
                                        <br /><span className="text-sm text-red-500">This will remove their login access but keep their profile data.</span>
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirm.name}</span>?
                                        <br /><span className="text-sm text-red-500">This action cannot be undone and will remove their account and profile.</span>
                                    </>

                                )}

                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg transition-colors font-medium "
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteTeacher(deleteConfirm)}
                                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                >
                                    {deleteConfirm.hasAccount ? 'Unregister' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
