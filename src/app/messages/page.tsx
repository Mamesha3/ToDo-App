"use client"
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../../context/useContext'
import ConversationList from '../../components/ConversationList'
import ChatBox from '../../components/ChatBox'
import AIChatBox from '../../components/AIChatBox'
import { motion } from 'framer-motion'
import { MessageSquare, Bot, Users } from 'lucide-react'

export default function MessagesPage() {
    const searchParams = useSearchParams()
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [selectedUserName, setSelectedUserName] = useState<string>('')
    const [chatMode, setChatMode] = useState<'user' | 'ai'>('user')
    const { user } = useAuth()

    // Check URL parameter for AI mode or direct user conversation
    useEffect(() => {
        const mode = searchParams.get('mode')
        const userId = searchParams.get('userId')
        const userName = searchParams.get('userName')

        if (mode === 'ai') {
            setChatMode('ai')
            setSelectedUserId(null)
        } else if (userId && userName) {
            setSelectedUserId(userId)
            setSelectedUserName(decodeURIComponent(userName))
            setChatMode('user')
        }
    }, [searchParams])

    const handleSelectConversation = (userId: string, userName: string) => {
        setSelectedUserId(userId)
        setSelectedUserName(userName)
        setChatMode('user')
    }

    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-screen"
            >
                Please login to access messages
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100vh-70px)] md:h-[calc(100vh-64px)] flex sm:20"
        >
            {/* Sidebar - Conversation List or AI Mode */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`w-80 border-r bg-white/50 backdrop-blur-sm flex flex-col ${selectedUserId || chatMode === 'ai' ? 'hidden md:flex' : 'flex'}`}
            >
                {/* Chat Mode Toggle */}
                <div className="p-4 border-b bg-white/80 sm:mt-18">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChatMode('user')}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                chatMode === 'user'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">Users</span>
                        </button>
                        <button
                            onClick={() => {
                                setChatMode('ai')
                                setSelectedUserId(null)
                            }}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                chatMode === 'ai'
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Bot className="w-4 h-4" />
                            <span className="text-sm font-medium">AI Chat</span>
                        </button>
                    </div>
                </div>

                {/* Conversation List - Only show in user mode */}
                {chatMode === 'user' && (
                    <ConversationList
                        selectedUserId={selectedUserId}
                        onSelectConversation={handleSelectConversation}
                    />
                )}

                {/* AI Mode Info */}
                {chatMode === 'ai' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="mb-4"
                        >
                            <Bot className="w-16 h-16 text-purple-400" />
                        </motion.div>
                        <p className="text-gray-600 text-sm">
                            Chat with AI assistant for help with your todos and tasks
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Chat Area */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className={`flex-1 ${!selectedUserId && chatMode !== 'ai' ? 'hidden md:flex' : 'flex'}`}
            >
                {chatMode === 'ai' ? (
                    <AIChatBox onBack={() => setChatMode('user')} />
                ) : selectedUserId ? (
                    <ChatBox
                        receiverId={selectedUserId}
                        receiverName={selectedUserName}
                        onBack={() => setSelectedUserId(null)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="mb-4"
                        >
                            <MessageSquare className="w-24 h-24 text-blue-400" />
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg font-medium"
                        >
                            Select a conversation to start messaging
                        </motion.p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}
