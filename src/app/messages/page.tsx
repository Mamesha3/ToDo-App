"use client"
import { useState } from 'react'
import { useAuth } from '../../context/useContext'
import ConversationList from '../../components/ConversationList'
import ChatBox from '../../components/ChatBox'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [selectedUserName, setSelectedUserName] = useState<string>('')
    const { user } = useAuth()

    const handleSelectConversation = (userId: string, userName: string) => {
        setSelectedUserId(userId)
        setSelectedUserName(userName)
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
            className="h-[calc(100vh-70px)] md:h-[calc(100vh-64px)] flex"
        >
            {/* Conversation List - Hidden on mobile when chat is open */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`w-80 border-r bg-white/50 backdrop-blur-sm ${selectedUserId ? 'hidden md:block' : 'block'}`}
            >
                <ConversationList
                    selectedUserId={selectedUserId}
                    onSelectConversation={handleSelectConversation}
                />
            </motion.div>

            {/* Chat Area */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className={`flex-1 ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}
            >
                {selectedUserId ? (
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
