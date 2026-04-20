'use client'

import { useEffect } from "react";
import Navbar from "../component/navbar";
import TodoList from "../component/todoList";
import { useAuth } from "@/context/useContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, refresh } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if(!user) {
      refresh().catch(() => router.push('/login'))
    }
  }, [])
  
  return (
    <>
    <Navbar />
     <div>
        <TodoList />
     </div>
    </>
  );
}
