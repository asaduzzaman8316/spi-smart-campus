'use client'
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react'

export default function Stats() {
    const stats = [
        { icon: Users, value: '5,500+', label: 'Students', color: 'bg-white' },
        { icon: GraduationCap, value: '120+', label: 'Faculty', color: 'bg-white' },
        { icon: BookOpen, value: '7', label: 'Departments', color: 'bg-white' },
        { icon: Award, value: '69+', label: 'Years', color: 'bg-white' },
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
                            className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF5C35]/10 text-center group shadow-sm"
                        >
                            <div className={`inline-flex items-center justify-center w-16 h-16 bg-[#FFFBF2] dark:bg-[#0B1120] border border-gray-100 dark:border-gray-800 shadow-sm rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-8 h-8 text-[#FF5C35]" />
                            </div>
                            <div className="text-4xl font-bold text-black dark:text-white mb-2">
                                {stat.value}
                            </div>
                            <div className="text-text-secondary dark:text-gray-400 text-sm font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
