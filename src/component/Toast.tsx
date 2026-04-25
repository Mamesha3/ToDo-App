"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void
  soundEnabled: boolean
  toggleSound: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Sound generation using Web Audio API
const playNotificationSound = (type: ToastType) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different frequencies for different toast types
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime) // D5
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1) // A5
        break
      case 'error':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime) // Low tone
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1) // Lower
        break
      case 'warning':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.1)
        break
      case 'info':
      default:
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        break
    }
    
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.error('Error playing notification sound:', error)
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notificationSound')
      return saved !== 'false'
    }
    return true
  })

  useEffect(() => {
    localStorage.setItem('notificationSound', String(soundEnabled))
  }, [soundEnabled])

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, type, title, message }])
    
    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound(type)
    }
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }, [soundEnabled])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev)
  }, [])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" />
      case 'error':
        return <XCircle className="text-red-500" />
      case 'warning':
        return <AlertCircle className="text-yellow-500" />
      case 'info':
      default:
        return <Info className="text-blue-500" />
    }
  }

  const getEmoji = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getBackgroundClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getVariant = (type: ToastType) => {
    switch (type) {
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, soundEnabled, toggleSound }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col-reverse gap-2 max-h-[80vh] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              layout
            >
              <Alert 
                variant={getVariant(toast.type)} 
                className={`shadow-2xl border-2 min-w-[300px] max-w-md ${getBackgroundClass(toast.type)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getEmoji(toast.type)}</span>
                  <div className="flex-1">
                    <AlertTitle className="text-base font-semibold">
                      {toast.title}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {toast.message}
                    </AlertDescription>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
