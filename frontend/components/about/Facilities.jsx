import { Award, BookOpen, Building2, Cpu, Heart } from 'lucide-react'
import React from 'react'

function Facilities() {
    const facilities = [
        { title: 'Modern Campus', description: '20-acre urban campus near Surma River', icon: Building2 },
        { title: 'Rich Library', description: 'Comprehensive collection of technical resources', icon: BookOpen },
        { title: 'Hostels', description: 'Separate accommodation for boys and girls', icon: Building2 },
        { title: 'Sports Facilities', description: 'Two playgrounds for various activities', icon: Award },
        { title: 'Modern Labs', description: 'State-of-the-art equipment and machinery', icon: Cpu },
        { title: 'Medical Center', description: 'On-campus healthcare facilities', icon: Heart },
    ]
    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        World-Class Facilities
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        State-of-the-art infrastructure for comprehensive learning
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map((facility, index) => (
                        <div
                            data-aos='fade-up'
                            key={index}
                            className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl">
                                    <facility.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{facility.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{facility.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Facilities
