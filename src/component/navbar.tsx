"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X, UserPen, SquareMenu } from "lucide-react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const router = useRouter();

  return (
    <div className="p-4 flex items-center justify-between bg-green-400 text-amber-50">
      <h1
      className="text-3xl font-bold text-slate-300 text-shadow-2xs"
      ><span className="italic text-2xl text-slate-400">M</span>Studio</h1>

      {/* if user is logged in */}
      <div className="hidden sm:flex items-center gap-4">
        <button 
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 cursor-pointer hover:shadow-lg hover:scale-95 transition-all duration-200">Profile</button>
        <button 
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 cursor-pointer hover:shadow-lg hover:scale-95 transition-all duration-200">Logout</button>
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
      {isMenuOpen && <div className="sm:hidden relative">
        <div className="fixed inset-0 bg-black/50 z-50"></div>
        <div className="fixed top-0 left-0 w-64 h-full bg-white z-50">
          <button 
            className="px-4 py-2 absolute top-2 right-2 text-red-500 font-semibold rounded-lg hover:bg-amber-600 cursor-pointer hover:shadow-lg hover:scale-95 hover:text-black transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="cancel"
          ><X /></button>

          {/* logout button */}
          <div className="flex flex-col items-start gap-4 mt-20 px-3 w-full">
            <button title="profile" className="cursor-pointer hover:shadow-lg p-2 rounded-lg hover:border hover:border-amber-500 font-semibold transition-all duration-75 text-black flex items-center gap-2 w-full">
              <UserPen />
              <h3>Profile</h3>
            </button> 
            
            <div title="Logout" className="w-full text-black font-extrabold text-lg absolute bottom-20 left-2 hover:text-red-500 cursor-pointer hover:shadow-lg p-2 hover:scale-95 transition-all duration-200">
              <LogOut />
            </div>
          </div>
        </div>
      </div>}

    </div>
  );
}