'use client'
import { useState, useEffect } from 'react'
import { Mail, Phone, Briefcase, User } from 'lucide-react'
import { fetchDepartments, fetchPaginatedTeachers } from '@/Lib/api'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Image from 'next/image'

export default function TeacherList() {
    const [teachers, setTeachers] = useState([])
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)

            try {
                // Fetch all teachers
                const response = await fetchPaginatedTeachers(1, 1000)
                setTeachers(response || [])

                // Fetch departments
                const departmentsData = await fetchDepartments()
                setDepartments(departmentsData)

            } catch (error) {
                console.error("Error loading data:", error)
            }

            setLoading(false)
        }

        loadData()
    }, [])

    const filteredTeachers = filter === 'all'
        ? teachers
        : teachers.filter(t => t.department === filter)

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
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl pt-18 mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent mb-4">
                        Our Teachers
                    </h1>
                    <p className="text-text-secondary mb-6">
                        Meet our dedicated faculty members
                    </p>

                    {/* Filter */}
                    <div className="flex justify-center">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-6 py-3 bg-card-bg border border-border-color rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-brand-mid transition-all shadow-md"
                        >
                            <option value="all" className="bg-card-bg text-foreground">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept.name} className="bg-card-bg text-foreground">{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredTeachers.length === 0 ? (
                    <div className="text-center py-12 bg-card-bg border border-border-color rounded-2xl shadow-lg">
                        <p className="text-text-secondary text-xl">No teachers found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {filteredTeachers.map((teacher) => (
                            <div
                                key={teacher._id}
                                className="bg-card-bg border border-border-color rounded-2xl p-6 hover:border-brand-mid hover:shadow-xl hover:shadow-brand-mid/20 transition-all duration-300 hover:scale-105"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    {teacher.image ? (
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-mid/30">
                                            <Image
                                                src={teacher.image}
                                                alt={teacher.name}
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-icon-bg flex items-center justify-center border-2 border-brand-mid/30">
                                            <User size={32} className="text-icon" />
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{teacher.name}</h3>
                                        <p className="text-brand-mid text-sm font-medium">
                                            {teacher.role}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                                        <Briefcase size={14} />
                                        <span>{teacher.department}</span>
                                    </div>

                                    {teacher.email && (
                                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                                            <Mail size={14} />
                                            <span className="truncate">{teacher.email}</span>
                                        </div>
                                    )}

                                    {teacher.phone && (
                                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                                            <Phone size={14} />
                                            <span>{teacher.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {teacher.shift && (
                                    <p className="text-xs text-text-secondary border-t border-border-color pt-3">
                                        Shift: <strong>{teacher.shift}</strong>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
