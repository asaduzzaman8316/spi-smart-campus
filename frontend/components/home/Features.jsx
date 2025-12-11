'use client'
import { BookOpen, Users, TrendingUp, Sparkles } from 'lucide-react'

export default function Features() {
    const features = [
        {
            icon: BookOpen,
            title: 'Quality Education',
            description: 'Comprehensive technical education aligned with industry standards',
        },
        {
            icon: Users,
            title: 'Expert Faculty',
            description: 'Experienced teachers dedicated to student success',
        },
        {
            icon: TrendingUp,
            title: 'Career Growth',
            description: 'Preparing students for professional excellence',
        },
        {
            icon: Sparkles,
            title: 'Modern Facilities',
            description: 'State-of-the-art labs and infrastructure',
        }
    ]

    return (
        <section className="py-20 px-4 bg-linear-to-b from-transparent via-brand-start/5 to-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-brand-start to-brand-mid bg-clip-text text-transparent mb-4">
                        Why Choose SPI?
                    </h2>
                    <p className="text-text-secondary text-lg">Excellence in technical education since 1955</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            data-aos='fade-up'
                            data-aos-delay={100 * index}
                            key={index}
                            className="bg-card-bg p-6 rounded-2xl border border-border-color hover:border-icon transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-icon/20 group shadow-sm"
                        >
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-icon-bg rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-7 h-7 text-icon" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-icon transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
