import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getMessages, getConversations, getUsers } from '../lib/api'

type Message = {
    id: number
    senderId: number
    receiverId: number
    message: string
    createdAt: string
    sender: {
        id: number
        name: string
        email: string
    }
    receiver: {
        id: number
        name: string
        email: string
    }
}

type Conversation = {
    user: {
        id: number
        name: string
        email: string
    }
    lastMessage: Message
    unreadCount: number
}

type User = {
    id: number
    name: string
    email: string
}

interface MessageState {
    messages: Record<string, Message[]>
    conversations: Conversation[]
    users: User[]
    loading: boolean
    error: string | null
}

const initialState: MessageState = {
    messages: {},
    conversations: [],
    users: [],
    loading: false,
    error: null
}

// Async thunks
export const fetchMessages = createAsyncThunk(
    'messages/fetchMessages',
    async (receiverId: string) => {
        const response = await getMessages(receiverId)
        return { receiverId, messages: response.messages }
    }
)

export const fetchConversations = createAsyncThunk(
    'messages/fetchConversations',
    async () => {
        const response = await getConversations()
        return response.conversations
    }
)

export const fetchUsers = createAsyncThunk(
    'messages/fetchUsers',
    async () => {
        const response = await getUsers()
        return response.users
    }
)

const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        addMessage: (state, action: { payload: { receiverId: string; message: Message } }) => {
            const { receiverId, message } = action.payload
            if (!state.messages[receiverId]) {
                state.messages[receiverId] = []
            }
            state.messages[receiverId].push(message)
        },
        setMessages: (state, action: { payload: { receiverId: string; messages: Message[] } }) => {
            const { receiverId, messages } = action.payload
            state.messages[receiverId] = messages
        },
        clearMessages: (state, action: { payload: string }) => {
            delete state.messages[action.payload]
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch messages
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false
                const { receiverId, messages } = action.payload
                state.messages[receiverId] = messages
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch messages'
            })
            // Fetch conversations
            .addCase(fetchConversations.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.loading = false
                state.conversations = action.payload
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch conversations'
            })
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false
                state.users = action.payload
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch users'
            })
    }
})

export const { addMessage, setMessages, clearMessages } = messageSlice.actions
export default messageSlice.reducer
