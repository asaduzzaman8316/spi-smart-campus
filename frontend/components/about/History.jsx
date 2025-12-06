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
                        <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Our History
                        </h2>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                Established in <span className="text-purple-400 font-semibold">1955</span> by the Government of East Pakistan with support from the Ford Foundation, Sylhet Polytechnic Institute has been a beacon of technical education for nearly seven decades.
                            </p>
                            <p>
                                Officially named <span className="text-pink-400 font-semibold">Sylhet Polytechnic Institute in 1959</span>, our institution was one of six pioneering polytechnic institutes established across Bangladesh, including those in Dhaka, Rangpur, Bogra, Pabna, and Barisal.
                            </p>
                            <p>
                                Our campus was designed by renowned architects <span className="text-purple-400 font-semibold">Muzharul Islam</span> and <span className="text-pink-400 font-semibold">Stanley Tigerman</span>, reflecting a commitment to excellence in both education and infrastructure.
                            </p>
                            <p>
                                Initially offering three-year courses based on the syllabus of Oklahoma State University, we issued certificates as &quot;Associated in Engineering,&quot; enabling graduates to pursue Bachelor of Science courses in the United States.
                            </p>
                        </div>
                    </div>
                    <div
                        className="relative">
                        <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-8 border border-purple-500/30 backdrop-blur-sm">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                    <Calendar className="w-8 h-8 text-purple-400" />
                                    <div>
                                        <div className="text-sm text-gray-400">Established</div>
                                        <div className="text-2xl font-bold text-white">1955</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                    <Award className="w-8 h-8 text-pink-400" />
                                    <div>
                                        <div className="text-sm text-gray-400">Affiliation</div>
                                        <div className="text-lg font-semibold text-white">Bangladesh Technical Education Board</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                    <Building2 className="w-8 h-8 text-red-400" />
                                    <div>
                                        <div className="text-sm text-gray-400">Campus Size</div>
                                        <div className="text-2xl font-bold text-white">20 Acres</div>
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
