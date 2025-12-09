import { BASE_URL } from './config';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Something went wrong' }));
        throw new Error(error.message || 'API Error');
    }
    return response.json();
};

// Admin APIs
export const fetchAdminProfile = async () => {
    const res = await fetch(`${BASE_URL}/admins/profile`);
    return handleResponse(res);
};

export const updateAdminProfile = async (data) => {
    const res = await fetch(`${BASE_URL}/admins/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const fetchAdmins = async (page = 1, limit = 20) => {
    const res = await fetch(`${BASE_URL}/admins?page=${page}&limit=${limit}`);
    return handleResponse(res);
};

export const createAdmin = async (data) => {
    const res = await fetch(`${BASE_URL}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const registerAdmin = async (data) => {
    const res = await fetch(`${BASE_URL}/admins/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const deleteAdmin = async (id) => {
    const res = await fetch(`${BASE_URL}/admins/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(res);
};

export const unregisterAdmin = async (id) => {
    const res = await fetch(`${BASE_URL}/admins/unregister/${id}`, {
        method: 'PUT',
    });
    return handleResponse(res);
};
