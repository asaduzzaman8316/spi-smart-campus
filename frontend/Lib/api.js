import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
export const fetchTeachers = async () => {
    const { data } = await api.get('/teachers');
    return data && data.data ? data.data : data; // Handle pagination structure
};

export const createTeacher = async (teacherData) => {
    const { data } = await api.post('/teachers', teacherData);
    return data;
};

export const updateTeacher = async (id, teacherData) => {
    const { data } = await api.put(`/teachers/${id}`, teacherData);
    return data;
};

export const deleteTeacher = async (id) => {
    const { data } = await api.delete(`/teachers/${id}`);
    return data;
};

export const fetchTeacherByUid = async (uid) => {
    // This was for firebase UID. Now we use ID. 
    // If components pass UID, we might need to adjust.
    // But for now, map to profile/:id
    const { data } = await api.get(`/teachers/profile/${uid}`);
    return data;
};

// Routines
export const fetchRoutines = async () => {
    const { data } = await api.get('/routines');
    return data;
};

export const createRoutine = async (routineData) => {
    const { data } = await api.post('/routines', routineData);
    return data;
};

export const updateRoutine = async (id, routineData) => {
    const { data } = await api.put(`/routines/${id}`, routineData);
    return data;
};

export const deleteRoutine = async (id) => {
    const { data } = await api.delete(`/routines/${id}`);
    return data;
};

// Rooms
export const fetchRooms = async () => {
    const { data } = await api.get('/rooms');
    return data;
};

export const createRoom = async (roomData) => {
    const { data } = await api.post('/rooms', roomData);
    return data;
};

export const updateRoom = async (id, roomData) => {
    const { data } = await api.put(`/rooms/${id}`, roomData);
    return data;
};

export const deleteRoom = async (id) => {
    const { data } = await api.delete(`/rooms/${id}`);
    return data;
};

// Subjects
export const fetchSubjects = async () => {
    const { data } = await api.get('/subjects');
    return data;
};

export const createSubject = async (subjectData) => {
    const { data } = await api.post('/subjects', subjectData);
    return data;
};

export const updateSubject = async (id, subjectData) => {
    const { data } = await api.put(`/subjects/${id}`, subjectData);
    return data;
};

export const deleteSubject = async (id) => {
    const { data } = await api.delete(`/subjects/${id}`);
    return data;
};

