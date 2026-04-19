
'use client'

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useContext";

export default function Login() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const route = useRouter()
    const { login } = useAuth()

    const handleLogin = async () => {
        if(!emailRef.current?.value || !passwordRef.current?.value) {
            return;
        }

        await login({
            email: emailRef.current?.value,
            password: passwordRef.current?.value
        })

        route.push("/")
    }
    
    return (
        <div className="rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
            <h1 className="text-center font-bold">Login Page</h1>
            <input type="email" ref={emailRef} className="border border-gray-300 rounded-xl shadow-sm p-2" placeholder="enter email"/>
            <input type="password" ref={passwordRef} className="border border-gray-300 rounded-xl shadow-sm p-2" placeholder="enter password"/>
            <button onClick={handleLogin} className="rounded p-2text-white bg-amber-800 shadow-sm cursor-pointer">Login</button>
        </div>
    );
}