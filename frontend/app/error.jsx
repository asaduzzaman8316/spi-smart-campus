'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-red-600/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 text-center max-w-xl mx-auto space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Something went wrong!
                    </h2>
                    <p className="text-gray-400 text-lg">
                        We encountered an unexpected error. Don&apos;t worry, it&apos;s not you - it&apos;s us.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 text-left overflow-auto max-h-40 text-sm text-red-400 font-mono">
                            {error.message}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:scale-105 shadow-lg shadow-red-500/25"
                    >
                        <RefreshCcw size={20} />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-3 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-800 hover:text-white transition-all hover:scale-105"
                    >
                        <Home size={20} />
                        Back Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
