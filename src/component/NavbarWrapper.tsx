"use client"

import { usePathname } from "next/navigation"
import Navbar from "./navbar"

export default function NavbarWrapper() {
  const pathname = usePathname()

  // Don't render navbar on login and signup pages
  if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/todo/')) {
    return null
  }

  return <Navbar />
}
