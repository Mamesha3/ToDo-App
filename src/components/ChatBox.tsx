"use client"
import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../context/useContext'
import { useMessages, useMessageActions } from '../hooks/messageHook'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, MessageSquare } from 'lucide-react'

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

export default function ChatBox({ receiverId, receiverName, onBack }: { receiverId: string; receiverName: string; onBack?: () => void }) {
    const [message, setMessage] = useState('')
    const [localMessages, setLocalMessages] = useState<Message[]>([])
    const [isReceiverOnline, setIsReceiverOnline] = useState(false)
    const socket = useSocket()
    const { user } = useAuth()
    const { messages: reduxMessages, loading } = useMessages(receiverId)
    const { addMessage: addMessageToRedux, setMessages: setMessagesInRedux } = useMessageActions()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (reduxMessages.length > 0) {
            setLocalMessages(reduxMessages)
        }
    }, [reduxMessages])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [localMessages])

    useEffect(() => {
        if (!socket || !user?.id || !receiverId) return

        const roomId = [user.id, receiverId].sort().join('_')
        socket.emit('join_conversation', { userId: user.id, receiverId })

        // Emit that current user is online
        socket.emit('user_online', user.id)

        // Check if receiver is online
        socket.emit('check_online_status', receiverId)

        // Listen for user status changes
        socket.on('user_status', (data: { userId: string; status: string }) => {
            if (data.userId === receiverId) {
                setIsReceiverOnline(data.status === 'online')
            }
        })

        socket.on('receive_message', (newMessage: Message) => {
            addMessageToRedux(receiverId, newMessage)
        })

        socket.on('message_error', (error: any) => {
            console.error('Message error:', error)
        })

        return () => {
            socket.emit('leave_conversation', { userId: user.id, receiverId })
            socket.emit('user_offline', user.id)
            socket.off('user_status')
            socket.off('receive_message')
            socket.off('message_error')
        }
    }, [socket, user?.id, receiverId, addMessageToRedux])

    const sendMessage = () => {
        if (!message.trim() || !socket || !user?.id) return

        socket.emit('send_message', {
            senderId: user.id,
            receiverId,
            message: message.trim()
        })
        setMessage('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="flex flex-col w-full h-full bg-gradient-to-br from-white to-blue-50/30">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-b border-gray-200/50 p-4 bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm shadow-sm"
            >
                <div className="flex items-center gap-3">
                    {onBack && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="cursor-pointer md:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </motion.button>
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
                                {receiverName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">{receiverName}</h2>
                                <div className="flex items-center gap-1">
                                    <motion.div
                                        animate={isReceiverOnline ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                        transition={{ duration: 2, repeat: isReceiverOnline ? Infinity : 0 }}
                                        className={`w-2 h-2 rounded-full ${isReceiverOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                                    />
                                    <p className={`text-xs font-medium ${isReceiverOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                        {isReceiverOnline ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {onBack && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="cursor-pointer md:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
                            title="Open conversations"
                        >
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading messages...</div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {localMessages.map((msg, index) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`flex ${msg.senderId === Number(user?.id) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] md:max-w-[60%] rounded-2xl p-4 shadow-sm ${
                                        msg.senderId === Number(user?.id)
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm md:text-base">{msg.message}</p>
                                    <p className={`text-xs mt-2 ${msg.senderId === Number(user?.id) ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border-t border-gray-200/50 p-4 bg-white/80 backdrop-blur-sm"
            >
                <div className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}
