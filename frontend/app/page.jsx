
import ParticleBackground from '@/components/home/ParticleBackground'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import Features from '@/components/home/Features'
import Departments from '@/components/home/Departments'
import CTA from '@/components/home/CTA'
import NoticeBoardSection from '@/components/home/NoticeBoardSection'

export const metadata = {
  title: "Home",
  description: "Welcome to SPI Smart Campus - The official digital hub for Sylhet Polytechnic Institute. Access real-time class routines, teacher profiles, and academic notices.",
  keywords: ["SPI", "Sylhet Polytechnic Institute", "SPI Home", "Smart Campus", "Sylhet Education", "Polytechnic Diploma"],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-[#0B1120] overflow-x-clip transition-colors duration-300">
      <ParticleBackground />
      <Hero />
      <NoticeBoardSection />
      <Stats />
      <Features />
      <Departments />
      <CTA />
    </div>
  )
}
