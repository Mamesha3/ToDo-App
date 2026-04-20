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
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useAuth } from "@/context/useContext"
import { useRouter } from "next/navigation"

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
            <Card {...props}>
                <CardContent className="pt-6">
                    <Alert className="border-green-500/50 bg-green-500/10">
                        <CheckCircle2 className="text-green-500" />
                        <AlertTitle className="text-green-500">Success!</AlertTitle>
                        <AlertDescription>
                            User registered successfully. Redirecting to login...
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }
  
    return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" ref={nameRef} type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                ref={emailRef}
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              {/* <Input id="password" type="password" required /> */}
              <div className="flex items-center border-1 rounded-lg px-2">
                    <Input id="password" ref={passwordRef} type={isShowPass ? "text" : "password"} required className="border-0 outline-none focus:outline-none"/>
                    <span onClick={() => setShowPass(prev => !prev)} className="opacity-30 cursor-pointer">
                        {isShowPass ? <EyeOff /> : <Eye />}
                    </span>
                </div>
              <FieldDescription>
                Must be at least 8 characters with uppercase, lowercase, and numbers.
              </FieldDescription>
              {passwordError && (
                <FieldDescription className="text-red-500">{passwordError}</FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              {/* <Input id="confirm-password" type="password" required /> */}
              <div className="flex items-center border-1 rounded-lg px-2">
                    <Input id="confirm-password" type={isShowConfirmPass ? "text" : "password"} required className="border-0 outline-none focus:outline-none" ref={confirmPasswordRef}/>
                    <span onClick={() => setShowConfirmPass(prev => !prev)} className="opacity-30 cursor-pointer">
                        {isShowConfirmPass ? <EyeOff /> : <Eye />}
                    </span>
                </div>
              <FieldDescription>Please confirm your password.</FieldDescription>
              <FieldDescription className="text-red-500">{isPassMatched}</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                {/* <Button variant="outline" type="button">
                  Sign up with Google
                </Button> */}
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
