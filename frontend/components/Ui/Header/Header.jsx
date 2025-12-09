'use client'
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image';
import ThemeSwitcher from '../ThemeSwitcher';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';


export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Derived state for UI compatibility
    const isLoggedIn = !!user;


    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Today', href: '/today' },
        { name: 'Routine', href: '/routine' },
        { name: 'Teacher', href: '/teacher' },
    ];

    const isActive = (path) => pathname === path;

    const handleLogout = async () => {
        try {
            setIsOpen(false)
            logout() // Use context logout
        } catch (error) {
            console.error('Logout error:', error)
        }
    }



    return (
        <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg fixed w-full mx-auto top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="shrink-0">
                        <Link href="/">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo-dark.png"
                                    width={40}
                                    height={40}
                                    alt='SPI Smart Campus Logo'
                                    className='absolute inset-0 w-full h-full rounded-full object-cover hidden dark:block'
                                    priority
                                />
                                <Image
                                    src="/logo-light.png"
                                    width={40}
                                    height={40}
                                    alt='SPI Smart Campus Logo'
                                    className='absolute inset-0 w-full h-full rounded-full object-cover block dark:hidden'
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`transition-colors duration-200 font-medium ${isActive(link.href) ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center space-x-2 ${isActive('/dashboard') ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-gray-200'} hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 font-medium`}
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                            </>
                        ) : (
                            <Link
                                href={'/login'}
                                className=" border-2 border-gray-500 text-gray-700 dark:text-white hover:text-black dark:hover:text-gray-200 hover:border-gray-800 dark:hover:border-white px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            >
                                Admin Login
                            </Link>
                        )}
                        <ThemeSwitcher />
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden ">
                        <div className='flex items-center justify-center gap-3'>
                            <div className="flex justify-start">
                                <ThemeSwitcher />
                            </div>
                            <button
                                onClick={toggleMenu}
                                className="text-gray-900 dark:text-white hover:text-red-500 focus:outline-none"
                            >
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-4 animate-fade-in">
                        <div className="flex flex-col space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${isActive(link.href) ? 'text-red-600 dark:text-red-500 font-semibold' : 'text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-400'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${isActive('/dashboard') ? 'text-red-600 dark:text-red-500 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-purple-800/30'}`}
                                    >
                                        <LayoutDashboard size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-red-600 dark:text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href={'/login'}
                                    onClick={() => setIsOpen(false)}
                                    className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md"
                                >
                                    Admin Login
                                </Link>
                            )}

                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}