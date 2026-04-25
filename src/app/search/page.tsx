"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/useContext'
import Navbar from '@/component/navbar'
import { Search, FileText, User, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<{ todos: any[], users: any[] }>({ todos: [], users: [] })
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setResults({ todos: [], users: [] })
            return
        }

        setIsLoading(true)
        try {
            const [todoRes, userRes] = await Promise.all([
                fetch(`http://localhost:5000/api/search/todos?q=${encodeURIComponent(query)}`, { credentials: 'include' }),
                fetch(`http://localhost:5000/api/search/users?q=${encodeURIComponent(query)}`, { credentials: 'include' })
            ])

            const todoData = await todoRes.json()
            const userData = await userRes.json()

            setResults({
                todos: todoData.todos || [],
                users: userData.users || []
            })
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            handleSearch(searchQuery)
        }, 300)

        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    const handleTodoClick = (todoId: number) => {
        router.push(`/todo/${todoId}`)
    }

    const handleUserClick = (userId: number, userName: string) => {
        router.push(`/messages?userId=${userId}&userName=${encodeURIComponent(userName)}`)
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Please login to search</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 py-8 sm:mt-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Search</h1>
                    <p className="text-gray-600">Search your todos or find other users to message</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search todos or users..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-lg"
                        />
                    </div>
                </motion.div>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                    >
                        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 mt-2">Searching...</p>
                    </motion.div>
                )}

                {!isLoading && searchQuery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Todos Results */}
                        {results.todos.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Todos ({results.todos.length})
                                </h2>
                                <div className="space-y-3">
                                    {results.todos.map((todo: any) => (
                                        <motion.div
                                            key={todo.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleTodoClick(todo.id)}
                                            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg cursor-pointer border border-gray-200 transition-all"
                                        >
                                            <h3 className="font-semibold text-gray-900 mb-1">{todo.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">{todo.content?.substring(0, 100)}...</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${todo.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {todo.completed ? 'Completed' : 'Pending'}
                                                </span>
                                                {todo.isSmart && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                                        AI Generated
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Users Results */}
                        {results.users.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Users ({results.users.length})
                                </h2>
                                <div className="space-y-3">
                                    {results.users.map((u: any) => (
                                        <motion.div
                                            key={u.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleUserClick(u.id, u.name)}
                                            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg cursor-pointer border border-gray-200 transition-all flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{u.name}</h3>
                                                <p className="text-sm text-gray-600">{u.email}</p>
                                            </div>
                                            <MessageSquare className="w-5 h-5 text-gray-400" />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* No Results */}
                        {results.todos.length === 0 && results.users.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
