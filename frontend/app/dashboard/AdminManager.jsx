'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, Search, Shield } from 'lucide-react';
import { fetchAdmins, unregisterAdmin } from '@/Lib/adminApi';

export default function AdminManager() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, admin: null });

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const response = await fetchAdmins();
            setAdmins(response.data || []);
        } catch (error) {
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (admin) => {
        setDeleteModal({ isOpen: true, admin });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, admin: null });
    };

    const handleUnregister = async () => {
        if (!deleteModal.admin) return;

        try {
            await unregisterAdmin(deleteModal.admin._id);
            toast.success('Admin access removed successfully');
            closeDeleteModal();
            loadAdmins();
        } catch (error) {
            toast.error(error.message || 'Failed to unregister admin');
        }
    };

    const filteredAdmins = admins
        .filter(admin => admin.userType === 'super_admin' || admin.userType === 'admin')
        .filter(admin =>
            admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.department?.toLowerCase().includes(searchQuery.toLowerCase())
        );


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 bg-white dark:bg-card-bg p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h1 className="text-3xl font-bold font-serif text-[#2C1810] dark:text-white mb-2">
                        Admin Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage department administrators
                    </p>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer bg-white dark:bg-card-bg text-gray-900 dark:text-white shadow-sm focus:outline-none focus:border-[#FF5C35]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-card-bg rounded-[2.5rem] shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredAdmins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="shrink-0 h-10 w-10">
                                                        {admin.image ? (
                                                            <Image width={40} height={40} className="h-10 w-10 rounded-full" src={admin.image} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                                                {admin.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {admin.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {admin.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {admin.department || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.userType === 'super_admin'
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}>
                                                    <Shield size={12} />
                                                    {admin.userType === 'super_admin' ? 'Super Admin' : 'Department Admin'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {admin.userType !== 'super_admin' && (
                                                    <button
                                                        onClick={() => openDeleteModal(admin)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Unregister"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-bg rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
                            <Trash2 className="w-8 h-8 cursor-pointer text-red-600 dark:text-red-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                            Unregister Admin?
                        </h3>

                        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to unregister <span className="font-semibold text-gray-900 dark:text-white">{deleteModal.admin?.name}</span>?
                            This will remove their login access but keep their profile data.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 px-6 py-3 text-gray-700 cursor-pointer dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnregister}
                                className="flex-1 cursor-pointer px-6 py-3 text-white bg-red-600 rounded-xl font-medium hover:bg-red-700 transition-colors"
                            >
                                Unregister
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
