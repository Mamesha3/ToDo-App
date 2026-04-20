"use client"

import { useState } from 'react'
import { useGetUserTodo } from '@/hooks/todoHook'
import AddToDo from './todoModule'
import { Card, CardContent, CardFooter, CardTitle} from '@/components/ui/card'
import { useAuth } from '@/context/useContext'
import { Button } from '@/components/ui/button'
import { Check, ClipboardClock, CloudCheck, X } from 'lucide-react'

export default function TodoList() {
    const { data, isLoading } = useGetUserTodo()
    const [isAdding, setIsAdding] = useState(false)
    const { user } = useAuth()
    
    console.log(data);
    

    if(isLoading) {
        return <Card className='shadow-lg rounded-lg w-40 px-8 flex justify-center border-0 flex-col items-center gap-2 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2'>
          <CardTitle className='font-semibold'>
             Loding..
          </CardTitle>
          <CardContent>
             <div className="w-5 h-5 opacity-60b bg-black opacity-40 rounded-full animate-bounce"></div>
          </CardContent>
        </Card>
    }

    if(!data || data.todo.length === 0) {
        return <Card className='shadow-lg rounded-lg w-80 px-8 border-0 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2'>
          <CardTitle className='font-semibold capitalize text-2xl flex justify-center items-center'>
             No todos found
          </CardTitle>
          {/* <CardContent>
             <div className="w-5 h-5 opacity-60b bg-black opacity-40 rounded-full animate-bounce"></div>
          </CardContent> */}
        </Card>
    }

    return (
        <div>
            {isAdding && <AddToDo setIsAdding={setIsAdding} />}
            <div className="mt-10 px-4 mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
              {data.todo.length > 0 && data.todo.map((todo: any) => (
                <Card key={todo.id} className='shadow-lg rounded-xl p-4 flex flex-col gap-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-semibold flex'>
                      {todo.title}
                      <span>{
                      todo.completed ? <CloudCheck className='scale-60 text-green-500 font-bold mt-[-5px]'/> 
                        : <ClipboardClock className='scale-60 font-bold text-red-800 mt-[-5px]'/>
                      }</span>
                    </h3>
                    <Button
                      variant={'default'}
                      className='rounded-full px-3 py-1 cursor-pointer active:scale-95 transition-all duration-150'
                      onClick={() => {
                        console.log({user, todo});
                      }}
                    >
                      {todo.completed ? <Check /> : <X />}
                    </Button>
                  </div>
                  <p className='text-sm text-gray-500'>{todo.content}</p>
                  <Button
                    variant='secondary'
                    className='flex justify-center w-full rounded-full px-3 py-1 cursor-pointer active:scale-95 transition-all duration-150'
                    onClick={() => {
                      console.log({user, todo});
                    }}
                  >
                    Change Status
                  </Button>
                </Card>
              ))}

              <div onClick={() => setIsAdding(prev => !prev)} className='flex flex-col items-center select-none shadow-md active:scale-95 p-2 rounded-3xl cursor-pointer'>
                    <div className='text-red-500 text-center font-black italic text-2xl'>No Data Found</div>
                    {/*  add todo */}
                    <div className="flex flex-col items-center justify-center opacity-50 cursor-pointer mt-5">
                        <span className='text-5xl font-bold'>+</span>
                        <span className='text-lg font-medium'>Add ToDo</span>
                    </div>
                    <div className='h-1 bg-gray-200 rounded-full mt-2'></div>
                </div>
              
            </div>
        </div>
    )
}