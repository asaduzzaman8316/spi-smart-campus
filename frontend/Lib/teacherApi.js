import api from './api';

// Teacher Profile APIs
export const fetchTeacherProfile = async (id) => {
    const { data } = await api.get(`/teachers/profile/${id}`);
    return data;
};

export const updateTeacherProfile = async (id, profileData) => {
    const { data } = await api.put(`/teachers/${id}`, profileData);
    return data;
};

// Re-export common teacher functions from api.js for convenience
export {
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    unregisterTeacher
} from './api';
