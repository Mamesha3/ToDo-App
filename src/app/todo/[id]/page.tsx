"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Edit2, CheckCircle, Clock, Users, Share2, UserMinus, Trash2, MoreVertical, X, XCircle, Bold, Italic, Underline, List, ListOrdered, Sparkles } from 'lucide-react'
import { useGetUserTodo, useGetSharedTodos, useUpdateTodo, useDeleteTodo, useShareTodo, useUnshareTodo } from '@/hooks/todoHook'
import { useAuth } from '@/context/useContext'
import { getUsers } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function TodoDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const { user } = useAuth()
    const { data } = useGetUserTodo(user)
    const { data: sharedData } = useGetSharedTodos(user)
    const { mutate: updateTodo } = useUpdateTodo(user)
    const { mutate: deleteTodo } = useDeleteTodo(user)
    const { mutate: shareTodo } = useShareTodo(user)
    const { mutate: unshareTodo } = useUnshareTodo(user)

    const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
    const [showShareModal, setShowShareModal] = useState(false)
    const [showUnshareModal, setShowUnshareModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [completedAt, setCompletedAt] = useState<Date | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    const titleRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const textColorRef = useRef<HTMLInputElement>(null)
    const bgColorRef = useRef<HTMLInputElement>(null)

    const allTodos = [...(data?.todo || []), ...(sharedData?.sharedTodos || [])]
    const todo = allTodos.find((t: any) => String(t.id) === id)

    // Simple markdown parser to format AI-generated content
    function parseMarkdown(text: string): string {
        if (!text) return ''
        
        let html = text
        
        // Convert bold: **text** to <strong>text</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        
        // Convert headers: **Header**: to <h3>Header</h3>
        html = html.replace(/\*\*(.*?)\*\*:/g, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
        
        // Convert numbered lists (including nested like 1.1, 1.2)
        const lines = html.split('\n')
        let result = ''
        let inNumberedList = false
        let inBulletList = false
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const trimmedLine = line.trim()
            
            // Check for numbered list (1., 1.1, 2., etc.)
            if (/^\d+(\.\d+)*\./.test(trimmedLine)) {
                if (inBulletList) {
                    result += '</ul>'
                    inBulletList = false
                }
                if (!inNumberedList) {
                    result += '<ol class="list-decimal list-inside my-3 space-y-2">'
                    inNumberedList = true
                }
                const content = trimmedLine.replace(/^\d+(\.\d+)*\.\s*/, '')
                // Check if it's a sub-item (has decimal like 1.1)
                const isSubItem = /^\d+\.\d+\./.test(trimmedLine)
                if (isSubItem) {
                    result += `<li class="ml-6">${content}</li>`
                } else {
                    result += `<li>${content}</li>`
                }
            }
            // Check for bullet points
            else if (/^-\s/.test(trimmedLine)) {
                if (inNumberedList) {
                    result += '</ol>'
                    inNumberedList = false
                }
                if (!inBulletList) {
                    result += '<ul class="list-disc list-inside my-3 space-y-1">'
                    inBulletList = true
                }
                result += `<li>${trimmedLine.replace(/^-\s*/, '')}</li>`
            }
            // Regular text
            else {
                if (inNumberedList) {
                    result += '</ol>'
                    inNumberedList = false
                }
                if (inBulletList) {
                    result += '</ul>'
                    inBulletList = false
                }
                if (trimmedLine) {
                    result += `<p class="my-2">${trimmedLine}</p>`
                }
            }
        }
        
        // Close any open lists
        if (inNumberedList) {
            result += '</ol>'
        }
        if (inBulletList) {
            result += '</ul>'
        }
        
        html = result
        
        return html
    }

    useEffect(() => {
        if (todo) {
            setTitle(todo.title)
            setContent(todo.content)
            if (todo.completedAt) {
                setCompletedAt(new Date(todo.completedAt))
            } else {
                setCompletedAt(null)
            }
        }
    }, [todo])

    // Countdown timer
    useEffect(() => {
        if (!todo?.completedAt) {
            setTimeRemaining('')
            return
        }

        const updateCountdown = () => {
            const now = new Date().getTime()
            const due = new Date(todo.completedAt).getTime()
            const diff = due - now

            if (diff <= 0) {
                setTimeRemaining('Overdue')
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            let timeString = ''
            if (days > 0) timeString += `${days}d `
            if (hours > 0) timeString += `${hours}h `
            if (minutes > 0) timeString += `${minutes}m `
            timeString += `${seconds}s`

            setTimeRemaining(timeString)
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [todo?.completedAt])

    useEffect(() => {
        if (isEditing && contentRef.current) {
            contentRef.current.innerHTML = parseMarkdown(content)
            contentRef.current.focus()
        }
        if (isEditing && titleRef.current) {
            titleRef.current.focus()
        }
    }, [isEditing, content])

    function formatText(command: string, value?: string) {
        document.execCommand(command, false, value)
    }

    async function handleSave() {
        const contentValue = contentRef.current?.innerHTML || ''
        const completedAtValue = completedAt ? completedAt.toISOString() : null
        if (!title.trim() || !contentValue.trim()) {
            return
        }

        updateTodo({
            id: Number(id),
            data: {
                title: title.trim(),
                content: contentValue.trim(),
                completedAt: completedAtValue
            }
        })
        setContent(contentValue)
        setIsEditing(false)
    }

    function handleCancel() {
        if (todo) {
            setTitle(todo.title)
            setContent(todo.content)
            if (todo.completedAt) {
                setCompletedAt(new Date(todo.completedAt))
            } else {
                setCompletedAt(null)
            }
        }
        setIsEditing(false)
    }

    async function handleOpenShareModal() {
        setShowMenu(false)
        try {
            const response = await getUsers()
            const filteredUsers = response.users?.filter((u: any) => u.id !== user?.id) || []
            setUsers(filteredUsers)
            setShowShareModal(true)
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    }

    function handleShare(userId: number) {
        shareTodo({ todoId: Number(id), userId })
        setShowShareModal(false)
    }

    function handleUnshare(userId: number) {
        unshareTodo({ todoId: Number(id), userId })
        setShowUnshareModal(false)
    }

    function handleDelete() {
        setShowMenu(false)
        deleteTodo(Number(id))
        router.push('/')
    }

    if (!todo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="shadow-lg bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/')}
                        className="cursor-pointer hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        {todo.isOwner && (
                            <>
                                <Button
                                    variant={isEditing ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`cursor-pointer ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-slate-100'}`}
                                >
                                    {isEditing ? <CheckCircle className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                                    {isEditing ? 'Done' : 'Edit'}
                                </Button>
                                {isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancel}
                                        className="cursor-pointer text-slate-600 hover:bg-slate-100"
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="cursor-pointer hover:bg-slate-100"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                    <AnimatePresence>
                                        {showMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                                            >
                                                <button
                                                    onClick={handleOpenShareModal}
                                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm cursor-pointer"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    Share
                                                </button>
                                                {todo.sharedWith && todo.sharedWith.length > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setShowMenu(false)
                                                            setShowUnshareModal(true)
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm cursor-pointer"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                        Unshare
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`bg-white rounded-2xl shadow-xl border overflow-hidden ${todo.isSmart ? 'border-2 border-green-500 bg-gradient-to-br from-green-50 to-white' : 'border-slate-200/50'}`}
                >
                    {todo.isSmart && (
                        <div className="absolute top-4 right-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg" title="AI Generated">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                    {/* Status Bar */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            {todo.completed ? (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Completed</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Pending</span>
                                </div>
                            )}
                            {todo.sharedWith && todo.sharedWith.length > 0 && (
                                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-medium">Shared with {todo.sharedWith.length}</span>
                                </div>
                            )}
                            {todo.sharedBy && (
                                <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-medium">From {todo.sharedBy.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Note Content */}
                    <div className="p-8 md:p-12">
                        {/* Title */}
                        {isEditing ? (
                            <>
                                <input
                                    ref={titleRef}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-4xl font-bold mb-4 bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none pb-2 placeholder:text-slate-300"
                                    placeholder="Note title..."
                                />
                                <DatePicker
                                    selected={completedAt}
                                    onChange={(date: Date | null) => setCompletedAt(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    placeholderText="Complete By (Optional)"
                                    className="w-full text-sm mb-8 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:border-emerald-500 outline-none"
                                    isClearable
                                />
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold mb-4 text-slate-800 leading-tight">{todo.title}</h1>
                                {todo.completedAt && (
                                    <div className="mb-8 text-sm flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <span className="text-orange-600 font-semibold">{timeRemaining || 'Loading...'}</span>
                                        <span className="text-slate-400">({new Date(todo.completedAt).toLocaleString()})</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Content */}
                        {isEditing ? (
                            <>
                                {/* Rich Text Toolbar */}
                                <div className="flex flex-wrap items-center gap-1 mb-4 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => formatText('bold')}
                                        className="cursor-pointer hover:bg-slate-200"
                                        title="Bold"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => formatText('italic')}
                                        className="cursor-pointer hover:bg-slate-200"
                                        title="Italic"
                                    >
                                        <Italic className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => formatText('underline')}
                                        className="cursor-pointer hover:bg-slate-200"
                                        title="Underline"
                                    >
                                        <Underline className="w-4 h-4" />
                                    </Button>
                                    <div className="w-px h-6 bg-slate-300 mx-1" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => formatText('insertUnorderedList')}
                                        className="cursor-pointer hover:bg-slate-200"
                                        title="Bullet List"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => formatText('insertOrderedList')}
                                        className="cursor-pointer hover:bg-slate-200"
                                        title="Numbered List"
                                    >
                                        <ListOrdered className="w-4 h-4" />
                                    </Button>
                                    <div className="w-px h-6 bg-slate-300 mx-1" />
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-600">Text:</label>
                                        <input
                                            ref={textColorRef}
                                            type="color"
                                            onChange={(e) => formatText('foreColor', e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0"
                                            defaultValue="#000000"
                                            title="Text Color"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-600">Bg:</label>
                                        <input
                                            ref={bgColorRef}
                                            type="color"
                                            onChange={(e) => formatText('hiliteColor', e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0"
                                            defaultValue="#ffffff"
                                            title="Background Color"
                                        />
                                    </div>
                                </div>
                                <div
                                    ref={contentRef}
                                    contentEditable
                                    className="w-full min-h-[500px] text-lg leading-relaxed bg-transparent border-2 border-slate-200 focus:border-emerald-500 rounded-lg p-6 outline-none"
                                    style={{ minHeight: '500px' }}
                                />
                            </>
                        ) : (
                            <div
                                className="text-lg leading-relaxed text-slate-700 font-light mb-8"
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(todo.content) }}
                            />
                        )}

                        {/* Shared Users Section */}
                        {todo.isOwner && (
                            <div className="border-t border-slate-200 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-slate-600">Shared with</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleOpenShareModal}
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                    >
                                        <Share2 className="w-4 h-4 mr-1" />
                                        Share with others
                                    </Button>
                                </div>
                                {todo.sharedWith && todo.sharedWith.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {todo.sharedWith.map((user: any) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                                <button
                                                    onClick={() => handleUnshare(user.id)}
                                                    className="w-5 h-5 rounded-full bg-slate-200 hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                                    title="Unshare"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Not shared with anyone yet</p>
                                )}
                            </div>
                        )}

                        {/* Shared By Section */}
                        {todo.sharedBy && (
                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="text-sm font-semibold text-slate-600 mb-4">Shared by</h3>
                                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                        {todo.sharedBy.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-purple-700">{todo.sharedBy.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Save button for edit mode */}
                        {isEditing && (
                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-96 max-h-[500px] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-slate-800">Share Note</h3>
                                <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {users.length > 0 ? (
                                    users.map((u: any) => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleShare(u.id)}
                                            className="w-full p-4 text-left hover:bg-slate-50 rounded-xl flex items-center gap-4 transition-colors cursor-pointer"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{u.name}</p>
                                                <p className="text-sm text-slate-500">{u.email}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-8">No users available to share with</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unshare Modal */}
            <AnimatePresence>
                {showUnshareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowUnshareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-96 max-h-[500px] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-slate-800">Unshare Note</h3>
                                <button onClick={() => setShowUnshareModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">Select users to unshare:</p>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {todo.sharedWith && todo.sharedWith.length > 0 ? (
                                    todo.sharedWith.map((u: any) => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleUnshare(u.id)}
                                            className="w-full p-4 text-left hover:bg-red-50 rounded-xl flex items-center gap-4 transition-colors cursor-pointer"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{u.name}</p>
                                                <p className="text-sm text-slate-500">{u.email}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-8">This note is not shared with anyone</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 w-96 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-semibold text-slate-800 mb-3">Delete Note</h3>
                            <p className="text-slate-600 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="flex-1 cursor-pointer"
                                >
                                    Delete
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
