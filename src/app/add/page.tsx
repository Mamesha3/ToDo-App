"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, X } from "lucide-react"
import { useAddTodo } from '@/hooks/todoHook'
import { useRef, useState, useEffect } from "react"
import { useAuth } from '@/context/useContext'
import { useRouter, useSearchParams } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { motion } from "framer-motion"

export default function AddTodoPage() {
    const { user } = useAuth()
    const { mutate: addTodo } = useAddTodo(user)
    const router = useRouter()
    const searchParams = useSearchParams()
    const titleRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [showSmartTodoModal, setShowSmartTodoModal] = useState(false)
    const [smartTodoGoal, setSmartTodoGoal] = useState('')
    const [isGeneratingTodos, setIsGeneratingTodos] = useState(false)
    const [isSmart, setIsSmart] = useState(false)

    // Pre-fill form from URL params
    useEffect(() => {
        const titleParam = searchParams.get('title')
        const contentParam = searchParams.get('content')
        const isSmartParam = searchParams.get('isSmart')

        if (titleParam && titleRef.current) {
            titleRef.current.value = decodeURIComponent(titleParam)
        }
        if (contentParam && contentRef.current) {
            contentRef.current.value = decodeURIComponent(contentParam)
        }
        if (isSmartParam === 'true') {
            setIsSmart(true)
        }
    }, [searchParams])
    
    function handleSubmit() {
        if (!titleRef.current?.value || !contentRef.current?.value) {
          return
        }

        const completedAt = selectedDate ? selectedDate.toISOString() : null

        addTodo({
          title: titleRef.current?.value,
          content: contentRef.current?.value,
          completedAt,
          isSmart
        })

        router.push('/')
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
          alert(data.msg || 'You reached your todays limit')
          return
        }

        if (data.todos && Array.isArray(data.todos)) {
          // Redirect to review page with generated todos
          const todosParam = encodeURIComponent(JSON.stringify(data.todos))
          router.push(`/smart-todos?todos=${todosParam}`)
          setShowSmartTodoModal(false)
          setSmartTodoGoal('')
        }
      } catch (error) {
        console.error('Error generating todos:', error)
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
          alert(data.msg || 'You reached your todays limit')
          return
        }

        if (data.title && data.content) {
          // Pre-fill the form with generated data
          if (titleRef.current) {
            titleRef.current.value = data.title
          }
          if (contentRef.current) {
            contentRef.current.value = data.content
          }
          setIsSmart(true)
          setShowSmartTodoModal(false)
          setSmartTodoGoal('')
        }
      } catch (error) {
        console.error('Error generating special todo:', error)
      } finally {
        setIsGeneratingTodos(false)
      }
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
                    <div className="flex item-center justify-between">
                        <h2 className="text-2xl font-semibold">Add New Todo</h2>
                        <motion.h2 whileHover={{ scale: 1.1 }} whileTap={{scale: 0.95}} className="text-sm font-medium cursor-pointer text-blue-500" onClick={() => setShowSmartTodoModal(true)}>Smart ToDO</motion.h2>
                    </div>
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
            </div>
        </div>
    )
}
