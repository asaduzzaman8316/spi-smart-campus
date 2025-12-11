'use client'
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Lock, Mail, Shield, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function AdminLogin() {
    const { login, user, loading: authLoading } = useAuth()
    const router = useRouter()

    // Local loading state for the form submission
    const [submitting, setSubmitting] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (user && !authLoading) {
            router.push('/dashboard')
        }
    }, [user, authLoading, router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSubmitting(true)

        try {
            const result = await login(email, password)

            if (result.success) {
                setSuccess('Login successful! Redirecting...')
                // Redirect is handled in AuthContext, but let's clear form
                setEmail('')
                setPassword('')
            } else {
                setError(result.error || 'Login failed')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    // Rename submitting to loading for UI compatibility
    const loading = submitting || authLoading;

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#FFFBF2] dark:bg-[#0B1120]">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Image
                    src="/image1.png"
                    width={800}
                    height={800}
                    alt='Background Pattern'
                    className='w-full h-full object-cover'
                    priority
                />
            </div>

            <div className="w-full max-w-md relative z-10 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-full mb-6 shadow-sm">
                        <Shield className="w-10 h-10 text-[#FF5C35]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-3">
                        Welcome Back
                    </h1>
                    <p className="text-[#2C1810]/70 dark:text-gray-400 text-lg">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Status Messages */}
                        {success && (
                            <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 animate-fade-in flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                                <p className="text-sm text-green-700 dark:text-green-300 font-medium">{success}</p>
                            </div>
                        )}
                        {error && (
                            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 animate-fade-in flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#2C1810]/80 dark:text-gray-300 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF5C35] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    placeholder="admin@example.com"
                                    className="block w-full pl-12 pr-5 py-4 bg-[#FFFBF2] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#FF5C35]/50 rounded-2xl text-[#2C1810] dark:text-white placeholder:text-gray-400 focus:outline-none transition-all font-medium disabled:opacity-70"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#2C1810]/80 dark:text-gray-300 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF5C35] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="••••••••"
                                    className="block w-full pl-12 pr-5 py-4 bg-[#FFFBF2] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#FF5C35]/50 rounded-2xl text-[#2C1810] dark:text-white placeholder:text-gray-400 focus:outline-none transition-all font-medium disabled:opacity-70"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FF5C35] hover:bg-[#e64722] text-white font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-lg shadow-[#FF5C35]/20 hover:shadow-xl hover:shadow-[#FF5C35]/30 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-[#2C1810]/60 dark:text-gray-500 font-medium">
                        Secure Authentication System
                    </p>
                </div>
            </div>
        </div>
    )
}