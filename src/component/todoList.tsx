"use client"

import { useState } from 'react'
import { useGetUserTodo, useTodoCompleted, useDeleteTodo } from '@/hooks/todoHook'
import AddToDo from './todoModule'
import { Card, CardContent, CardFooter, CardTitle} from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ClipboardClock, CloudCheck, Delete, EllipsisVertical, FilePenLine, X } from 'lucide-react'

export default function TodoList() {
    const { data, isLoading } = useGetUserTodo()
    const complatedToDo = useTodoCompleted()
    const deleteTodo = useDeleteTodo()
    const [isAdding, setIsAdding] = useState(false)
    const [selectedTodo, setSelectedTodo] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

    const [todoData, setTodoData] = useState<any | null>(null)
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

    if(!data || !data?.todo || data.todo.length === 0) {
        return (
            <>
                {isAdding && <AddToDo setIsAdding={setIsAdding} />}
                <Card className='shadow-lg rounded-lg w-80 px-8 border-0 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2'>
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
        <div className=''>
            {isAdding && <AddToDo setIsAdding={setIsAdding} seteTodoD={setTodoData} todoD={todoData} />}
            <motion.div
              className={`mt-10 px-4 mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {data.todo.length > 0 && data.todo.map((todo: any, index: number) => (
                <motion.div key={todo.id} custom={index} variants={itemVariants}>
                  <Card className='shadow-lg rounded-xl p-4 flex flex-col gap-3 relative'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-xl font-semibold flex'>
                        {todo.title}
                        <span title={todo.completed ? 'completed' : 'pending'}>{
                        todo.completed ? <CloudCheck className='scale-60 text-green-500 font-bold mt-[-5px]'/> 
                          : <ClipboardClock className='scale-60 font-bold text-red-800 mt-[-5px]'/>
                        }</span>
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
                    <p className='text-sm text-gray-500'>{todo.content}</p>
                    <MotionButton animate={{ scale: 1.05 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    title={`change status to ${todo.completed ? 'pending' : 'completed'}`}                    variant='secondary'
                      className='flex justify-center w-full rounded-full px-3 py-1 cursor-pointer active:scale-95 transition-all duration-150 mt-auto'
                      onClick={() => complatedToDo.mutate(todo.id)}
                    >
                      Change Status
                    </MotionButton>
                    {selectedTodo === todo.id && (
                      <div className="absolute top-3 right-5 w-58 bg-white shadow-2xl rounded-lg py-2 px-3 z-[100] border border-gray-200">
                        <span onClick={() => setSelectedTodo(null)} className='absolute right-3 top-2 cursor-pointer text-red-800 hover:text-red-600'><X /></span>
                        <div className="flex flex-col gap-1 mt-5">
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
                    )}

                    {/* yes or no model for deletion */}
                    {showDeleteConfirm === todo.id && (
                      <div className="absolute top-3 right-5 w-64 bg-white shadow-2xl rounded-lg py-3 px-4 z-[100] border border-gray-200">
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
                    )}
                  </Card>
                </motion.div>
              ))}

              {data.todo.length < 5 && <div onClick={() => setIsAdding(prev => !prev)} className='flex flex-col items-center select-none shadow-lg border-1 mb-5 active:scale-95 p-2 rounded-3xl cursor-pointer'>
                    {/*  add todo */}
                    <div className="flex flex-col items-center justify-center opacity-50 cursor-pointer mt-5">
                        <span className='text-5xl font-bold'>+</span>
                        <span className='text-lg font-medium'>Add ToDo</span>
                    </div>
                    <div className='h-1 bg-gray-200 rounded-full mt-2'></div>
              </div>}
            </motion.div>
              

           {/* if todo length show rounded button at bottom-8 rigth-5 */}
           {data.todo.length >= 5 && (
            <div title='add todo' className='w-10 h-10 rounded-full fixed bottom-20 right-5 bg-green-500 text-white font-bold sm:hidden'>
              <Button
                variant='default'
                className='w-full h-full rounded-full px-3 py-1 cursor-pointer active:scale-95 transition-all duration-150'
                onClick={() => setIsAdding(true)}
              >
                +
              </Button>
            </div>    
           )}
        </div>
    )
}