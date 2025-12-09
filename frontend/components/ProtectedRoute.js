'use client'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="flex items-center bg-gray-50 dark:bg-gray-900 justify-center min-h-screen transition-colors duration-300">
                <div className='size-36'>
                    <DotLottieReact
                        src="/Loading.lottie"
                        loop
                        autoplay
                    />
                </div>
            </div>
        )
    }

    // If not logged in (and effect hasn't fired yet), don't render children
    if (!user) {
        return null;
    }

    // If logged in, show the content
    return <>{children}</>
}