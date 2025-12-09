'use client';
import { useState } from 'react';
import { getAuth } from 'firebase/auth';

export default function SuperAdminSetup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        firebaseUid: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Auto-fill Firebase UID if user is logged in
    const getCurrentUser = () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                firebaseUid: user.uid
            }));
            setMessage('✅ Firebase user detected! UID auto-filled.');
        } else {
            setError('No Firebase user logged in. Please login first or enter UID manually.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/setup/super-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ ${data.message}\n\nYou can now login with your Firebase account!`);
                setFormData({ name: '', email: '', firebaseUid: '', phone: '' });
            } else {
                setError(data.message || 'Failed to create super admin');
            }
        } catch (err) {
            setError('Failed to connect to server. Make sure backend is running on http://localhost:5000');
            console.error('Setup error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
                    🔐 Super Admin Setup
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Create your first super admin account
                </p>

                <button
                    onClick={getCurrentUser}
                    className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Auto-Fill from Current Firebase User
                </button>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="your-email@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Firebase UID *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.firebaseUid}
                            onChange={(e) => setFormData({ ...formData, firebaseUid: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                            placeholder="Get from Firebase Console"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Firebase Console → Authentication → Users → Click your user → Copy UID
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone (Optional)
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Your phone number"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm whitespace-pre-line">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Super Admin'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600">
                        <strong>Note:</strong> This page only works once. After creating the first super admin,
                        this endpoint will be disabled for security.
                    </p>
                </div>
            </div>
        </div>
    );
}
