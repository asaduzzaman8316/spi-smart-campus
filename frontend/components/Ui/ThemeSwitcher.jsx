'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeSwitcher() {
    const { params, resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    if (!mounted) {
        return (
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
        )
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none ring-2 ring-transparent focus:ring-[#00BCD4]"
            aria-label="Toggle Theme"
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 w-full h-full text-orange-500 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0`}
                />
                <Moon
                    className={`absolute inset-0 w-full h-full text-[#00BCD4] transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100`}
                />
            </div>
        </button>
    )
}
