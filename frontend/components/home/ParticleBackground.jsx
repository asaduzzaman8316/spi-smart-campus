'use client'
import { useEffect, useState } from 'react'

export default function ParticleBackground() {
    const [particles, setParticles] = useState([])

    useEffect(() => {
        // Use setTimeout to avoid synchronous state update warning and ensure client-side only generation
        const timer = setTimeout(() => {
            const newParticles = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                delay: Math.random() * 5,
                duration: 5 + Math.random() * 10
            }))
            setParticles(newParticles)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    if (particles.length === 0) return null

    return (
        <div className="fixed inset-0 pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
                    style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`
                    }}
                />
            ))}
        </div>
    )
}
