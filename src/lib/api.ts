import axios from 'axios'

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const registerUser = async (data: any) => {
    try {
        const res = await axios.post(`${api}/register`, data, { withCredentials: true })
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const loginUser = async (data: any) => {
    try {
        const res = await axios.post(`${api}/login`, data)
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const logoutUser = async () => {
    try {
        const res = await axios.post(`${api}/logout`)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const addTodo = async (data: any) => {
    try {
        const res = await axios.post(`${api}/todo`, data)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const getUserTodo = async () => {
    try {
        const res = await axios.get(`${api}/todo`, { withCredentials: true })
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const updateUserTodo = async ({id, data}: {id: any, data: any}) => {
    try {
        const res = await axios.put(`${api}/todo/${id}`, data)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const todoCompleted = async (id: any) => {
    try {
        const res = await axios.patch(`${api}/todo/${id}`)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const deleteTodo = async (id: any) => {
    try {
        const res = await axios.delete(`${api}/todo/${id}`)
        return res.data
    } catch (error) {
        console.log(error)
    }
}