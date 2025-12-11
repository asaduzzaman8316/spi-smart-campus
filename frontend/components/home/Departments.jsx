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
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-brand-start to-brand-mid bg-clip-text text-transparent mb-4">
                        Our Departments
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Seven specialized engineering technologies preparing students for the future
                    </p>
                </div>
                <div
                    data-aos='zoom-in-up'
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept, index) => (
                        <div
                            key={index}
                            className="group bg-card-bg p-6 rounded-2xl border border-border-color hover:border-icon transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-icon/20 shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-icon-bg rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <dept.icon className="w-6 h-6 text-icon" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-icon transition-colors">
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
