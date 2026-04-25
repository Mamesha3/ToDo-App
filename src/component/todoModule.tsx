"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Clock } from "lucide-react"
import { useAddTodo, useUpdateTodo } from '@/hooks/todoHook'
import { useRef, useEffect, useState } from "react"
import { useAuth } from '@/context/useContext'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"


export default function AddToDo({ setIsAdding, todoD, seteTodoD }: { setIsAdding: (value: boolean) => void; todoD?: any; seteTodoD?: (value: any) => void }) {
    const { user } = useAuth()
    const { mutate: addTodo } = useAddTodo(user)
    const { mutate: updateTodo } = useUpdateTodo(user)
    const titleRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)
    const isEditMode = !!todoD
    const [selectedDate, setSelectedDate] = useState<Date | null>(todoD?.completedAt ? new Date(todoD.completedAt) : null)
    const [autoChangeStatus, setAutoChangeStatus] = useState(todoD?.autoChangeStatus || false)

    useEffect(() => {
        if (todoD && titleRef.current && contentRef.current) {
            titleRef.current.value = todoD.title || ''
            contentRef.current.value = todoD.content || ''
            if (todoD.completedAt) {
                setSelectedDate(new Date(todoD.completedAt))
                setAutoChangeStatus(todoD.autoChangeStatus || false)
            } else {
                setSelectedDate(null)
                setAutoChangeStatus(false)
            }
        }
    }, [todoD])
    
    function handleSubmit() {
        if (!titleRef.current?.value || !contentRef.current?.value) {
          return
        }
        
        const completedAt = selectedDate ? selectedDate.toISOString() : null
        const autoChange = selectedDate ? autoChangeStatus : false
        
        if (isEditMode && todoD?.id) {
            updateTodo({
                id: todoD.id,
                data: {
                    title: titleRef.current?.value,
                    content: contentRef.current?.value,
                    completedAt,
                    autoChangeStatus: autoChange
                }
            })
        } else {
            addTodo({
              title: titleRef.current?.value,
              content: contentRef.current?.value,
              completedAt,
              autoChangeStatus: autoChange
            })
        }
        setIsAdding(false)
  }

    return (
        <>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {setIsAdding(false); seteTodoD?.(null)}}>
            <div className="rounded-2xl p-4 bg-white shadow-lg flex flex-col gap-4 w-96" onClick={(e) => e.stopPropagation()}>
               <div className="flex items-center justify-between">
                <h2>{isEditMode ? 'Edit Todo' : 'Add Todo'}</h2>
                <Button title="close" variant="ghost" className="cursor-pointer" size="icon" onClick={() => {setIsAdding(false); seteTodoD?.(null)}}>
                  <X />
                </Button>
               </div>
               <Input placeholder="Enter Title" ref={titleRef} defaultValue={todoD?.title || ''}/>
               <Textarea placeholder="Enter Content" ref={contentRef} defaultValue={todoD?.content || ''}/>
               <DatePicker
                 selected={selectedDate}
                 onChange={(date: Date | null) => setSelectedDate(date)}
                 showTimeSelect
                 timeFormat="HH:mm"
                 timeIntervals={15}
                 dateFormat="MMMM d, yyyy h:mm aa"
                 placeholderText="Complete By (Optional)"
                 className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                 isClearable
               />
               {selectedDate && (
                   <div className="flex items-center gap-2">
                       <input
                           type="checkbox"
                           id="autoChangeStatus"
                           checked={autoChangeStatus}
                           onChange={(e) => setAutoChangeStatus(e.target.checked)}
                           className="w-4 h-4 cursor-pointer"
                       />
                       <label htmlFor="autoChangeStatus" className="text-sm text-gray-600 cursor-pointer flex items-center gap-1">
                           <Clock className="w-4 h-4" />
                           Auto-mark as completed when overdue
                       </label>
                   </div>
               )}
               <Button title="submit button" onClick={handleSubmit}>{isEditMode ? 'Update' : 'Add'}</Button>
            </div>
          </div>
        </>
    )
}