'use client'

import { useEffect } from "react";
import Navbar from "../component/navbar";
import TodoList from "../component/todoList";
import { useAuth } from "@/context/useContext";
import { useRouter } from "next/navigation";
import { useGetUserTodo, useGetSharedTodos } from "../hooks/todoHook";
import { motion } from "framer-motion";

export default function Home() {
  const { user, refresh } = useAuth()
  const router = useRouter()
  const { data: todoData } = useGetUserTodo(user)
  const { data: sharedData } = useGetSharedTodos(user)

  useEffect(() => {
    if(!user) {
      refresh().catch(() => router.push('/login'))
    }
  }, [])

  const allTodos = [...(todoData?.todo || []), ...(sharedData?.sharedTodos || [])]
  const todoCount = allTodos.length || 0
  const completedCount = allTodos.filter((t: any) => t.completed).length || 0

  return (
    <>
    <Navbar />
     <div className="pt-4 md:pt-4 pb-20 md:pb-4">
        {/* Mobile welcome header - replaces navbar area */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="md:hidden sticky top-0 z-20 mb-4 px-4 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              Welcome, {user?.name || 'User'}! 👋
            </h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring", damping: 15, stiffness: 200 }}
              className="text-sm text-white/90 mt-1 font-medium"
            >
              You have {todoCount} todo{todoCount !== 1 ? 's' : ''} ({completedCount} completed)
            </motion.p>
          </motion.div>
        </motion.div>

        <TodoList />
     </div>
    </>
  );
}
