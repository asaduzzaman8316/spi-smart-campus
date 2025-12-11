'use client'
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Lock, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react'

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
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden pt-18 transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden ">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-start/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-mid/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-end/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-brand-start to-brand-mid rounded-2xl mb-4 shadow-lg shadow-brand-start/50">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent mb-2">
                        Admin Login
                    </h1>
                    <p className="text-text-secondary">Access the SPI Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-card-bg/80 rounded-3xl p-8 border border-border-color shadow-xl dark:shadow-2xl backdrop-blur-sm transition-colors duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Success Message */}
                        {success && (
                            <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/50 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                    <p className="text-sm text-green-400 font-medium">{success}</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/50 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                    <p className="text-sm text-red-400 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-brand-mid" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    placeholder="admin@example.com"
                                    className="block w-full pl-12 pr-4 py-3 bg-background border border-border-color rounded-xl text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-mid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-brand-end" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="••••••••"
                                    className="block w-full pl-12 pr-4 py-3 bg-background border border-border-color rounded-xl text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-mid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-linear-to-r from-brand-start via-brand-mid to-brand-end hover:from-brand-mid hover:via-brand-mid hover:to-brand-end text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-start/50 hover:shadow-xl hover:shadow-brand-start/60 hover:scale-105"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-border-color">
                        <p className="text-center text-sm text-text-secondary">
                            Secure admin access for Sylhet Polytechnic Institute
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-text-secondary">
                        Protected by Firebase Authentication
                    </p>
                </div>
            </div>
        </div>
    )
}