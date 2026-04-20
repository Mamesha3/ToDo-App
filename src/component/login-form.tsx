"use client"

import { cn } from "@/lib/utils"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react"
import Link from "next/link"
import React, { useState, useRef } from "react"
import { useAuth } from "@/context/useContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "./Toast"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const [isShowPass, setShowPass] = React.useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const router = useRouter()
    const { login } = useAuth();
    const { showToast } = useToast();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        
        setError(null);

        if(!emailRef.current || !passwordRef.current) {
            setError("Please fill in all fields");
            return;
        }

        const email = emailRef.current.value.trim();
        const password = passwordRef.current.value;

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            await login({ email, password });
            showToast('success', 'Welcome Back!', 'You have successfully logged in');
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials and try again.");
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Login to your account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
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
                  <FieldLabel htmlFor="email" className="text-gray-700 font-medium">Email</FieldLabel>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
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
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password" className="text-gray-700 font-medium">Password</FieldLabel>
                    <a
                    onClick={() => alert('coming soon!')}
                      href="#"
                      className="ml-auto inline-block text-sm text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
                      <Lock className="text-gray-400 mr-3" size={18} />
                      <Input id="password" type={isShowPass ? "text" : "password"} placeholder="Enter your password" required className="border-0 outline-none focus:outline-none" ref={passwordRef}/>
                      <span onClick={() => setShowPass(prev => !prev)} className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
                          {isShowPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                  </div>
                </Field>
                <Field>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </motion.div>
                  {/* <Button variant="outline" type="button">
                    Login with Google
                  </Button> */}
                  <FieldDescription className="text-center text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href={"/signup"} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
