'use client'

import Link from 'next/link'
import { Home, MoveLeft, AlertCircle } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-start/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-mid/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
                {/* Large 404 Text */}
                <div className="relative">
                    <h1 className="text-[150px] md:text-[200px] font-bold leading-none bg-linear-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent opacity-80 animate-fade-in-up">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-text-secondary/5 font-bold text-[160px] md:text-[220px] pointer-events-none blur-sm">
                        404
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4 animate-fade-in-up delay-200">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-4">
                        <AlertCircle size={16} />
                        <span className="text-sm font-medium">Page Not Found</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                        Lost in Space?
                    </h2>
                    <p className="text-text-secondary text-lg max-w-md mx-auto">
                        The page you are looking for has clearly vanished into a black hole. Let&apos;s get you back on safe ground.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-brand-start to-brand-mid text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-brand-start/25 group"
                    >
                        <Home size={20} className="group-hover:-translate-y-1 transition-transform" />
                        Back to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-8 py-3 bg-card-bg border border-border-color text-text-secondary rounded-xl font-semibold hover:bg-icon-bg hover:text-icon transition-all hover:scale-105"
                    >
                        <MoveLeft size={20} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    )
}
