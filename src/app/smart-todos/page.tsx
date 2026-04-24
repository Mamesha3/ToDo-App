"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Sparkles, Square, CheckSquare2 } from 'lucide-react'
import { useAuth } from '@/context/useContext'
import { useAddTodo } from '@/hooks/todoHook'

export default function SmartTodosReviewPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    const { mutate: addTodo } = useAddTodo(user)
    
    const [generatedTodos, setGeneratedTodos] = useState<string[]>([])
    const [selectedTodos, setSelectedTodos] = useState<Set<number>>(new Set())
    const [isAdding, setIsAdding] = useState(false)
    
    useEffect(() => {
        const todosParam = searchParams.get('todos')
        if (todosParam) {
            try {
                const todos = JSON.parse(decodeURIComponent(todosParam))
                setGeneratedTodos(Array.isArray(todos) ? todos : [])
            } catch (error) {
                console.error('Error parsing todos:', error)
            }
        }
    }, [searchParams])

    function handleToggleTodo(index: number) {
        const newSelected = new Set(selectedTodos)
        if (newSelected.has(index)) {
            newSelected.delete(index)
        } else {
            newSelected.add(index)
        }
        setSelectedTodos(newSelected)
    }

    function handleSelectAll() {
        if (selectedTodos.size === generatedTodos.length) {
            setSelectedTodos(new Set())
        } else {
            setSelectedTodos(new Set(generatedTodos.map((_, i) => i)))
        }
    }

    async function handleAddSelected() {
        if (selectedTodos.size === 0) return
        
        setIsAdding(true)
        try {
            selectedTodos.forEach((index) => {
                const todoItem = generatedTodos[index]
                const words = todoItem.split(' ')
                const title = words.slice(0, 5).join(' ')
                addTodo({
                    title: title,
                    content: todoItem,
                    completedAt: null,
                    isSmart: true
                })
            })
            
            router.push('/')
        } catch (error) {
            console.error('Error adding todos:', error)
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <div className="min-h-screen pt-20 px-4 pb-24 md:pb-4">
            <div className="max-w-3xl mx-auto">
                <Button 
                    variant="ghost" 
                    className="mb-6 cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="mr-2" /> Back
                </Button>

                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Review Smart Todos</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Select the todos you want to add</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                className="cursor-pointer"
                            >
                                {selectedTodos.size === generatedTodos.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {generatedTodos.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No todos to review</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {generatedTodos.map((todo, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card 
                                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                selectedTodos.has(index) ? 'border-green-500 bg-green-50' : ''
                                            }`}
                                            onClick={() => handleToggleTodo(index)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="pt-1 cursor-pointer" onClick={() => handleToggleTodo(index)}>
                                                        {selectedTodos.has(index) ? (
                                                            <CheckSquare2 className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <Square className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 cursor-pointer" onClick={() => handleToggleTodo(index)}>
                                                        <p className="text-sm font-medium">{todo}</p>
                                                    </div>
                                                    {selectedTodos.has(index) && (
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {generatedTodos.length > 0 && (
                            <div className="mt-6 flex gap-3">
                                <Button
                                    onClick={handleAddSelected}
                                    disabled={selectedTodos.size === 0 || isAdding}
                                    className="flex-1 cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    {isAdding ? 'Adding...' : `Add ${selectedTodos.size} Selected Todo${selectedTodos.size !== 1 ? 's' : ''}`}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/')}
                                    disabled={isAdding}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
