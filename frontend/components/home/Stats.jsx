'use client'
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react'

export default function Stats() {
    const stats = [
        { icon: Users, value: '5,500+', label: 'Students', color: 'from-brand-start to-brand-mid' },
        { icon: GraduationCap, value: '120+', label: 'Faculty', color: 'from-brand-mid to-brand-end' },
        { icon: BookOpen, value: '7', label: 'Departments', color: 'from-brand-end to-brand-start' },
        { icon: Award, value: '69+', label: 'Years', color: 'from-brand-start to-brand-mid' },
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
                            className="bg-card-bg p-6 rounded-2xl border border-border-color hover:border-brand-mid transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-start/20 text-center group shadow-sm"
                        >
                            <div className={`inline-flex items-center justify-center w-16 h-16 bg-linear-to-br ${stat.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-4xl font-bold bg-linear-to-r from-brand-start to-brand-mid bg-clip-text text-transparent mb-2">
                                {stat.value}
                            </div>
                            <div className="text-text-secondary text-sm font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
