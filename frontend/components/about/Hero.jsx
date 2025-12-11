import { MapPin } from 'lucide-react'
import React from 'react'

function Hero() {
    return (
        <section className="relative bg-[#FFFBF2] dark:bg-[#0B1120] py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center space-y-6 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif text-[#2C1810] dark:text-white">
                        Sylhet Polytechnic Institute
                    </h1>
                    <p className="text-xl md:text-2xl text-[#2C1810]/80 dark:text-gray-300 max-w-3xl mx-auto">
                        A Legacy of Technical Excellence Since 1955
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[#2C1810]/70 dark:text-gray-400">
                        <MapPin className="w-5 h-5 text-[#FF5C35]" />
                        <span>Borikandi, Technical Road, Sylhet-3100, Bangladesh</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
