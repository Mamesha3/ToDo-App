"use client"
import { useConversations, useUsers } from '../hooks/messageHook'
import { useAuth } from '../context/useContext'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, UserPlus, Search } from 'lucide-react'
import { useState } from 'react'

type User = {
    id: number
    name: string
    email: string
}

type Conversation = {
    user: User
    lastMessage: any
    unreadCount: number
}

export default function ConversationList({
    selectedUserId,
    onSelectConversation
}: {
    selectedUserId: string | null
    onSelectConversation: (userId: string, userName: string) => void
}) {
    const [showNewChat, setShowNewChat] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { user } = useAuth()
    const { conversations, loading: loadingConversations } = useConversations()
    const { users, loading: loadingUsers } = useUsers()

    const filteredUsers = users.filter((u: User) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loadingConversations || loadingUsers) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-gray-500"
            >
                Loading conversations...
            </motion.div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-white/50 backdrop-blur-sm">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-b border-gray-200/50 p-4 bg-white/80 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-xl text-gray-800">Messages</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNewChat(!showNewChat)}
                        className="p-2 bg-blue-500 cursor-pointer text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                    >
                        <UserPlus className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="relative"
                >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </motion.div>
            </motion.div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {conversations.length > 0 ? (
                        conversations
                            .filter((conv: Conversation) =>
                                conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((conv: Conversation, index: number) => (
                                <motion.div
                                    key={conv.user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onSelectConversation(conv.user.id.toString(), conv.user.name)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50/50 transition-all ${
                                        selectedUserId === conv.user.id.toString() ? 'bg-blue-100/50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                            {conv.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-800 truncate">{conv.user.name}</h3>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {conv.lastMessage?.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No conversations yet</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* New Chat Section */}
                <AnimatePresence>
                    {showNewChat && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200/50 p-4 bg-blue-50/30"
                        >
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Start new conversation
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((u: User, index: number) => (
                                        <motion.div
                                            key={u.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => {
                                                onSelectConversation(u.id.toString(), u.name)
                                                setShowNewChat(false)
                                            }}
                                            className="p-3 cursor-pointer hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
