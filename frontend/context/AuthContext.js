'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../Lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });

            localStorage.setItem('token', data.token);
            setUser(data);
            toast.success(`Welcome back, ${data.name}!`);

            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info('Logged out successfully');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
