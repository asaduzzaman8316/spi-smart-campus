'use client'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'

export default function CTA() {
    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-4xl mx-auto">
                <div
                    data-aos='zoom-in'
                    className="bg-white dark:bg-[#1E293B] p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-[#2C1810]/80 dark:text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of students and faculty members using SPI Smart Campus for a better academic experience
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/routine"
                            className="group bg-[#FF5C35] hover:bg-[#ff451a] text-white font-semibold px-8 py-4 rounded-full leading-loose tracking-[1px] transition-all duration-300 shadow-lg shadow-[#FF5C35]/30 hover:shadow-xl hover:shadow-[#FF5C35]/40 hover:scale-105 flex items-center gap-2"
                        >
                            <Calendar className="w-5 h-5" />
                            <span>View Routine</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/teachers"
                            className="bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF5C35] dark:hover:border-[#FF5C35] text-[#2C1810] dark:text-white font-semibold px-8 py-4 rounded-full leading-loose tracking-[1px] transition-all duration-300 flex items-center gap-2"
                        >
                            <span>Browse Teachers</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
