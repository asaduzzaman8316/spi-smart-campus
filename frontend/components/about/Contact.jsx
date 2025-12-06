import { Mail, MapPin, Phone } from 'lucide-react'
import React from 'react'

function Contact() {
    return (
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
            <div

                className="max-w-7xl mx-auto">
                <div data-aos='zoom-in' className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        Get In Touch
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        We&apos;re here to answer your questions and provide information
                    </p>
                </div>
                <div data-aos='zoom-in' className="grid md:grid-cols-3 gap-6">
                    <div className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Address</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Borikandi, Technical Road<br />
                                Sylhet Sadar-3100<br />
                                Bangladesh
                            </p>
                        </div>
                    </div>
                    <div data-aos='zoom-in' className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-pink-500 transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-linear-to-br from-pink-500 to-red-500 rounded-2xl">
                                <Phone className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Phone</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                02-9966-32529
                            </p>
                        </div>
                    </div>
                    <div data-aos='zoom-in' className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-red-500 transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-linear-to-br from-red-500 to-pink-500 rounded-2xl">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Email</h3>
                            <p className="text-gray-500 dark:text-gray-400 break-all">
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
                        className="inline-block bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                    >
                        Visit Official Website
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Contact
