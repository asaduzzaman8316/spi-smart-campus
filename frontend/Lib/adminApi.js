import api from './api';

// Admin APIs
export const fetchAdminProfile = async () => {
    const { data } = await api.get('/admins/profile');
    return data;
};


export const updateAdminProfile = async (data) => {
    const { data: responseData } = await api.put('/admins/profile', data);
    return responseData;
};

export const fetchAdmins = async (page = 1, limit = 20) => {
    const { data } = await api.get(`/teachers/admins?page=${page}&limit=${limit}`);
    return data;
};

export const createAdmin = async (data) => {
    const { data: responseData } = await api.post('/admins', data);
    return responseData;
};

// Register is deprecated/removed in JWT version, but keeping signature for now or removing?
// Let's keep it but throw error or point to create
export const registerAdmin = async (data) => {
    // This endpoint is 501 on backend now
    const { data: responseData } = await api.post('/admins/register', data);
    return responseData;
};

export const deleteAdmin = async (id) => {
    const { data } = await api.delete(`/admins/${id}`);
    return data;
};

export const unregisterAdmin = async (id) => {
    const { data } = await api.put(`/teachers/unregister/${id}`);
    return data;
};
