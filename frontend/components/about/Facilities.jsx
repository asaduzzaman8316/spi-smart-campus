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
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-4">
                        World-Class Facilities
                    </h2>
                    <p className="text-[#2C1810]/70 dark:text-gray-400 text-lg">
                        State-of-the-art infrastructure for comprehensive learning
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map((facility, index) => (
                        <div
                            data-aos='fade-up'
                            key={index}
                            className="bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF5C35]/10"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-full border border-gray-100 dark:border-gray-800">
                                    <facility.icon className="w-8 h-8 text-[#FF5C35]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2C1810] dark:text-white">{facility.title}</h3>
                                <p className="text-[#2C1810]/70 dark:text-gray-400">{facility.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Facilities
