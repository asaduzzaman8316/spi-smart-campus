import { Building2, Cpu, Heart, Zap } from "lucide-react"

export default function Departments() {
    const departments = [
        { name: 'Civil Engineering Technology', icon: Building2, color: 'from-blue-500 to-cyan-500' },
        { name: 'Computer Engineering Technology', icon: Cpu, color: 'from-purple-500 to-pink-500' },
        { name: 'Electrical Engineering Technology', icon: Zap, color: 'from-yellow-500 to-orange-500' },
        { name: 'Electro-medical Engineering', icon: Heart, color: 'from-red-500 to-pink-500' },
        { name: 'Electronics Engineering Technology', icon: Cpu, color: 'from-indigo-500 to-purple-500' },
        { name: 'Mechanical Engineering Technology', icon: Building2, color: 'from-gray-500 to-slate-500' },
        { name: 'Power Engineering Technology', icon: Zap, color: 'from-green-500 to-emerald-500' },
    ]

    return (
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
                        Our Departments
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Seven specialized engineering technologies preparing students for the future
                    </p>
                </div>
                <div
                    data-aos='zoom-in-up'
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept, index) => (
                        <div
                            key={index}
                            className="group bg-white dark:bg-linear-to-br dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 dark:hover:shadow-purple-500/20 shadow-sm dark:shadow-none"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 bg-linear-to-br ${dept.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                    <dept.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-purple-400 transition-colors">
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
