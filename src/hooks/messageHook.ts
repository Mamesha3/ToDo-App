import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { RootState, AppDispatch } from '../redux/store'
import { fetchMessages, fetchConversations, fetchUsers, addMessage, setMessages } from '../redux/messageSlice'

export const useMessages = (receiverId: string) => {
    const dispatch = useDispatch<AppDispatch>()
    const messages = useSelector((state: RootState) => state.messages.messages[receiverId] || [])
    const loading = useSelector((state: RootState) => state.messages.loading)
    const error = useSelector((state: RootState) => state.messages.error)

    useEffect(() => {
        if (receiverId) {
            dispatch(fetchMessages(receiverId))
        }
    }, [dispatch, receiverId])

    return { messages, loading, error }
}

export const useConversations = () => {
    const dispatch = useDispatch<AppDispatch>()
    const conversations = useSelector((state: RootState) => state.messages.conversations)
    const loading = useSelector((state: RootState) => state.messages.loading)
    const error = useSelector((state: RootState) => state.messages.error)

    useEffect(() => {
        dispatch(fetchConversations())
    }, [dispatch])

    return { conversations, loading, error }
}

export const useUsers = () => {
    const dispatch = useDispatch<AppDispatch>()
    const users = useSelector((state: RootState) => state.messages.users)
    const loading = useSelector((state: RootState) => state.messages.loading)
    const error = useSelector((state: RootState) => state.messages.error)

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    return { users, loading, error }
}

export const useMessageActions = () => {
    const dispatch = useDispatch<AppDispatch>()

    return {
        addMessage: (receiverId: string, message: any) => {
            dispatch(addMessage({ receiverId, message }))
        },
        setMessages: (receiverId: string, messages: any[]) => {
            dispatch(setMessages({ receiverId, messages }))
        }
    }
}
