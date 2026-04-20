import axios from 'axios'

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const axiosInstance = axios.create({
    baseURL: api,
    withCredentials: true
})

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        
        // Skip refresh for logout requests or if explicitly marked via header
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.headers['skip-auth-refresh']) {
            originalRequest._retry = true
            try {
                await axios.post(`${api}/refresh`, {}, { withCredentials: true })
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                // Only redirect if not already on login or signup page
                if (typeof window !== 'undefined' && 
                    window.location.pathname !== '/login' && 
                    window.location.pathname !== '/signup') {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }
        
        return Promise.reject(error)
    }
)

export const registerUser = async (data: any) => {
    try {
        const res = await axiosInstance.post('/register', data)
        return res.data
    } catch (error: any) {
        const message = error.response?.data?.msg || error.message || 'Registration failed'
        throw new Error(message)
    }
}

export const loginUser = async (data: any) => {
    try {
        const res = await axiosInstance.post('/login', data)
        return res.data
    } catch (error: any) {
        const message = error.response?.data?.msg || error.message || 'Login failed'
        throw new Error(message)
    }
}

export const logoutUser = async () => {
    try {
        const res = await axiosInstance.post('/logout', {}, { 
            headers: { 'skip-auth-refresh': 'true' } 
        })
        return res.data
    } catch (error: any) {
        // Don't throw error on 401 during logout - token invalidation is expected
        if (error.response?.status === 401) {
            return { success: true }
        }
        const message = error.response?.data?.msg || error.message || 'Logout failed'
        throw new Error(message)
    }
}

export const refreshToken = async () => {
    try {
        const res = await axiosInstance.post('/refresh', {}, { 
            headers: { 'skip-auth-refresh': 'true' } 
        })
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const updateUserProfile = async (data: any) => {
    try {
        const res = await axiosInstance.put('/user/profile', data)
        return res.data
    } catch (error: any) {
        const message = error.response?.data?.msg || error.message || 'Profile update failed'
        throw new Error(message)
    }
}

export const addTodo = async (data: any) => {
    try {
        const res = await axiosInstance.post('/todo', data)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const getUserTodo = async () => {
    try {
        const res = await axiosInstance.get('/todo')
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const updateUserTodo = async ({id, data}: {id: any, data: any}) => {
    try {
        const res = await axiosInstance.put(`/todo/${id}`, data)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const todoCompleted = async (id: any) => {
    try {
        const res = await axiosInstance.patch(`/todo/${id}`)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const deleteTodo = async (id: any) => {
    try {
        const res = await axiosInstance.delete(`/todo/${id}`)
        return res.data
    } catch (error) {
        console.log(error)
    }
}