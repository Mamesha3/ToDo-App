"use client"

import { useGetUserTodo } from '@/hooks/todoHook'

export default function TodoList() {
    const { data, isLoading } = useGetUserTodo()

    if(isLoading) {
        return <div>Loading...</div>
    }

    if(!data) {
        return(
            <div className='shadow-sm py-4 px-10 rounded-lg cursor-pointer absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2'>
                <div className='text-red-500 font-bold italic'>No Data Found</div>
                {/*  add todo */}
                <div className="flex flex-col items-center justify-center opacity-50 cursor-pointer">
                    <span className='text-2xl font-bold'>+</span>
                    <span>Add ToDo</span>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto max-w-4xl">
              {data?.map((todo: any) => (
                <div key={todo.id}>
                  <h3>{todo.title}</h3>
                  <p>{todo.content}</p>
                </div>
              ))}
              
              {/* add todo button */}
              <div className="">
                <button>+</button>
                <span>Add ToDo</span>
              </div>
              
            </div>
        </div>
    )
}