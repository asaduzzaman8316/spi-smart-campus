'use client'
import { useState, useEffect } from 'react'
import { Mail, Phone, Briefcase, User } from 'lucide-react'
import { fetchPaginatedTeachers, fetchDepartments } from '@/Lib/api'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Image from 'next/image'
import Pagination from '@/components/Ui/Pagination'

export default function TeacherList() {
    const [teachers, setTeachers] = useState([])
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [pagination, setPagination] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)

            try {
                // Fetch paginated teachers
                const response = await fetchPaginatedTeachers(currentPage, 9)
                setTeachers(response.data || [])
                setPagination(response.pagination)

                // Fetch departments (only need to do this once really, but kept here for simplicity)
                if (departments.length === 0) {
                    const departmentsData = await fetchDepartments()
                    setDepartments(departmentsData)
                }
            } catch (error) {
                console.error("Error loading data:", error)
            }

            setLoading(false)
        }
        loadData();
    }, [currentPage])

    const filteredTeachers = filter === 'all'
        ? teachers
        : teachers.filter(t => t.department === filter)

    // Note: If filtering by department is client-side only (current implementation), 
    // pagination might behave oddly (showing 9 items, filtering down to 2, but page 2 exists).
    // Ideally filtration should happen on backend. 
    // For now, consistent with user request "show 9 teacher profile, after 9 card show pagenation", 
    // we paginate the *initial* fetch. 

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
                <div className='size-36'>
                    <DotLottieReact
                        src="/Loading.lottie"
                        loop
                        autoplay

                    />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-7xl pt-18 mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
                        Our Teachers
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Meet our dedicated faculty members</p>

                    {/* Filter */}
                    <div className="flex justify-center">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-6 py-3 bg-white dark:bg-linear-to-br dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-md"
                        >
                            <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept.name} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredTeachers.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-linear-to-br dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
                        <p className="text-gray-500 dark:text-gray-400 text-xl">No teachers found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {filteredTeachers.map((teacher) => (
                                <div
                                    key={teacher._id}
                                    className="bg-white dark:bg-linear-to-br dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            {teacher.image ? (
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/30">
                                                    <Image
                                                        src={teacher.image}
                                                        alt={teacher.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/30">
                                                    <User className="text-purple-500" size={32} />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {teacher.name}
                                                </h3>
                                                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                                                    {teacher.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                            <Briefcase size={14} className="text-pink-500 dark:text-pink-400" />
                                            <span>{teacher.department}</span>
                                        </div>
                                        {teacher.email && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                                <Mail size={14} className="text-purple-500 dark:text-purple-400" />
                                                <span className="truncate">{teacher.email}</span>
                                            </div>
                                        )}
                                        {teacher.phone && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                                <Phone size={14} className="text-red-500 dark:text-red-400" />
                                                <span>{teacher.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {
                                        teacher.shift && (
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Shift: <span className="text-gray-700 dark:text-gray-300">{teacher.shift}</span>
                                                </p>
                                            </div>
                                        )
                                    }
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pagination && filter === 'all' && (
                            <div className="mt-8">
                                <Pagination
                                    pagination={pagination}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    )
}