import React from 'react'
import Departments from '@/components/home/Departments'
import Hero from '@/components/about/Hero'
import History from '@/components/about/History'
import Facilities from '@/components/about/Facilities'
import Mission from '@/components/about/Mission'
import Contact from '@/components/about/Contact'

export default function AboutPage() {

  return (
    <div className="min-h-screen overflow-x-clip bg-gray-950 text-white">
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
