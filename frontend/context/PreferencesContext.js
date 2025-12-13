"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PreferencesContext = createContext();

export const COOKIE_CONSENT_KEY = 'spi_cookie_consent'; // 'accepted' | 'rejected' | null
export const PREFERENCES_KEY = 'spi_user_preferences';

export function PreferencesProvider({ children }) {
    const [consent, setConsent] = useState(null);
    const [preferences, setPreferences] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Load initial state
    useEffect(() => {
        const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        const storedPrefs = localStorage.getItem(PREFERENCES_KEY);

        if (storedConsent) {
            setConsent(storedConsent);
        }

        if (storedPrefs) {
            try {
                setPreferences(JSON.parse(storedPrefs));
            } catch (e) {
                console.error("Failed to parse preferences", e);
                setPreferences({});
            }
        }
        setIsLoaded(true);
    }, []);

    // Save preferences whenever they change, if allowed
    useEffect(() => {
        if (!isLoaded) return;

        if (consent === 'accepted') {
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        } else if (consent === 'rejected') {
            // Only keep allowed keys (e.g., lastPath)
            const allowedPreferences = {
                lastPath: preferences.lastPath
            };
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allowedPreferences));
        }
    }, [preferences, consent, isLoaded]);

    // Save consent
    const saveConsent = (status) => {
        setConsent(status);
        localStorage.setItem(COOKIE_CONSENT_KEY, status);

        // If rejecting, clear non-essential data immediately
        if (status === 'rejected') {
            setPreferences(prev => ({
                lastPath: prev.lastPath || '/'
            }));
            // We consciously do NOT clear the localStorage key entirely, 
            // we just overwrite it with the filtered version in result of the Effect above running.
        }
    };

    // Track last visited page
    useEffect(() => {
        if (!isLoaded) return;

        // Ignore auth pages or special pages if needed, but for now track all
        setPreferences(prev => ({
            ...prev,
            lastPath: pathname
        }));
    }, [pathname, isLoaded]);

    const updatePreferences = (newPrefs) => {
        setPreferences(prev => ({
            ...prev,
            ...newPrefs
        }));
    };

    return (
        <PreferencesContext.Provider value={{
            consent,
            saveConsent,
            preferences,
            updatePreferences,
            isLoaded
        }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    return useContext(PreferencesContext);
}
