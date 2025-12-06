'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({ error, reset }) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-950 text-white h-screen flex flex-col items-center justify-center p-4`}>
                <div className="text-center max-w-xl mx-auto space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-3xl font-bold">Critical Error Encountered</h2>
                    <p className="text-gray-400">
                        A critical error caused the application to crash. We apologize for the inconvenience.
                    </p>

                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        <RotateCcw size={20} />
                        Refresh Application
                    </button>
                </div>
            </body>
        </html>
    )
}
