'use client'
import { useDispatch } from "react-redux"
import { setLogin } from "@/Lib/features/auth/authReducer"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/Lib/features/firebase/config"
import { useRouter } from "next/navigation"
import { Lock, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminLogin() {
    const dispatch = useDispatch()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            // Sign in with Firebase
            await signInWithEmailAndPassword(auth, email, password)

            // Login successful
            dispatch(setLogin({
                email: email,
            }))

            setSuccess('Login successful! Redirecting...')

            // Clear form
            setEmail('')
            setPassword('')

            // Redirect after 1 second
            setTimeout(() => {
                router.push('/dashboard')
            }, 1000)
        } catch (error) {
            // Handle Firebase errors
            let errorMessage = 'Invalid email or password'

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email'
                    break
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password'
                    break
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address'
                    break
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled'
                    break
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later'
                    break
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection'
                    break
                default:
                    errorMessage = 'Login failed. Please try again'
            }

            setError(errorMessage)
            console.error('Login error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden pt-18">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden ">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
                        Admin Login
                    </h1>
                    <p className="text-gray-400">Access the SPI Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl backdrop-blur-sm">
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-purple-400" />
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
                                    className="block w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring focus:ring-purple-500  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-pink-400" />
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
                                    className="block w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring focus:ring-purple-500  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-linear-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-105"
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
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-center text-sm text-gray-400">
                            Secure admin access for Sylhet Polytechnic Institute
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Protected by Firebase Authentication
                    </p>
                </div>
            </div>
        </div>
    )
}