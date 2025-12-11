'use client'
import { Clock, Users, Bell, Shield } from 'lucide-react'

export default function Features() {
    const features = [
        {
            icon: Clock,
            title: 'Real-Time Routine',
            description: 'Access your class schedule anytime, anywhere with instant updates'
        },
        {
            icon: Users,
            title: 'Teacher Profiles',
            description: 'Connect with faculty members and view their expertise and contact information'
        },
        {
            icon: Bell,
            title: 'Instant Notices',
            description: 'Stay updated with important announcements and academic notices'
        },
        {
            icon: Shield,
            title: 'Secure Access',
            description: 'Your academic data is protected with enterprise-grade security'
        }
    ]

    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-4">
                        Smart Campus Features
                    </h2>
                    <p className="text-[#2C1810]/80 dark:text-gray-400 text-lg">
                        Everything you need for a seamless academic experience
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            data-aos='fade-up'
                            data-aos-delay={100 * index}
                            key={index}
                            className="bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF5C35]/10 shadow-sm group"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFFBF2] dark:bg-[#0B1120] border border-gray-100 dark:border-gray-800 shadow-sm rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-8 h-8 text-[#FF5C35]" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#2C1810] dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
