import { Mail, MapPin, Phone } from 'lucide-react'
import React from 'react'

function Contact() {
    return (
        <section className="py-20 px-4 bg-[#FFFBF2] dark:bg-[#0B1120]">
            <div

                className="max-w-7xl mx-auto">
                <div data-aos='zoom-in' className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2C1810] dark:text-white mb-4">
                        Get In Touch
                    </h2>
                    <p className="text-[#2C1810]/70 dark:text-gray-400 text-lg">
                        We&apos;re here to answer your questions and provide information
                    </p>
                </div>
                <div data-aos='zoom-in' className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF5C35]/10">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-full border border-gray-100 dark:border-gray-800">
                                <MapPin className="w-8 h-8 text-[#FF5C35]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2C1810] dark:text-white">Address</h3>
                            <p className="text-[#2C1810]/70 dark:text-gray-400">
                                Borikandi, Technical Road<br />
                                Sylhet Sadar-3100<br />
                                Bangladesh
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF5C35]/10">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-full border border-gray-100 dark:border-gray-800">
                                <Phone className="w-8 h-8 text-[#FF5C35]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2C1810] dark:text-white">Phone</h3>
                            <p className="text-[#2C1810]/70 dark:text-gray-400">
                                02-9966-32529
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF5C35]/10">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-[#FFFBF2] dark:bg-[#0B1120] rounded-full border border-gray-100 dark:border-gray-800">
                                <Mail className="w-8 h-8 text-[#FF5C35]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2C1810] dark:text-white">Email</h3>
                            <p className="text-[#2C1810]/70 dark:text-gray-400 break-all">
                                principalsylhetpoly@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
                <div data-aos='zoom-in' className="mt-12 text-center">
                    <a
                        href="https://sylhet.polytech.gov.bd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#FF5C35] hover:bg-[#e64722] text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#FF5C35]/30"
                    >
                        Visit Official Website
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Contact
