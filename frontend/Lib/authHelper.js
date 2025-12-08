import { getAuth } from 'firebase/auth';

/**
 * Get Firebase ID token for authenticated user
 * @returns {Promise<string>} Firebase ID token
 */
export const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error('No authenticated user');
    }

    try {
        const token = await user.getIdToken();
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        throw error;
    }
};

/**
 * Get authorization headers for API requests
 * @returns {Promise<Object>} Headers object with Authorization
 */
export const getAuthHeaders = async () => {
    try {
        const token = await getAuthToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    } catch (error) {
        console.error('Error getting auth headers:', error);
        return {
            'Content-Type': 'application/json'
        };
    }
};

/**
 * Make authenticated API request
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
    const headers = await getAuthHeaders();

    return fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });
};
