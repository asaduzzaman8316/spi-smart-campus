import React from 'react'
import Departments from '@/components/home/Departments'
import Hero from '@/components/about/Hero'
import History from '@/components/about/History'
import Facilities from '@/components/about/Facilities'
import Mission from '@/components/about/Mission'
import Contact from '@/components/about/Contact'

export const metadata = {
  title: "About SPI - History, Mission & Facilities",
  description: "Learn about Sylhet Polytechnic Institute's rich history since 1955, our mission to empower future engineers, and our state-of-the-art academic facilities.",
  keywords: ["About SPI", "Sylhet Polytechnic History", "SPI Mission", "Polytechnic Facilities", "Sylhet Engineering Education"],
};

export default function AboutPage() {

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      {/* Hero Section */}
      <Hero />

      {/* History Section */}
      <History />

      {/* Departments Section */}
      <Departments />

      {/* Facilities Section */}
      <Facilities />

      {/* Mission & Vision Section */}
      <Mission />

      {/* Contact Section */}
      <Contact />
    </div>
  )
}
