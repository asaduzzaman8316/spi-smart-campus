import { createSlice } from "@reduxjs/toolkit";

// Initial state should be the same on server and client
const initialState = {
    login: false,
    user: null,
    role: null, // 'super_admin', 'department_admin', or 'teacher'
    isHydrated: false // Track if we've loaded from localStorage
}

export const authSlicer = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLogin: (state, action) => {
            state.login = true
            state.user = action.payload || null
            state.role = action.payload?.role || null

            // Persist to localStorage (only on client)
            if (typeof window !== 'undefined') {
                localStorage.setItem('isLoggedIn', 'true')
                if (action.payload) {
                    localStorage.setItem('user', JSON.stringify(action.payload))
                    if (action.payload.role) {
                        localStorage.setItem('userRole', action.payload.role)
                    }
                }
            }
        },
        setLogout: (state) => {
            state.login = false
            state.user = null
            state.role = null

            // Clear localStorage (only on client)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('user')
                localStorage.removeItem('userRole')
            }
        },
        // New action to restore from localStorage
        hydrateAuth: (state) => {
            if (typeof window !== 'undefined') {
                const isLoggedIn = localStorage.getItem('isLoggedIn')
                const user = localStorage.getItem('user')
                const role = localStorage.getItem('userRole')

                if (isLoggedIn === 'true') {
                    state.login = true
                    state.user = user ? JSON.parse(user) : null
                    state.role = role || null
                }
                state.isHydrated = true
            }
        }
    }
})

export const { setLogin, setLogout, hydrateAuth } = authSlicer.actions

// Selectors
export const selectIsLogin = (state) => state.auth.login
export const selectUser = (state) => state.auth.user
export const selectUserRole = (state) => state.auth.role
export const selectIsHydrated = (state) => state.auth.isHydrated

export default authSlicer.reducer