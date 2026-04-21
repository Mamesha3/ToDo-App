"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, UserPen, Home, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/useContext";
import { motion } from "framer-motion";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth()

  return (
    <>
      {/* Desktop Top Navbar */}
      <div className="hidden md:flex fixed top-0 z-10 w-full p-4 items-center justify-between bg-green-400 text-amber-50">
        <h1 className="text-3xl font-bold text-slate-300 text-shadow-2xs">
          <span className="italic text-2xl text-slate-400">M</span>Studio
        </h1>

        {/* Desktop navigation */}
        <div className="flex items-center gap-4">
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/')}
          ><Home />Home</button>
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/messages' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/messages')}
          ><MessageSquare />Messages</button>
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/profile' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/profile')}
          ><UserPen />Profile</button>
          <button
            onClick={logout}
            className="cursor-pointer rounded-lg w-20 py-2 px-4 hover:shadow-sm hover:text-black hover:bg-white active:scale-95 transition-all duration-400"
          ><LogOut /></button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 z-10 w-full bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/messages')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/messages' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/profile')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <UserPen className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </motion.button>
        </div>
      </div>
    </>
  );
}