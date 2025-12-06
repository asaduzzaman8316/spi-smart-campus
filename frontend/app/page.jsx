
import ParticleBackground from '@/components/home/ParticleBackground'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import Features from '@/components/home/Features'
import Departments from '@/components/home/Departments'
import CTA from '@/components/home/CTA'

export default function Home() {
  

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-clip">
      {/* Particle Background Effect */}
      <ParticleBackground />

      {/* Hero Section */}
      <Hero  />

      {/* Stats Section */}
      <Stats  />

      {/* Features Section */}
      <Features />

      {/* Departments Section */}
      <Departments />

      {/* CTA Section */}
      <CTA />
    </div>
  )
}
