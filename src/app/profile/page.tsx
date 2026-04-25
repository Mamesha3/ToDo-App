"use client"



import { useAuth } from '@/context/useContext'

import { useGetUserTodo, useGetSharedTodos } from '@/hooks/todoHook'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { User, Mail, CheckCircle, Clock, LogOut, X, Volume2, VolumeX } from 'lucide-react'

import { useState, useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import Navbar from '@/component/navbar'

import { updateUserProfile } from '@/lib/api'

import { useToast } from '@/component/Toast'



export default function ProfilePage() {

    const { user, logout, refresh, updateUser } = useAuth()

    const { data, isLoading } = useGetUserTodo(user)

    const { data: sharedData } = useGetSharedTodos(user)

    const { soundEnabled, toggleSound, showToast } = useToast()

    const router = useRouter()

    const [isEditing, setIsEditing] = useState(false)

    const nameRef = useRef<HTMLInputElement>(null)

    const emailRef = useRef<HTMLInputElement>(null)



    useEffect(() => {

        if (!user) {

            refresh().catch(() => router.push('/login'))

        }

    }, [user, refresh, router])



    if (!user) {

        return null

    }



    async function handleUpdateProfile() {

        if (!nameRef.current?.value || !emailRef.current?.value) {

            return

        }



        try {

            const response = await updateUserProfile({

                name: nameRef.current.value,

                email: emailRef.current.value

            })

            

            // Update user in context directly

            if (response.user) {

                updateUser(response.user)

            } else {

                // Fallback to refresh if user not in response

                await refresh()

            }

            showToast('success', 'Profile Updated', 'Your profile has been updated successfully')

            setIsEditing(false)

        } catch (error) {

            console.error('Failed to update profile:', error)

            showToast('error', 'Update Failed', 'Failed to update profile. Please try again.')

        }

    }



    function openEditModal() {

        if (nameRef.current) nameRef.current.value = user?.name || ''

        if (emailRef.current) emailRef.current.value = user?.email || ''

        setIsEditing(true)

    }



    const allTodos = [...(data?.todo || []), ...(sharedData?.sharedTodos || [])]

    const totalTodos = allTodos.length || 0

    const completedTodos = allTodos.filter((todo: any) => todo.completed)?.length || 0

    const pendingTodos = totalTodos - completedTodos

    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0



    if (isLoading) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600"></div>

            </div>

        )

    }



    return (

        <>

            {/* <Navbar /> */}

            {isEditing && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEditing(false)}>

                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between mb-4">

                            <h2 className="text-xl font-semibold text-slate-800">Edit Profile</h2>

                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>

                                <X className="w-5 h-5" />

                            </Button>

                        </div>

                        <div className="space-y-4">

                            <div>

                                <label className="text-sm font-medium text-slate-700 mb-1 block">Name</label>

                                <Input 

                                    ref={nameRef}

                                    placeholder="Enter your name"

                                    defaultValue={user?.name || ''}

                                />

                            </div>

                            <div>

                                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>

                                <Input 

                                    ref={emailRef}

                                    placeholder="Enter your email"

                                    defaultValue={user?.email || ''}

                                />

                            </div>

                            <Button 

                                onClick={handleUpdateProfile}

                                className="w-full"

                            >

                                Save Changes

                            </Button>

                        </div>

                    </div>

                </div>

            )}

            <div className="min-h-screen bg-slate-50 pt-5 md:pt-24 pb-12 px-4">

                <div className="max-w-2xl mx-auto space-y-6">

                {/* Profile Header */}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

                    <div className="flex items-center gap-4">

                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">

                            <User className="w-8 h-8 text-white" />

                        </div>

                        <div className="flex-1">

                            <h1 className="text-2xl font-semibold text-slate-800">{user?.name || 'User'}</h1>

                            <p className="text-slate-500 text-sm">{user?.email || 'No email'}</p>

                        </div>

                        <Button 

                            variant="outline" 

                            size="sm"

                            onClick={logout}

                            className="text-slate-600 hover:text-slate-800 cursor-pointer"

                        >

                            <LogOut className="w-4 h-4 mr-2 text-red-800" />

                            Logout

                        </Button>

                    </div>

                </div>



                {/* Statistics */}

                <div className="grid grid-cols-3 gap-3">

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">

                        <div className="text-3xl font-bold text-slate-800">{totalTodos}</div>

                        <div className="text-xs text-slate-500 mt-1">Total</div>

                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">

                        <div className="text-3xl font-bold text-emerald-600">{completedTodos}</div>

                        <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">

                            <CheckCircle className="w-3 h-3" />

                            Done

                        </div>

                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">

                        <div className="text-3xl font-bold text-amber-600">{pendingTodos}</div>

                        <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">

                            <Clock className="w-3 h-3" />

                            Pending

                        </div>

                    </div>

                </div>



                {/* Progress */}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

                    <div className="flex justify-between items-center mb-3">

                        <span className="text-sm font-medium text-slate-700">Progress</span>

                        <span className="text-sm font-semibold text-emerald-600">{completionRate}%</span>

                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2">

                        <div 

                            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500"

                            style={{ width: `${completionRate}%` }}

                        ></div>

                    </div>

                </div>



                {/* Quick Actions */}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">

                    <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>

                    <div className="space-y-2">

                        {/* <Button 

                            variant="ghost" 

                            className="cursor-pointer w-full justify-start h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-50"

                        >

                            <Mail className="w-4 h-4 mr-3" />

                            Change Email

                        </Button> */}

                        <Button 

                            variant="ghost" 

                            className="cursor-pointer w-full justify-start h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-50"

                            onClick={toggleSound}

                        >

                            {soundEnabled ? <Volume2 className="w-4 h-4 mr-3" /> : <VolumeX className="w-4 h-4 mr-3" />}

                            {soundEnabled ? 'Sound On' : 'Sound Off'}

                        </Button>

                        <Button 

                            variant="ghost" 

                            className="cursor-pointer w-full justify-start h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-50"

                            onClick={openEditModal}

                        >

                            <User className="w-4 h-4 mr-3" />

                            Edit Profile

                        </Button>

                    </div>

                </div>

            </div>

        </div>

        </>

    )

}

