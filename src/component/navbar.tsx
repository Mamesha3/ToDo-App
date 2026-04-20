"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, X, UserPen, SquareMenu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth()

    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])


  return (
    <div className="fixed top-0 z-10 w-full p-4 flex items-center justify-between bg-green-400 text-amber-50">
      <h1
      className="text-3xl font-bold text-slate-300 text-shadow-2xs"
      ><span className="italic text-2xl text-slate-400">M</span>Studio</h1>

      {/* if user is logged in */}
      <div className="hidden sm:flex items-center gap-4">
        {/* logout, profile and home page using lucide-react */}
        <button
        className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
        onClick={() => router.push('/')}
        ><Home />Home</button>
        <button
        className={`cursor-pointer flex gap-2 items-center rounded-lg py-2 px-4 active:scale-95 transition-all duration-400 ${pathname === '/profile' ? 'bg-white text-black shadow-sm' : 'hover:shadow-sm hover:text-black hover:bg-white'}`}
        onClick={() => router.push('/profile')}
        ><UserPen />Profile</button>
        <button
        onClick={logout}
        className="cursor-pointer rounded-lg w-20 py-2 px-4 hover:shadow-sm hover:text-black hover:bg-white active:scale-95 transition-all duration-400"
        ><LogOut /></button>
      </div>

      {/* mobile response */}
      <div className="sm:hidden">
        <button 
          className="px-4 py-2 text-white rounded-lg cursor-pointer hover:shadow-lg hover:scale-95 transition-all duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="menu"
        ><SquareMenu /></button>
      </div>
    
      {/* model when mobile menu is clicked */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="sm:hidden relative">
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 w-64 h-full bg-white z-50"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <Button 
                className="px-4 py-2 absolute top-2 right-2 text-red-500 font-semibold rounded-lg hover:bg-amber-600 cursor-pointer hover:shadow-lg hover:scale-95 hover:text-black transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
                title="cancel"
              ><X /></Button>

              {/* logout button */}
              <div className="flex flex-col items-center gap-96 mt-20 px-3 w-full">
                <div className="w-full flex flex-col gap-3">
                  <button onClick={() => router.push('/profile')} title="profile" className={`shadow-sm cursor-pointer p-2 rounded-lg font-semibold transition-all duration-75 flex items-center gap-2 w-full ${pathname === '/profile' ? 'bg-amber-500 text-white border-2 border-amber-500' : 'hover:shadow-lg hover:border hover:border-amber-500 text-black'}`}>
                    <UserPen />
                    <h3>Profile</h3>
                  </button> 

                  <button onClick={() => router.push('/')} title="Home" className={`shadow-sm cursor-pointer p-2 rounded-lg font-semibold transition-all duration-75 flex items-center gap-2 w-full ${pathname === '/' ? 'bg-amber-500 text-white border-2 border-amber-500' : 'hover:shadow-lg hover:border hover:border-amber-500 text-black'}`}>
                    <Home />
                    <h3>Home</h3>
                  </button> 
                </div>
            
                <div onClick={logout} title="logout" className="shadow-sm cursor-pointer hover:shadow-lg p-2 rounded-lg hover:border hover:border-amber-500 font-semibold transition-all duration-75 text-black flex items-center gap-2 w-full">
                  <LogOut className="text-red-900"/>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}