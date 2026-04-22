"use client"

import { useState, useEffect, useMemo } from 'react'
import { useGetUserTodo, useTodoCompleted, useDeleteTodo, useShareTodo, useUnshareTodo, useGetSharedTodos } from '@/hooks/todoHook'
import { getUsers } from '@/lib/api'
import AddToDo from './todoModule'
import { Card, CardContent, CardFooter, CardTitle} from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ClipboardClock, CloudCheck, Delete, EllipsisVertical, FilePenLine, X, Share2, Users, UserMinus, Eye, FilePlus, Clock } from 'lucide-react'
import { useAuth } from '@/context/useContext'
import { useRouter } from 'next/navigation'

export default function TodoList() {
    const router = useRouter()
    const { user } = useAuth()
    const { data, isLoading } = useGetUserTodo(user)
    const { data: sharedData } = useGetSharedTodos(user)
    const complatedToDo = useTodoCompleted(user)
    const deleteTodo = useDeleteTodo(user)
    const shareTodo = useShareTodo(user)
    const unshareTodo = useUnshareTodo(user)
    const [isAdding, setIsAdding] = useState(false)
    const [selectedTodo, setSelectedTodo] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const [showShareModal, setShowShareModal] = useState<string | null>(null)
    const [showUnshareModal, setShowUnshareModal] = useState<string | null>(null)
    const [users, setUsers] = useState<any[]>([])
    const [filter, setFilter] = useState<'all' | 'created' | 'shared'>('all')
    const [todoData, setTodoData] = useState<any | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<Record<number, string>>({})
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
      setIsAdding(true)

      setTodoData(data)
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
        if (filter === 'created') return !todo.sharedBy
        if (filter === 'shared') return !!todo.sharedBy
        return true
    }), [allTodos, filter])

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
                  <div className='flex gap-2 mb-6'>
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
                  </div>
                       {/*  add todo */}
                    <Button onClick={() => setIsAdding(prev => !prev)} className='hidden sm:flex items-center justify-between'>
                      Add ToDo<FilePlus  className='text-green-600 font-semibold'/>
                    </Button>
                </div>
            </div>

            <motion.div
              className={`mt-4 px-4 mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredTodos.length > 0 && filteredTodos.map((todo: any, index: number) => (
                <motion.div key={todo.id} custom={index} variants={itemVariants} className="h-full">
                  <Card className='shadow-lg rounded-xl p-4 flex flex-col gap-3 relative h-full'>
                    <div className='flex items-center justify-between flex-shrink-0'>
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
        </div>
    )
}