"use client"
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/useContext'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Bot, Sparkles } from 'lucide-react'

type AIMessage = {
    id: number
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

export default function AIChatBox({ onBack }: { onBack?: () => void }) {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<AIMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const { user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageIdCounter = useRef(Date.now())

    // Load conversation history on mount
    useEffect(() => {
        const loadConversationHistory = async () => {
            if (!user?.id) return

            try {
                const response = await fetch('http://localhost:5000/api/ai/conversation', {
                    method: 'GET',
                    credentials: 'include'
                })

                const data = await response.json()

                if (response.ok && data.messages && data.messages.length > 0) {
                    setMessages(data.messages)
                } else {
                    // Show welcome message if no history
                    setMessages([
                        {
                            id: messageIdCounter.current++,
                            role: 'assistant',
                            content: "Hello! I'm your AI assistant. I can help you with your todos, task planning, productivity tips, and more. How can I assist you today?",
                            timestamp: new Date().toISOString()
                        }
                    ])
                }
            } catch (error) {
                console.error('Error loading conversation history:', error)
                // Show welcome message on error
                setMessages([
                    {
                        id: messageIdCounter.current++,
                        role: 'assistant',
                        content: "Hello! I'm your AI assistant. I can help you with your todos, task planning, productivity tips, and more. How can I assist you today?",
                        timestamp: new Date().toISOString()
                    }
                ])
            } finally {
                setIsLoadingHistory(false)
            }
        }

        loadConversationHistory()
    }, [user?.id])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const sendMessage = async () => {
        if (!message.trim() || !user?.id) return

        const userMessage: AIMessage = {
            id: messageIdCounter.current++,
            role: 'user',
            content: message.trim(),
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setMessage('')
        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message: userMessage.content
                })
            })

            const data = await response.json()

            if (response.ok && data.response) {
                const aiMessage: AIMessage = {
                    id: messageIdCounter.current++,
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                }
                setMessages(prev => [...prev, aiMessage])
            } else {
                throw new Error(data.msg || 'Failed to get AI response')
            }
        } catch (error) {
            console.error('Error sending message to AI:', error)
            const errorMessage: AIMessage = {
                id: messageIdCounter.current++,
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="flex flex-col w-full h-full bg-gradient-to-br from-white to-purple-50/30">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sm:mt-17 border-b border-gray-200/50 p-4 bg-gradient-to-r from-purple-50 to-white backdrop-blur-sm shadow-sm"
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    AI Assistant
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                </h2>
                                <p className="text-xs font-medium text-purple-600">Always online</p>
                            </div>
                        </div>
                    </div>
                    {onBack && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="cursor-pointer md:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
                            title="Switch to user chat"
                        >
                            <Bot className="w-5 h-5 text-gray-600" />
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingHistory ? (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading conversation...</div>
                ) : (
                    <>
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] md:max-w-[60%] rounded-2xl p-4 shadow-sm ${
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                    >
                                        <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                                        <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                        <div className="flex gap-2">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className="w-2 h-2 bg-purple-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                                                className="w-2 h-2 bg-purple-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                                                className="w-2 h-2 bg-purple-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="sm:h-10 border-t border-gray-200/50 p-4 bg-white/80 backdrop-blur-sm"
            >
                <div className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask AI anything..."
                        disabled={isLoading}
                        className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all disabled:opacity-50"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={!message.trim() || isLoading}
                        className="cursor-pointer bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}
