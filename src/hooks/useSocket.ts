"use client"
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
        })

        return () => {
            socketRef.current?.disconnect()
        }
    }, [])

    return socketRef.current
}
