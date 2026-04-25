"use client"

import { useState, useEffect, useMemo } from 'react'
import { useGetUserTodo, useTodoCompleted, useDeleteTodo, useShareTodo, useUnshareTodo, useGetSharedTodos, useAddTodo } from '@/hooks/todoHook'
import { getUsers } from '@/lib/api'
import AddToDo from './todoModule'
import { Card, CardContent, CardFooter, CardTitle} from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ClipboardClock, CloudCheck, Delete, EllipsisVertical, FilePenLine, X, Share2, Users, UserMinus, Eye, FilePlus, Clock, ArrowRight, Plus, Columns3Cog, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/useContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/component/Toast'

export default function TodoList() {
    const router = useRouter()
    const { user } = useAuth()
    const { data, isLoading } = useGetUserTodo(user)
    const { data: sharedData } = useGetSharedTodos(user)
    const { showToast } = useToast()
    const complatedToDo = useTodoCompleted(user)
    const deleteTodo = useDeleteTodo(user)
    const shareTodo = useShareTodo(user)
    const unshareTodo = useUnshareTodo(user)
    const { mutate: addTodo } = useAddTodo(user)
    const [isAdding, setIsAdding] = useState(false)
    const [selectedTodo, setSelectedTodo] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const [showShareModal, setShowShareModal] = useState<string | null>(null)
    const [showUnshareModal, setShowUnshareModal] = useState<string | null>(null)
    const [showSmartTodoModal, setShowSmartTodoModal] = useState(false)
    const [smartTodoGoal, setSmartTodoGoal] = useState('')
    const [isGeneratingTodos, setIsGeneratingTodos] = useState(false)
    const [showOptionsModal, setShowOptionsModal] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [filter, setFilter] = useState<'all' | 'created' | 'shared' | 'smart'>('all')
    const [todoData, setTodoData] = useState<any | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<Record<number, string>>({})
    const [selectedTodos, setSelectedTodos] = useState<Set<number>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(9)
    const MotionButton = motion(Button)

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    }

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4 + (index * 0.3),
          delay: index * 0.1
        }
      })
    }
    
    function handleEdit(data: any) {
      setSelectedTodo(null)
      setShowDeleteConfirm(null)
      
      // If it's an AI-generated todo, redirect to todo[id] page
      if (data.isSmart) {
        router.push(`/todo/${data.id}`)
      } else {
        setIsAdding(true)
        setTodoData(data)
      }
    }

    async function handleOpenShareModal(todoId: string) {
      setSelectedTodo(null)
      try {
        const response = await getUsers()
        const filteredUsers = response.users?.filter((u: any) => u.id !== user?.id) || []
        setUsers(filteredUsers)
        setShowShareModal(todoId)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }

    function handleShare(todoId: string, userId: number) {
      shareTodo.mutate({ todoId: Number(todoId), userId })
      setShowShareModal(null)
    }

    function handleOpenUnshareModal(todoId: string) {
      setSelectedTodo(null)
      setShowUnshareModal(todoId)
    }

    function handleUnshare(todoId: string, userId: number) {
      unshareTodo.mutate({ todoId: Number(todoId), userId })
      setShowUnshareModal(null)
    }

    async function handleGenerateSmartTodos() {
      if (!smartTodoGoal.trim()) return

      setIsGeneratingTodos(true)
      try {
        const response = await fetch('http://localhost:5000/api/todo/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ goal: smartTodoGoal })
        })

        const data = await response.json()

        if (response.status === 429) {
          showToast('warning', 'Limit Reached', data.msg || 'You reached your daily limit')
          return
        }

        if (data.todos && Array.isArray(data.todos)) {
          showToast('success', 'Todos Generated', `Generated ${data.todos.length} smart todos`)
          // Redirect to review page with generated todos
          const todosParam = encodeURIComponent(JSON.stringify(data.todos))
          router.push(`/smart-todos?todos=${todosParam}`)
          setShowSmartTodoModal(false)
          setSmartTodoGoal('')
        }
      } catch (error) {
        console.error('Error generating todos:', error)
        showToast('error', 'Generation Failed', 'Failed to generate smart todos')
      } finally {
        setIsGeneratingTodos(false)
      }
    }

    async function handleGenerateSpecialTodo() {
      if (!smartTodoGoal.trim()) return

      setIsGeneratingTodos(true)
      try {
        const response = await fetch('http://localhost:5000/api/todo/generate-special', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ goal: smartTodoGoal })
        })

        const data = await response.json()

        if (response.status === 429) {
          showToast('warning', 'Limit Reached', data.msg || 'You reached your daily limit')
          return
        }

        if (data.title && data.content) {
          showToast('success', 'Special Todo Generated', 'AI generated a special todo for you')
          // Redirect to add page with pre-filled data
          const titleParam = encodeURIComponent(data.title)
          const contentParam = encodeURIComponent(data.content)
          router.push(`/add?title=${titleParam}&content=${contentParam}&isSmart=true`)
          setShowSmartTodoModal(false)
          setSmartTodoGoal('')
        }
      } catch (error) {
        console.error('Error generating special todo:', error)
        showToast('error', 'Generation Failed', 'Failed to generate special todo')
      } finally {
        setIsGeneratingTodos(false)
      }
    }

    function handleToggleSelectTodo(todoId: number) {
        const newSelected = new Set(selectedTodos)
        if (newSelected.has(todoId)) {
            newSelected.delete(todoId)
        } else {
            newSelected.add(todoId)
        }
        setSelectedTodos(newSelected)
    }

    function handleSelectAll() {
        if (selectedTodos.size === filteredTodos.length) {
            setSelectedTodos(new Set())
        } else {
            setSelectedTodos(new Set(filteredTodos.map((todo: any) => todo.id)))
        }
    }

    function handleBulkDelete() {
        const count = selectedTodos.size
        selectedTodos.forEach(todoId => {
            deleteTodo.mutate(todoId)
        })
        setSelectedTodos(new Set())
        showToast('success', 'Todos Deleted', `Successfully deleted ${count} todo${count > 1 ? 's' : ''}`)
    }

    function stripHtml(html: string) {
        const tmp = document.createElement('div')
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ''
    }

    function truncateText(html: string, maxLength: number) {
        const tmp = document.createElement('div')
        tmp.innerHTML = html
        const text = tmp.textContent || tmp.innerText || ''
        if (text.length <= maxLength) return html
        return text.substring(0, maxLength) + '...'
    }

    const allTodos = useMemo(() => [...(data?.todo || []), ...(sharedData?.sharedTodos || [])], [data?.todo, sharedData?.sharedTodos])
    
    const filteredTodos = useMemo(() => allTodos.filter((todo: any) => {
        if (filter === 'all') return true
        if (filter === 'created') return !todo.sharedBy && !todo.isSmart
        if (filter === 'shared') return !!todo.sharedBy
        if (filter === 'smart') return !!todo.isSmart
        return true
    }), [allTodos, filter])

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [filter])

    // Calculate pagination
    const totalPages = Math.ceil(filteredTodos.length / itemsPerPage)
    const paginatedTodos = filteredTodos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    useEffect(() => {
        const updateCountdowns = () => {
            const now = new Date().getTime()
            const newTimeRemaining: Record<number, string> = {}

            allTodos.forEach((todo: any) => {
                if (todo.completedAt) {
                    const due = new Date(todo.completedAt).getTime()
                    const diff = due - now

                    if (diff <= 0) {
                        newTimeRemaining[todo.id] = 'Overdue'
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

                    newTimeRemaining[todo.id] = timeString
                }
            })

            setTimeRemaining(newTimeRemaining)
        }

        updateCountdowns()
        const interval = setInterval(updateCountdowns, 1000)

        return () => clearInterval(interval)
    }, [allTodos])

    if(isLoading) {
        return (
            <>
                {isAdding && <AddToDo setIsAdding={setIsAdding} seteTodoD={setTodoData} />}
                <Card className='shadow-lg rounded-lg w-40 px-8 flex justify-center border-0 flex-col items-center gap-2 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2'>
                  <CardTitle className='font-semibold'>
                     Loding..
                  </CardTitle>
                  <CardContent>
                     <div className="w-5 h-5 opacity-60b bg-black opacity-40 rounded-full animate-bounce"></div>
                  </CardContent>
                </Card>
            </>
        )
    }

    if(!data || (!data?.todo || data.todo.length === 0) && (!sharedData || !sharedData?.sharedTodos || sharedData.sharedTodos.length === 0)) {
        return (
            <>
                {isAdding && <AddToDo setIsAdding={setIsAdding} />}
                <Card className='mt-30 sm:mt-40 shadow-lg rounded-lg w-80 px-8 border-0 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2'>
                  <CardTitle className='font-semibold capitalize text-2xl flex justify-center items-center'>
                     No todos found
                  </CardTitle>
                  <CardFooter onClick={() => setIsAdding(true)} className='opacity-60 cursor-pointer bg-transparent flex flex-col gap-1 '>
                    <span className='text-3xl font-bold'>+</span>
                    <h3 className='text-lg font-semibold'>Add Todo</h3>
                  </CardFooter>
                </Card>
            </>
        )
    }

    return (
        <div className='sm:mt-20'>
            {isAdding && <AddToDo setIsAdding={setIsAdding} seteTodoD={setTodoData} todoD={todoData} />}
            
            {/* Filter Buttons */}
            <div className="mt-10 px-4 mx-auto max-w-4xl">
                <div className="flex item-center justify-between">
                  <div className='flex gap-2 mb-6 flex-wrap'>
                      <Button
                          variant={filter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilter('all')}
                          className="cursor-pointer"
                      >
                          All
                      </Button>
                      <Button
                          variant={filter === 'created' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilter('created')}
                          className="cursor-pointer"
                      >
                          Created
                      </Button>
                      <Button
                          variant={filter === 'shared' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilter('shared')}
                          className="cursor-pointer"
                      >
                          Shared with me
                      </Button>
                      <Button
                          variant={filter === 'smart' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilter('smart')}
                          className="cursor-pointer"
                      >
                          Smart AI
                      </Button>
                      {filteredTodos.length > 0 && (
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSelectAll}
                              className="cursor-pointer"
                          >
                              {selectedTodos.size === filteredTodos.length ? 'Deselect All' : 'Select All'}
                          </Button>
                      )}
                  </div>
                  <div className='flex gap-2'>
                      {selectedTodos.size > 0 && (
                          <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleBulkDelete}
                              className="cursor-pointer"
                          >
                              <Delete className="w-4 h-4 mr-2" />
                              Delete ({selectedTodos.size})
                          </Button>
                      )}
                      <Button onClick={() => setShowOptionsModal(true)} className='hidden sm:flex items-center justify-between'>
                          Add ToDo<FilePlus  className='text-green-600 font-semibold'/>
                        </Button>
                  </div>
                </div>
            </div>

            <motion.div
              className={`mt-4 px-4 mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {paginatedTodos.length > 0 && paginatedTodos.map((todo: any, index: number) => (
                <motion.div key={todo.id} custom={index} variants={itemVariants} className="h-full">
                  <Card className={`shadow-lg rounded-xl p-4 flex flex-col gap-3 relative h-full ${selectedTodos.has(todo.id) ? 'border-2 border-blue-500 bg-blue-50' : ''} ${todo.isSmart ? 'border-2 border-green-500 bg-gradient-to-br from-green-50 to-white' : ''}`}>
                    {todo.isSmart && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center" title="AI Generated">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className='flex items-center justify-between flex-shrink-0'>
                      <div className="flex items-center gap-2">
                        <div 
                          className="cursor-pointer scale-60 absolute top-1 left-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleSelectTodo(todo.id)
                          }}
                        >
                          {selectedTodos.has(todo.id) ? (
                            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-sm" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                          )}
                        </div>
                        <h3 className='text-xl font-semibold flex items-center gap-2 line-clamp-1'>
                        {todo.title.split(' ')[0] + (todo.title.split(' ').length > 1 ? '...' : '')}
                        <span title={todo.completed ? 'completed' : 'pending'}>{
                        todo.completed ? <CloudCheck className='scale-60 text-green-500 font-bold mt-[-10px] ml-[-7px]'/>
                          : <ClipboardClock className='scale-60 font-bold text-red-800 mt-[-10px] ml-[-7px]'/>
                        }</span>
                        {todo.sharedWith && todo.sharedWith.length > 0 && (
                          <div className='flex items-center gap-1' title={`Shared with ${todo.sharedWith.map((u: any) => u.name).join(', ')}`}>
                            <Users className='w-4 h-4 text-blue-500' />
                            <span className='text-xs text-blue-500'>{todo.sharedWith.length}</span>
                          </div>
                        )}
                        {todo.sharedBy && (
                          <div className='flex items-center gap-1' title={`Shared by ${todo.sharedBy.name}`}>
                            <Users className='w-4 h-4 text-purple-500' />
                            <span className='text-xs text-purple-500'>From {todo.sharedBy.name}</span>
                          </div>
                        )}
                        {todo.completedAt && (
                          <span title={`Due: ${new Date(todo.completedAt).toLocaleString()}`} className='flex items-center gap-1 text-orange-600 text-xs font-semibold'>
                            <Clock className='w-3 h-3' />
                            {timeRemaining[todo.id] || 'Loading...'}
                          </span>
                        )}
                      </h3>
                      </div>
                      <Button
                      title='todo setting'
                        variant={'default'}
                        className='bg-transparent text-black text-30 rounded-full px-3 py-1 cursor-pointer active:scale-95 transition-all duration-150'
                        onClick={() => {
                          setSelectedTodo(todo.id);
                        }}
                      >
                        <EllipsisVertical />
                      </Button>
                    </div>
                    <p 
                        className='text-sm text-gray-500 line-clamp-2 flex-grow overflow-hidden'
                        dangerouslySetInnerHTML={{ __html: todo.content }}
                    />
                    <MotionButton animate={{ scale: 1.05 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    title={`change status to ${todo.completed ? 'pending' : 'completed'}`}                    variant='secondary'
                      className='flex justify-center w-full rounded-full px-3 py-1 cursor-pointer active:scale-95 transition-all duration-150 mt-auto'
                      onClick={() => complatedToDo.mutate(todo.id)}
                    >
                      Change Status
                    </MotionButton>
                    {/* confirm model */}
                    {selectedTodo === todo.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setSelectedTodo(null)}>
                        <div className="bg-white shadow-2xl rounded-lg py-4 px-6 w-64" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Todo Actions</h3>
                            <button onClick={() => setSelectedTodo(null)} className="cursor-pointer text-gray-500 hover:text-gray-700">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                setSelectedTodo(null)
                                router.push(`/todo/${todo.id}`)
                              }}
                             className='cursor-pointer w-full hover:bg-slate-50 hover:text-slate-800 rounded-md p-2 flex items-center gap-2 text-sm font-medium transition-colors'>
                              <Eye className='w-4 h-4' /> View
                            </button>
                            {todo.isOwner && (
                              <button
                              onClick={() => handleOpenShareModal(todo.id)}
                               className='cursor-pointer w-full hover:bg-green-50 hover:text-green-600 rounded-md p-2 flex items-center gap-2 text-sm font-medium transition-colors'>
                                <Share2 className='w-4 h-4' /> Share
                              </button>
                            )}
                            {todo.isOwner && todo.sharedWith && todo.sharedWith.length > 0 && (
                              <button
                              onClick={() => handleOpenUnshareModal(todo.id)}
                               className='cursor-pointer w-full hover:bg-orange-50 hover:text-orange-600 rounded-md p-2 flex items-center gap-2 text-sm font-medium transition-colors'>
                                <UserMinus className='w-4 h-4' /> Unshare
                              </button>
                            )}
                            <button
                            onClick={() => {
                                setShowDeleteConfirm(todo.id)
                                setSelectedTodo(null)
                              }}
                             className='cursor-pointer w-full hover:bg-red-50 hover:text-red-600 rounded-md p-2 flex items-center gap-2 text-sm font-medium transition-colors'>
                              <Delete className='w-4 h-4' /> Delete
                            </button>
                            <button
                            onClick={() => handleEdit(todo)}
                             className='cursor-pointer w-full hover:bg-blue-50 hover:text-blue-600 rounded-md p-2 flex items-center gap-2 text-sm font-medium transition-colors'>
                              <FilePenLine className='w-4 h-4' /> Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* yes or no model for deletion */}
                    {showDeleteConfirm === todo.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowDeleteConfirm(null)}>
                        <div className="bg-white shadow-2xl rounded-lg py-3 px-4 w-64" onClick={(e) => e.stopPropagation()}>
                          <p className='text-center font-bold text-red-900 text-sm mb-3'>Are you sure you want to delete this task?</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                deleteTodo.mutate(todo.id)
                                setShowDeleteConfirm(null)
                              }} 
                              className='cursor-pointer flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md p-2 text-sm transition-colors'
                            >
                              Yes
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(null)} 
                              className='cursor-pointer flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md p-2 text-sm transition-colors'
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Share modal */}
                    {showShareModal === todo.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowShareModal(null)}>
                        <div className="bg-white rounded-lg p-4 w-80 max-h-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Share Todo</h3>
                            <button onClick={() => setShowShareModal(null)} className="text-gray-500 hover:text-gray-700">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {users.length > 0 ? (
                              users.map((u: any) => (
                                <button
                                  key={u.id}
                                  onClick={() => handleShare(todo.id, u.id)}
                                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{u.name}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-4">No users available to share with</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Unshare modal */}
                    {showUnshareModal === todo.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowUnshareModal(null)}>
                        <div className="bg-white rounded-lg p-4 w-80 max-h-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Unshare Todo</h3>
                            <button onClick={() => setShowUnshareModal(null)} className="text-gray-500 hover:text-gray-700">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Select users to unshare:</p>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {todo.sharedWith && todo.sharedWith.length > 0 ? (
                              todo.sharedWith.map((u: any) => (
                                <button
                                  key={u.id}
                                  onClick={() => handleUnshare(todo.id, u.id)}
                                  className="w-full p-3 text-left hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{u.name}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-4">This todo is not shared with anyone</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-6 px-4 mx-auto max-w-4xl flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="cursor-pointer"
                    >
                        Previous
                    </Button>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="cursor-pointer w-10"
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="cursor-pointer"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Smart Todo Modal */}
            {showSmartTodoModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100" onClick={() => setShowSmartTodoModal(false)}>
                <div className="bg-white shadow-2xl rounded-lg py-4 px-6 w-96" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Smart Todo Generator</h3>
                    <button onClick={() => setShowSmartTodoModal(false)} className="cursor-pointer text-gray-500 hover:text-gray-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Enter your goal (e.g., Learn React in 5 days)"
                      value={smartTodoGoal}
                      onKeyDown={(e) => e.key === 'Enter' ? handleGenerateSmartTodos() : null}
                      onChange={(e) => setSmartTodoGoal(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerateSmartTodos}
                        disabled={isGeneratingTodos || !smartTodoGoal.trim()}
                        className="flex-1 cursor-pointer"
                        variant="outline"
                      >
                        {isGeneratingTodos ? 'Generating...' : 'Generate List'}
                      </Button>
                      <Button
                        onClick={handleGenerateSpecialTodo}
                        disabled={isGeneratingTodos || !smartTodoGoal.trim()}
                        className="flex-1 cursor-pointer"
                        variant="default"
                      >
                        {isGeneratingTodos ? 'Generating...' : 'Generate Special'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Options Modal */}
            {showOptionsModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-100" 
                onClick={() => setShowOptionsModal(false)}
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white shadow-2xl rounded-2xl p-8 w-96" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-2xl text-gray-800">Add Todo</h3>
                    <button onClick={() => setShowOptionsModal(false)} className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowOptionsModal(false)
                        setIsAdding(true)
                      }}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-5 shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <Columns3Cog className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-lg">Custom Todo</h4>
                          <p className="text-blue-100 text-sm">Create your own todo manually</p>
                        </div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowOptionsModal(false)
                        setShowSmartTodoModal(true)
                      }}
                      className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl p-5 shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-lg">Smart Todo</h4>
                          <p className="text-green-100 text-sm">Let AI generate todos for you</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
        </div>
    )
}