"use client"

// import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, UserPen, Home, MessageSquare, MessageCirclePlus, ImagePlus, LogIn, UserPlus, Search } from "lucide-react";
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
        <h1 onClick={() => router.push('/')} className="cursor-pointer text-3xl font-bold text-slate-300 text-shadow-2xs">
          <span className="italic text-2xl text-slate-400">M</span>Studio
        </h1>

        {/* Desktop navigation */}
        {pathname === '/guest' ? 
          
        <div className="flex items-center justify-around">
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/login' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/login')}
          ><LogIn />Login</button>
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/signup' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/signup')}
          ><UserPlus />Signup</button>
        </div>
        
        : (
          <div className="flex items-center gap-4">
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/')}
          ><Home />Home</button>
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/search' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/search')}
          ><Search />Search</button>
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/messages' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/messages')}
          ><MessageSquare />Messages</button>
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/image-generator' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/image-generator')}
          ><ImagePlus />AI Image</button>
          <button
            className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/profile' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
            onClick={() => router.push('/profile')}
          ><UserPen />Profile</button>
          <button
            onClick={logout}
            className="cursor-pointer rounded-lg w-20 py-2 px-4 hover:shadow-sm hover:text-black hover:bg-white active:scale-95 transition-all duration-400"
          ><LogOut /></button>
        </div>)}
      </div>

      {/* Mobile Bottom Navigation */}
      {pathname === '/guest' ? 
       <div className="md:hidden flex items-center justify-between p-2 fixed top-0 left-0 right-0 z-10 bg-blue-500 border-b border-gray-200 shadow-sm">
         <h1 onClick={() => router.push('/')} className="cursor-pointer text-3xl font-bold text-slate-300 text-shadow-2xs">
            <span className="italic text-2xl text-slate-400">M</span>Studio
        </h1>
         
          <div className="font-semibold flex items-center gap-3">
              <button
                className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/login' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
                onClick={() => router.push('/login')}
              ><LogIn />Login</button>
            <button
              className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/signup' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
              onClick={() => router.push('/signup')}
            ><UserPlus />Signup</button>
          </div>
       </div>
       : (
      <div className="md:hidden fixed bottom-0 z-10 w-full bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Todo Home Page"
            onClick={() => router.push('/')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Home className="w-6 h-6" />
            {/* <span className="text-xs">Home</span> */}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Search"
            onClick={() => router.push('/search')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/search' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Search className="w-6 h-6" />
            {/* <span className="text-xs">Search</span> */}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Add Todo"
            onClick={() => router.push('/add')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/add' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <MessageCirclePlus className="w-6 h-6" />
            {/* <span className="text-xs">add todo</span> */}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Messages"
            onClick={() => router.push('/messages')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/messages' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <MessageSquare className="w-6 h-6" />
            {/* <span className="text-xs">Messages</span> */}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Ai Image"
            onClick={() => router.push('/image-generator')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/image-generator' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <ImagePlus className="w-6 h-6" />
            {/* <span className="text-xs">AI Image</span> */}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Profile"
            onClick={() => router.push('/profile')}
            className={`cursor-pointer flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <UserPen className="w-6 h-6" />
            {/* <span className="text-xs">Profile</span> */}
          </motion.button>
        </div>
      </div>)}
    </>
  );
}