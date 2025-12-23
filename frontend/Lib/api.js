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

        // Add API Key
        config.headers['x-api-key'] = process.env.NEXT_PUBLIC_APP_API_TOKEN;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
export const fetchTeachers = async (search = '', department = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);

    const { data } = await api.get(`/teachers${params.toString() ? '?' + params.toString() : ''}`);
    return data && data.data ? data.data : data;
};

// Deprecated: kept for backward compatibility if needed, but redirects to non-paginated
export const fetchPaginatedTeachers = async (page = 1, limit = 9, search = '', department = '') => {
    return fetchTeachers(search, department);
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
    // Request a large limit to get all routines (since filtering happens on frontend)
    const { data } = await api.get('/routines?limit=1000');
    return data && data.data ? data.data : data;
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

export const analyzeLoad = async (department, semester, shift) => {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester);
    if (shift) params.append('shift', shift);

    const { data } = await api.get(`/routines/analyze-load${params.toString() ? '?' + params.toString() : ''}`);
    return data;
};


// Rooms
export const fetchRooms = async (search = '', type = '', location = '', department = '', sort = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (location) params.append('location', location);
    if (department) params.append('department', department);
    if (sort) params.append('sort', sort);

    const { data } = await api.get(`/rooms${params.toString() ? '?' + params.toString() : ''}`);
    return data && data.data ? data.data : data;
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
    const { data } = await api.get('/subjects?limit=1000');
    return data && data.data ? data.data : data;
};

export const fetchPaginatedRooms = async (page = 1, limit = 9, search = '', type = '') => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    const { data } = await api.get(`/rooms?${params.toString()}`);
    return data;
};

// ... existing code ...

export const fetchPaginatedSubjects = async (page = 1, limit = 9, search = '', department = '', semester = '') => {
    // Ignoring page/limit, fetching all matching subjects
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester);
    // Use large limit to simulate 'all'
    params.append('limit', '1000');

    const { data } = await api.get(`/subjects?${params.toString()}`);
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

// Departments
export const fetchDepartments = async () => {
    const { data } = await api.get('/departments');
    // Departments might not use pagination middleware everywhere, but safekeeping:
    return data && data.data ? data.data : data;
};

// Unregister
export const unregisterTeacher = async (id) => {
    const { data } = await api.put(`/teachers/unregister/${id}`);
    return data;
};

// Notices
export const fetchNotices = async (category = '', department = '', limit = '') => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (department) params.append('department', department);
    if (limit) params.append('limit', limit);

    const { data } = await api.get(`/notices?${params.toString()}`);
    return data;
};

export const createNotice = async (noticeData) => {
    const { data } = await api.post('/notices', noticeData);
    return data;
};

export const updateNotice = async (id, noticeData) => {
    const { data } = await api.put(`/notices/${id}`, noticeData);
    return data;
};

export const deleteNotice = async (id) => {
    const { data } = await api.delete(`/notices/${id}`);
    return data;
};

// Quizzes
export const fetchQuizzes = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'All') {
            params.append(key, filters[key]);
        }
    });

    const { data } = await api.get(`/quizzes?${params.toString()}`);
    return data;
};

export const fetchMyQuizzes = async () => {
    const { data } = await api.get('/quizzes/my-quizzes');
    return data;
};

export const createQuiz = async (quizData) => {
    const { data } = await api.post('/quizzes', quizData);
    return data;
};

export const deleteQuiz = async (id) => {
    const { data } = await api.delete(`/quizzes/${id}`);
    return data;
};

export const toggleQuizStatus = async (id) => {
    const { data } = await api.put(`/quizzes/${id}/status`);
    return data;
};

export const verifyQuizAccess = async (id, accessCode) => {
    const { data } = await api.post(`/quizzes/${id}/access`, { accessCode });
    return data;
};

export const fetchQuizForStudent = async (id) => {
    const { data } = await api.get(`/quizzes/${id}/start`);
    return data;
};

export const submitQuiz = async (id, submissionData) => {
    const { data } = await api.post(`/quizzes/${id}/submit`, submissionData);
    return data;
};

export const fetchQuizResults = async (id, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'All') {
            params.append(key, filters[key]);
        }
    });

    const { data } = await api.get(`/quizzes/${id}/results?${params.toString()}`);
    return data;
};
// Questions (Question Bank)
export const fetchQuestions = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'All') {
            params.append(key, filters[key]);
        }
    });

    const { data } = await api.get(`/questions?${params.toString()}`);
    return data;
};

export const createQuestion = async (questionData) => {
    const { data } = await api.post('/questions', questionData);
    return data;
};

export const updateQuestion = async (id, questionData) => {
    const { data } = await api.put(`/questions/${id}`, questionData);
    return data;
};

export const deleteQuestion = async (id) => {
    const { data } = await api.delete(`/questions/${id}`);
    return data;
};
