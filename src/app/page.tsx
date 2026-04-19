'use client'

import { useEffect } from "react";
import Navbar from "../component/navbar";
import TodoList from "../component/todoList";

export default function Home() {
  
  return (
    <>
    <Navbar />
     <div>
        <TodoList />
     </div>
    </>
  );
}
