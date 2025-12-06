'use client'
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react'

export default function Stats() {
    const stats = [
        { icon: Users, value: '5,500+', label: 'Students', color: 'from-purple-500 to-pink-500' },
        { icon: GraduationCap, value: '120+', label: 'Faculty', color: 'from-pink-500 to-red-500' },
        { icon: BookOpen, value: '7', label: 'Departments', color: 'from-red-500 to-orange-500' },
        { icon: Award, value: '69+', label: 'Years', color: 'from-purple-500 to-indigo-500' },
    ]

    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            data-aos='fade-up'
                            data-aos-delay={100 * index}
                            key={index}
                            className="bg-white dark:bg-linear-to-br dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 dark:hover:shadow-purple-500/20 text-center group shadow-sm dark:shadow-none"
                        >
                            <div className={`inline-flex items-center justify-center w-16 h-16 bg-linear-to-br ${stat.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-4xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                                {stat.value}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
