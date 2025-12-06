
import ParticleBackground from '@/components/home/ParticleBackground'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import Features from '@/components/home/Features'
import Departments from '@/components/home/Departments'
import CTA from '@/components/home/CTA'

export const metadata = {
  title: "Home",
  description: "Welcome to SPI Smart Campus - The official digital hub for Sylhet Polytechnic Institute. Access real-time class routines, teacher profiles, and academic notices.",
  keywords: ["SPI", "Sylhet Polytechnic Institute", "SPI Home", "Smart Campus", "Sylhet Education", "Polytechnic Diploma"],
};

export default function Home() {


  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-clip transition-colors duration-300">
      {/* Particle Background Effect */}
      <ParticleBackground />

      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <Stats />

      {/* Features Section */}
      <Features />

      {/* Departments Section */}
      <Departments />

      {/* CTA Section */}
      <CTA />
    </div>
  )
}
