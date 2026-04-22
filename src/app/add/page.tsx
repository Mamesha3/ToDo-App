"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { useAddTodo } from '@/hooks/todoHook'
import { useRef, useState } from "react"
import { useAuth } from '@/context/useContext'
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function AddTodoPage() {
    const { user } = useAuth()
    const { mutate: addTodo } = useAddTodo(user)
    const router = useRouter()
    const titleRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    
    function handleSubmit() {
        if (!titleRef.current?.value || !contentRef.current?.value) {
          return
        }
        
        const completedAt = selectedDate ? selectedDate.toISOString() : null
        
        addTodo({
          title: titleRef.current?.value,
          content: contentRef.current?.value,
          completedAt
        })
        
        router.push('/')
    }

    return (
        <div className="min-h-screen pt-20 px-4 pb-24 md:pb-4">
            <div className="max-w-2xl mx-auto">
                <Button 
                    variant="ghost" 
                    className="mb-6 cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="mr-2" /> Back
                </Button>

                <div className="rounded-2xl p-6 bg-white shadow-lg flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold">Add New Todo</h2>
                    <Input placeholder="Enter Title" ref={titleRef} />
                    <Textarea placeholder="Enter Content" ref={contentRef} className="min-h-32" />
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
                    <Button onClick={handleSubmit} className="w-full cursor-pointer">Add Todo</Button>
                </div>
            </div>
        </div>
    )
}
