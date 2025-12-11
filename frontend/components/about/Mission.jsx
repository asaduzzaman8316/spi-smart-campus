import React from 'react'

function Mission() {
    return (
        <section className="py-20 px-4 bg-[#FFFBF2] dark:bg-[#0B1120]">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    <div
                        data-aos='flip-right'
                        className="bg-white dark:bg-[#1E293B] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-lg">
                        <h3 className="text-3xl font-bold font-serif text-[#2C1810] dark:text-white mb-6">
                            Our Mission
                        </h3>
                        <p className="text-[#2C1810]/80 dark:text-gray-300 leading-relaxed">
                            To provide quality technical education that meets market demands and prepares students for professional workplaces both domestically and internationally. We are committed to developing skilled engineers through comprehensive learning experiences and practical training with modern technologies.
                        </p>
                    </div>
                    <div
                        data-aos='flip-left'
                        className="bg-white dark:bg-[#1E293B] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-lg">
                        <h3 className="text-3xl font-bold font-serif text-[#FF5C35] mb-6">
                            Our Vision
                        </h3>
                        <p className="text-[#2C1810]/80 dark:text-gray-300 leading-relaxed">
                            To be a leading polytechnic institute in Bangladesh, recognized for excellence in technical education, innovation, and producing graduates who contribute significantly to national development and the global engineering community.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Mission
