"use client";
import React, { useEffect, useState } from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import { Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeModal() {
    const { consent, saveConsent, isLoaded } = usePreferences();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isLoaded && consent === null) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isLoaded, consent]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-4 right-4 z-50 w-full max-w-sm p-4"
            >
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-5 relative overflow-hidden">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-brand-orange/10 rounded-lg shrink-0">
                                <Cookie className="w-5 h-5 text-brand-orange" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-0.5">
                                We use cookies to improve your experience.
                                Accept to save your routine filters for next time.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <button
                                onClick={() => saveConsent('rejected')}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => saveConsent('accepted')}
                                className="flex-1 px-3 py-2 rounded-lg bg-brand-orange hover:bg-brand-red dark:hover:bg-brand-red dark:text-white text-xs font-medium shadow-sm text-gray-800 cursor-pointer dark:shadow-sm transition-colors"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
