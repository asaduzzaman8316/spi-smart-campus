"use client";
import React, { useState, useEffect } from 'react';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../../Lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Search, X, Building, Grid, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const INITIAL_ROOM = {
    number: '',
    type: 'Theory',
    capacity: ''
};

const ROOM_TYPES = ['Theory', 'Lab'];

export default function RoomManager({ onBack }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentRoom, setCurrentRoom] = useState(INITIAL_ROOM);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);


    const [departments, setDepartments] = useState([]);

    // Filters removed as per request, logic moved to RoutineBuilder

    useEffect(() => {
        const init = async () => {
            const depts = await import('../../Lib/api').then(m => m.fetchDepartments());
            setDepartments(depts);
        }
        init();
    }, []);

    useEffect(() => {
        loadRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, typeFilter]);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const response = await fetchRooms(searchQuery, typeFilter);
            const rawData = Array.isArray(response) ? response : (response.data || []);

            const roomsData = rawData.map(r => ({
                docId: r._id,
                ...r,
                capacity: r.capacity || 0
            }));

            setRooms(roomsData);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleTypeChange = (e) => {
        setTypeFilter(e.target.value);
    };

    const handleAddRoom = () => {
        setCurrentRoom({ ...INITIAL_ROOM });
        setModalMode('add');
        setShowModal(true);
    };

    const handleEditRoom = (room) => {
        setCurrentRoom(room);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDeleteRoom = async (room) => {
        try {
            await deleteRoom(room.docId);
            toast.success("Room deleted successfully");
            loadRooms();
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting room:", error);
            toast.error("Failed to delete room");
        }
    };

    const handleSaveRoom = async (e) => {
        e.preventDefault();

        // Validation
        if (!currentRoom.number) {
            toast.error("Please fill in room number");
            return;
        }

        setSaving(true);
        try {
            const roomData = {
                number: currentRoom.number,
                type: currentRoom.type,
                capacity: Number(currentRoom.capacity),
                location: currentRoom.location || 'Computer Building',
                department: currentRoom.type === 'Lab' ? currentRoom.department : undefined
            };

            if (modalMode === 'add') {
                await createRoom(roomData);
                toast.success("Room added successfully");
            } else {
                await updateRoom(currentRoom.docId, roomData);
                toast.success("Room updated successfully");
            }

            setShowModal(false);
            setCurrentRoom(INITIAL_ROOM);
            loadRooms();
        } catch (error) {
            console.error("Error saving room:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save room";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentRoom(prev => ({
            ...prev,
            [name]: name === 'capacity' ? Number(value) : value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
            <div className="max-w-7xl mx-auto px-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft className="text-gray-900 dark:text-white" size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-transparent">
                                <Building className="text-blue-600 dark:text-blue-500" size={28} />
                            </div>
                            <h1 className="text-3xl font-bold hidden lg:block text-gray-900 dark:text-white">Room Management</h1>
                        </div>
                    </div>
                    <button
                        onClick={handleAddRoom}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        <Plus size={20} />
                        Add Room
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by room number..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm dark:shadow-none"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={handleTypeChange}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm dark:shadow-none"
                    >
                        <option value="">All Types</option>
                        {ROOM_TYPES.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Advanced Filters removed */}

                {/* Rooms Grid */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="flex items-center justify-center ">
                            <div className='size-36'>
                                <DotLottieReact
                                    src="/Loading.lottie"
                                    loop
                                    autoplay
                                />
                            </div>
                        </div>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <Building className="mx-auto text-gray-400 dark:text-slate-600 mb-4" size={64} />
                        <p className="text-gray-500 dark:text-slate-400 text-lg">No rooms found</p>
                        <button
                            onClick={handleAddRoom}
                            className="mt-4 text-blue-500 hover:underline"
                        >
                            Add your first room
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {rooms.map((room, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-white/5 backdrop-blur-lg group border border-gray-200 dark:border-white/10 rounded-lg p-6 hover:border-blue-500/30 dark:hover:bg-white/10 transition-all duration-200 shadow-sm dark:shadow-none"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border-2 border-blue-100 dark:border-blue-500/30">
                                                <Building className="text-blue-600 dark:text-blue-500" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {room.number}
                                                </h3>
                                                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                                                    <Grid size={14} className="text-purple-400 dark:text-purple-500" />
                                                    {room.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded font-medium">
                                            {room.location}
                                        </span>
                                        {room.department && (
                                            <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded font-medium border border-indigo-100 dark:border-indigo-500/20">
                                                {room.department}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                            <Users size={14} className="text-gray-400 dark:text-slate-400" />
                                            <span>Capacity: {room.capacity}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditRoom(room)}
                                            className="p-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-100 dark:border-transparent"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(room)}
                                            className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-100 dark:border-transparent"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700 shadow-2xl">
                            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modalMode === 'add' ? 'Add New Room' : 'Edit Room'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="text-gray-500 dark:text-slate-400" size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Room Number <span className="text-red-500 dark:text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={currentRoom.number || ''}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                        placeholder="101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={currentRoom.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {ROOM_TYPES.map((type, index) => (
                                            <option key={index} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Location
                                    </label>
                                    <select
                                        name="location"
                                        value={currentRoom.location || 'Computer Building'}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Computer Building">Computer Building</option>
                                        <option value="Administration Building">Administration Building</option>
                                        <option value="New Building">New Building</option>
                                        <option value="Old Building">Old Building</option>
                                    </select>
                                </div>

                                {currentRoom.type === 'Lab' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                            Department
                                        </label>
                                        <select
                                            name="department"
                                            value={currentRoom.department || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((d, i) => (
                                                <option key={i} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={currentRoom.capacity || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                        placeholder="40"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg transition-colors font-medium border border-transparent dark:border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Room'}
                                    </button>
                                </div>
                            </form>
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
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Room</h2>
                                </div>
                                <p className="text-gray-600 dark:text-slate-300 mb-6">
                                    Are you sure you want to delete room <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirm.number}</span>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRoom(deleteConfirm)}
                                        className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
