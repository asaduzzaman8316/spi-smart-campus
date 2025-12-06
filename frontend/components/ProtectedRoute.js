'use client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function ProtectedRoute({ children }) {
    const isLoggedIn = useSelector((state) => state.auth.login)
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Wait a moment for Redux to initialize
        const timer = setTimeout(() => {
            setIsChecking(false)

            // If not logged in, redirect to login
            if (!isLoggedIn) {
                router.push('/login')
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [isLoggedIn, router])

    // Show loading while checking
    if (isChecking || !isLoggedIn) {
        return (
            <div className="flex items-center bg-gray-800 justify-center min-h-screen ">
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

    // If logged in, show the content
    return <>{children}</>
}