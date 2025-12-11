'use client'
import Link from 'next/link'
import { Calendar, ArrowRight, BookOpen, Sparkles } from 'lucide-react'

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-brand-start/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-mid/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-end/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div
                className="max-w-7xl mx-auto text-center relative z-10"
            >
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-brand-start/10 to-brand-mid/10 border border-brand-start/20 rounded-full px-6 py-2 mb-8 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-brand-mid" />
                    <span className="text-sm text-brand-mid font-medium">Established 1955 • 69+ Years of Excellence</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl text-gray-900 dark:text-white md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up">
                    <span className="bg-linear-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent">
                        Sylhet Polytechnic
                    </span>
                    <br />
                    <span className="text-5xl text-gray-900 dark:text-white md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up">
                        Institute
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
                    Empowering future engineers through quality technical education and innovation
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
                    <Link
                        href="/routine"
                        className="group bg-linear-to-r from-brand-start via-brand-mid to-brand-end hover:from-brand-mid hover:to-brand-end text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-brand-start/50 hover:shadow-xl hover:shadow-brand-start/60 hover:scale-105 flex items-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>View Class Routine</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/about"
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-brand-mid text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span>Learn More</span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
