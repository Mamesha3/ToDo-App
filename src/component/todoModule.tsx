"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useAddTodo, useUpdateTodo } from '@/hooks/todoHook'
import { useRef, useEffect } from "react"


export default function AddToDo({ setIsAdding, todoD }: { setIsAdding: (value: boolean) => void; todoD?: any }) {
    const { mutate: addTodo } = useAddTodo()
    const { mutate: updateTodo } = useUpdateTodo()
    const titleRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)
    const isEditMode = !!todoD

    useEffect(() => {
        if (todoD && titleRef.current && contentRef.current) {
            titleRef.current.value = todoD.title || ''
            contentRef.current.value = todoD.content || ''
        }
    }, [todoD])
    
    function handleSubmit() {
        if (!titleRef.current?.value || !contentRef.current?.value) {
          return
        }
        
        if (isEditMode && todoD?.id) {
            updateTodo({
                id: todoD.id,
                data: {
                    title: titleRef.current?.value,
                    content: contentRef.current?.value
                }
            })
        } else {
            addTodo({
              title: titleRef.current?.value,
              content: contentRef.current?.value
            })
        }
        setIsAdding(false)
  }

    return (
        <>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAdding(false)}>
            <div className="rounded-2xl p-4 bg-white shadow-lg flex flex-col gap-4 w-96" onClick={(e) => e.stopPropagation()}>
               <div className="flex items-center justify-between">
                <h2>{isEditMode ? 'Edit Todo' : 'Add Todo'}</h2>
                <Button title="close" variant="ghost" className="cursor-pointer" size="icon" onClick={() => setIsAdding(false)}>
                  <X />
                </Button>
               </div>
               <Input placeholder="Enter Title" ref={titleRef} defaultValue={todoD?.title || ''}/>
               <Textarea placeholder="Enter Content" ref={contentRef} defaultValue={todoD?.content || ''}/>
               <Button title="submit button" onClick={handleSubmit}>{isEditMode ? 'Update' : 'Add'}</Button>
            </div>
          </div>
        </>
    )
}