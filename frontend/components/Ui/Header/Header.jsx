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
    const { user } = useAuth()
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


    return (
        <header className="bg-[#FFFBF2]/80 dark:bg-[#0B1120]/80 backdrop-blur-lg fixed w-full mx-auto top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
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
                                className={`transition-colors duration-200 font-medium ${isActive(link.href) ? 'text-[#FF5C35] font-semibold' : 'text-[#2C1810] dark:text-gray-200 hover:text-[#FF5C35] dark:hover:text-[#FF5C35]'}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center space-x-2 ${isActive('/dashboard') ? 'text-[#FF5C35]' : 'text-[#2C1810] dark:text-gray-200'} hover:text-[#FF5C35] dark:hover:text-[#FF5C35] transition-colors duration-200 font-medium`}
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                            </>
                        ) : (
                            <Link
                                href={'/login'}
                                className="bg-[#FF5C35] hover:bg-[#ff451a] text-white px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg shadow-[#FF5C35]/20 font-medium"
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
                                className="text-[#2C1810] dark:text-gray-200 hover:text-[#FF5C35] dark:hover:text-[#FF5C35] focus:outline-none"
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
                                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${isActive(link.href) ? 'text-[#FF5C35] font-semibold' : 'text-[#2C1810] dark:text-gray-200 hover:text-[#FF5C35] dark:hover:text-[#FF5C35]'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${isActive('/dashboard') ? 'text-[#FF5C35] font-semibold' : 'text-[#2C1810] dark:text-gray-200 hover:text-[#FF5C35] dark:hover:text-[#FF5C35] hover:bg-[#FFFBF2] dark:hover:bg-[#1E293B]'}`}
                                    >
                                        <LayoutDashboard size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={'/login'}
                                    onClick={() => setIsOpen(false)}
                                    className="bg-[#FF5C35] hover:bg-[#ff451a] text-white px-4 py-2 rounded-full transition-all duration-300 shadow-md font-medium text-center"
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