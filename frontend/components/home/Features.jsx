
import { BookOpen, Users, TrendingUp, Sparkles } from 'lucide-react'

export default function Features() {
    const features = [
        {
            icon: BookOpen,
            title: 'Quality Education',
            description: 'Comprehensive technical education aligned with industry standards',
            color: 'purple'
        },
        {
            icon: Users,
            title: 'Expert Faculty',
            description: 'Experienced teachers dedicated to student success',
            color: 'pink'
        },
        {
            icon: TrendingUp,
            title: 'Career Growth',
            description: 'Preparing students for professional excellence',
            color: 'red'
        },
        {
            icon: Sparkles,
            title: 'Modern Facilities',
            description: 'State-of-the-art labs and infrastructure',
            color: 'indigo'
        }
    ]

    return (
        <section className="py-20 px-4 bg-linear-to-b from-transparent via-purple-900/5 to-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        Why Choose SPI?
                    </h2>
                    <p className="text-gray-400 text-lg">Excellence in technical education since 1955</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                        data-aos='fade-up'
                        data-aos-delay={100*index}
                            key={index}
                            className="bg-linear-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 group"
                        >
                            <div className={`inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-${feature.color}-500 to-pink-500 rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
