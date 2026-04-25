"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, EyeOff, CheckCircle2, AlertCircle, User, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useAuth } from "@/context/useContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "@/component/Toast"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [isShowPass, setShowPass] = useState(false)
    const [isShowConfirmPass, setShowConfirmPass] = useState(false)
    const [isPassMatched, setPassMatched] = useState<string | null>(null)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const passwordRef = useRef<HTMLInputElement>(null)
    const confirmPasswordRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const { register } = useAuth()
    const router = useRouter()
    const { showToast } = useToast()
    function validatePassword(password: string): string | null {
        if (password.length < 8) {
            return "Password must be at least 8 characters long"
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter"
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter"
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number"
        }
        return null
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        
        // Reset errors
        setError(null)
        setPassMatched(null)
        setPasswordError(null)

        // Validate refs exist
        if(!nameRef.current || !emailRef.current || !passwordRef.current || !confirmPasswordRef.current) {
            setError("Please fill in all fields")
            return
        }

        const name = nameRef.current.value.trim()
        const email = emailRef.current.value.trim()
        const password = passwordRef.current.value
        const confirmPassword = confirmPasswordRef.current.value

        // Validate fields
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields")
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address")
            return
        }

        // Validate password strength
        const passwordValidationError = validatePassword(password)
        if (passwordValidationError) {
            setPasswordError(passwordValidationError)
            return
        }

        // Validate password match
        if (password !== confirmPassword) {
            setPassMatched('Passwords do not match')
            return
        }

        setIsLoading(true)
        try {
            await register({ name, email, password })
            showToast('success', 'Account Created!', 'Your account has been created successfully')
            setIsSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if(isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card {...props} className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Alert className="border-green-500/50 bg-green-500/10">
                                <CheckCircle2 className="text-green-500" />
                                <AlertTitle className="text-green-500">Success!</AlertTitle>
                                <AlertDescription>
                                    User registered successfully. Redirecting to login...
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }
  
    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card {...props} className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create an account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className="text-gray-700 font-medium">Full Name</FieldLabel>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-200">
                  <User className="text-gray-400 mr-3" size={18} />
                  <Input 
                    id="name" 
                    ref={nameRef} 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    className="border-0 outline-none focus:outline-none"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-gray-700 font-medium">Email</FieldLabel>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-200">
                  <Mail className="text-gray-400 mr-3" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    ref={emailRef}
                    className="border-0 outline-none focus:outline-none"
                  />
                </div>
                <FieldDescription className="text-gray-500">
                  We&apos;ll use this to contact you. We will not share your email
                  with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-gray-700 font-medium">Password</FieldLabel>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-200">
                    <Lock className="text-gray-400 mr-3" size={18} />
                    <Input id="password" ref={passwordRef} type={isShowPass ? "text" : "password"} placeholder="Create a password" required className="border-0 outline-none focus:outline-none"/>
                    <span onClick={() => setShowPass(prev => !prev)} className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
                        {isShowPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                </div>
                <FieldDescription className="text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and numbers.
                </FieldDescription>
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <FieldDescription className="text-red-500">{passwordError}</FieldDescription>
                  </motion.div>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password" className="text-gray-700 font-medium">
                  Confirm Password
                </FieldLabel>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-200">
                    <Lock className="text-gray-400 mr-3" size={18} />
                    <Input id="confirm-password" type={isShowConfirmPass ? "text" : "password"} placeholder="Confirm your password" required className="border-0 outline-none focus:outline-none" ref={confirmPasswordRef}/>
                    <span onClick={() => setShowConfirmPass(prev => !prev)} className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
                        {isShowConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                </div>
                <FieldDescription className="text-gray-500">Please confirm your password.</FieldDescription>
                {isPassMatched && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <FieldDescription className="text-red-500">{isPassMatched}</FieldDescription>
                  </motion.div>
                )}
              </Field>
              <FieldGroup>
                <Field>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </motion.div>
                  {/* <Button variant="outline" type="button">
                    Sign up with Google
                  </Button> */}
                  <FieldDescription className="px-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
