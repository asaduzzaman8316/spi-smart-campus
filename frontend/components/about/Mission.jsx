import React from 'react'

function Mission() {
    return (
        <section className="py-20 px-4 bg-linear-to-br from-purple-900/20 via-gray-950 to-pink-900/20">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    <div
                        data-aos='flip-right'
                        className="bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-purple-500/30">
                        <h3 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                            Our Mission
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                            To provide quality technical education that meets market demands and prepares students for professional workplaces both domestically and internationally. We are committed to developing skilled engineers through comprehensive learning experiences and practical training with modern technologies.
                        </p>
                    </div>
                    <div
                        data-aos='flip-left'
                        className="bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-pink-500/30">
                        <h3 className="text-3xl font-bold bg-linear-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-6">
                            Our Vision
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                            To be a leading polytechnic institute in Bangladesh, recognized for excellence in technical education, innovation, and producing graduates who contribute significantly to national development and the global engineering community.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Mission
