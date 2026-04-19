'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useContext'

export default function Signup() {
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const route = useRouter()
    const { register } = useAuth()


    const handleSignup = async () => {
        if(!nameRef.current?.value || !emailRef.current?.value || !passwordRef.current?.value) {
            return;
        }

        await register({
            name: nameRef.current?.value,
            email: emailRef.current?.value,
            password: passwordRef.current?.value
        })
        route.push('/login')
    }

    
    return (
        <div className='flex flex-col gap-4 p-2 rounded-lg shadow-xl'>
            <h1 className='text-center text-green-600'>Signup</h1>
            <input type="text" ref={nameRef} className='border border-gray-300 p-2 rounded-lg shadow-sm' placeholder='enter Name..'/>
            <input type="email" ref={emailRef} className='border border-gray-300 p-2 rounded-lg shadow-sm' placeholder='enter email..'/>
            <input type="password" ref={passwordRef} className='border border-gray-300 p-2 rounded-lg shadow-sm' placeholder='enter paswword..'/>
            <button onClick={handleSignup} className='p-2 rounded-2xl bg-green-400 text-white font-semibold cursor-pointer'>Signup</button>
        </div>
    )
}