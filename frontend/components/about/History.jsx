import { Award, Building2, Calendar } from 'lucide-react'
import React from 'react'

function History() {
    return (
        <section className="py-20 px-4">
            <div
                data-aos='fade-up'
                className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div
                        className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white">
                            Our History
                        </h2>
                        <div className="space-y-4 text-[#2C1810]/80 dark:text-gray-300 leading-relaxed">
                            <p>
                                Established in <span className="text-[#FF5C35] font-semibold">1955</span> by the Government of East Pakistan with support from the Ford Foundation, Sylhet Polytechnic Institute has been a beacon of technical education for nearly seven decades.
                            </p>
                            <p>
                                Officially named <span className="text-[#FF5C35] font-semibold">Sylhet Polytechnic Institute in 1959</span>, our institution was one of six pioneering polytechnic institutes established across Bangladesh, including those in Dhaka, Rangpur, Bogra, Pabna, and Barisal.
                            </p>
                            <p>
                                Our campus was designed by renowned architects <span className="text-[#FF5C35] font-semibold">Muzharul Islam</span> and <span className="text-[#FF5C35] font-semibold">Stanley Tigerman</span>, reflecting a commitment to excellence in both education and infrastructure.
                            </p>
                            <p>
                                Initially offering three-year courses based on the syllabus of Oklahoma State University, we issued certificates as &quot;Associated in Engineering,&quot; enabling graduates to pursue Bachelor of Science courses in the United States.
                            </p>
                        </div>
                    </div>
                    <div
                        className="relative">
                        <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <Calendar className="w-8 h-8 text-[#FF5C35]" />
                                    <div>
                                        <div className="text-sm text-[#2C1810]/60 dark:text-gray-400">Established</div>
                                        <div className="text-2xl font-bold text-[#2C1810] dark:text-white">1955</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <Award className="w-8 h-8 text-[#FF5C35]" />
                                    <div>
                                        <div className="text-sm text-[#2C1810]/60 dark:text-gray-400">Affiliation</div>
                                        <div className="text-lg font-semibold text-[#2C1810] dark:text-white">Bangladesh Technical Education Board</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <Building2 className="w-8 h-8 text-[#FF5C35]" />
                                    <div>
                                        <div className="text-sm text-[#2C1810]/60 dark:text-gray-400">Campus Size</div>
                                        <div className="text-2xl font-bold text-[#2C1810] dark:text-white">20 Acres</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default History
