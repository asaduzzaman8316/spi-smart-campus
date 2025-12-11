'use client'
import Link from 'next/link'
import { Calendar, Play, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FFFBF2] dark:bg-[#0B1120]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 opacity-50">
                <Image
                    src="/image1.png"
                    width={800}
                    height={800}
                    alt='Background Pattern'
                    className='w-full h-full object-cover'
                    priority
                />
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-10 px-4 w-full">

                {/* Floating Technology Badges */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none select-none">
                    {/* Top Left - Computer */}
                    <div className="absolute top-[10%] left-[5%] -rotate-2">
                        <span className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm uppercase tracking-wide">
                            COMPUTER TECHNOLOGY
                        </span>
                        <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-yellow-400">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0L15 15H0L7.5 0Z" fill="currentColor" /></svg>
                        </span>
                    </div>

                    {/* Middle Left - Electronics */}
                    <div className="absolute top-[45%] left-[3%] rotate-3 transition-transform hover:scale-110 duration-500">
                        <span className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm uppercase tracking-wide">
                            ELECTRONICS TECHNOLOGY
                        </span>
                        <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-purple-500">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0L15 15H0L7.5 0Z" fill="currentColor" /></svg>
                        </span>
                    </div>

                    {/* Top Right - Civil */}
                    <div className="absolute top-[15%] right-[8%] rotate-3">
                        <span className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm uppercase tracking-wide">
                            CIVIL TECHNOLOGY
                        </span>
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-blue-500 rotate-180">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0L15 15H0L7.5 0Z" fill="currentColor" /></svg>
                        </span>
                    </div>

                    {/* Middle Right - Electrical */}
                    <div className="absolute top-[50%] right-[3%] -rotate-2 transition-transform hover:scale-110 duration-500">
                        <span className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm uppercase tracking-wide">
                            ELECTRICAL TECHNOLOGY
                        </span>
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-cyan-500 rotate-180">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0L15 15H0L7.5 0Z" fill="currentColor" /></svg>
                        </span>
                    </div>

                    {/* Top Center - Electro-Medical */}
                    <div className="absolute top-[8%] left-1/2 -translate-x-1/2 rotate-1">
                        <span className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm uppercase tracking-wide">
                            ELECTRO-MEDICAL
                        </span>
                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-pink-500 rotate-180">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0L15 15H0L7.5 0Z" fill="currentColor" /></svg>
                        </span>
                    </div>

                    {/* Bottom Left - Power */}
                    <div className="absolute bottom-[20%] left-[8%] rotate-6">
                        <span className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm uppercase tracking-wide">
                            POWER TECHNOLOGY
                        </span>
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-green-500">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0L15 15H0L7.5 0Z" fill="currentColor" /></svg>
                        </span>
                    </div>

                    {/* Bottom Right - Mechanical */}
                    <div className="absolute bottom-[10%] right-[5%] -rotate-3">
                        <span className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm uppercase tracking-wide">
                            MECHANICAL TECHNOLOGY
                        </span>
                        <span className="absolute -left-3 -top-2 text-orange-400 rotate-45">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0L15 15H0L7.5 0Z" fill="currentColor" /></svg>
                        </span>
                    </div>
                </div>


                {/* Animated Top Badge */}
                <div className="inline-flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-full px-2 py-1 mb-12 shadow-sm animate-fade-in hover:shadow-md transition-shadow cursor-default">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1E293B] bg-gray-200 overflow-hidden">
                            {/* Placeholder avatars since we don't have the exact user images */}
                            <div className="w-full h-full bg-linear-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-[10px] font-bold text-white">A</div>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1E293B] bg-gray-200 overflow-hidden">
                            <div className="w-full h-full bg-linear-to-br from-blue-300 to-purple-400 flex items-center justify-center text-[10px] font-bold text-white">B</div>
                        </div>
                    </div>
                    <span className="text-sm text-gray-800 dark:text-gray-200 font-medium px-2">Plan Smarter Study Better</span>
                    <Sparkles className="w-4 h-4 text-black dark:text-white" />
                </div>

                {/* Main Heading */}
                <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.1] text-[#2C1810] dark:text-white mb-8 animate-fade-in-up tracking-tight">
                    A SMARTER WAY TO FOLLOW<br />
                    <span className="italic text-[#FF5C35]">YOUR ROUTINE</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200 font-medium">
                    A clean timetable designed to keep you focused and on schedule
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-300">
                    <Link
                        href="/routine"
                        className="bg-[#FF5C35] hover:bg-[#ff451a] text-white text-base font-medium px-8 py-3 rounded-full transition-all duration-300 shadow-lg shadow-[#FF5C35]/20 hover:shadow-xl hover:shadow-[#FF5C35]/30 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <span>Class Routine</span>
                        <Calendar className="w-5 h-5" />
                    </Link>

                    <button
                        className="group flex items-center gap-3 text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white font-medium transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center group-hover:border-black dark:group-hover:border-white transition-colors bg-transparent">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <span>Watch Demo</span>
                    </button>
                </div>
            </div>
        </section>
    )
}
