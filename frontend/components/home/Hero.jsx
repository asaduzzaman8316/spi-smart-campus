'use client'
import Link from 'next/link'
import { Calendar, ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import Typewriter from 'typewriter-effect'

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div
                className="max-w-7xl mx-auto text-center relative z-10"

            >
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full px-6 py-2 mb-8 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300 font-medium">Established 1955 • 69+ Years of Excellence</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl text-white md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up">
                    <span className="bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                        Sylhet Polytechnic
                    </span>
                    <br />
                    <Typewriter
                        options={{
                            strings: [
                                'Institute',
                                'Institute'
                            ],
                            
                            autoStart: true,
                            loop: true,
                            delay: 85,
                            deleteSpeed: 100,
                            wrapperClassName: 'pl-2'
                        }}
                    />
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
                    Empowering future engineers through quality technical education and innovation
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
                    <Link
                        href="/routine"
                        className="group bg-linear-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-105 flex items-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>View Class Routine</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/about"
                        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span>Learn More</span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
