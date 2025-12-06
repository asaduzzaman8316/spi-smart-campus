
import Link from 'next/link'
import { GraduationCap, Users } from 'lucide-react'

export default function CTA() {
    return (
        <section
            className="py-20 px-4 relative">
            <div className="absolute inset-0 bg-linear-to-r from-purple-900/20 via-pink-900/20 to-red-900/20" />
            <div
                data-aos='fade-up'
                className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Start Your Journey?
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                    Join thousands of students who have built successful careers through SPI
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/about"
                        className="bg-linear-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-105 inline-flex items-center justify-center gap-2"
                    >
                        <GraduationCap className="w-5 h-5" />
                        <span>Explore SPI</span>
                    </Link>
                    <Link
                        href="/teacher"
                        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2"
                    >
                        <Users className="w-5 h-5" />
                        <span>Meet Our Faculty</span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
