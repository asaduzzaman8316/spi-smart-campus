import { Building2, Cpu, Heart, Zap } from "lucide-react"

export default function Departments() {
    const departments = [
        { name: 'Civil Engineering Technology', icon: Building2 },
        { name: 'Computer Engineering Technology', icon: Cpu },
        { name: 'Electrical Engineering Technology', icon: Zap },
        { name: 'Electro-medical Engineering', icon: Heart },
        { name: 'Electronics Engineering Technology', icon: Cpu },
        { name: 'Mechanical Engineering Technology', icon: Building2 },
        { name: 'Power Engineering Technology', icon: Zap },
    ]

    return (
        <section className="py-20 px-4 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-4">
                        Our Departments
                    </h2>
                    <p className="text-[#2C1810]/80 dark:text-gray-400 text-lg">
                        Seven specialized engineering technologies preparing students for the future
                    </p>
                </div>
                <div
                    data-aos='zoom-in-up'
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept, index) => (
                        <div
                            key={index}
                            className="group bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF5C35]/10 shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#FFFBF2] dark:bg-[#0B1120] border border-gray-100 dark:border-gray-800 shadow-sm rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <dept.icon className="w-6 h-6 text-[#FF5C35]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-[#2C1810] dark:text-white group-hover:text-[#FF5C35] transition-colors">
                                        {dept.name}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
