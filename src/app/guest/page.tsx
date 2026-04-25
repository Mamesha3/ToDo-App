"use client"

import { motion } from 'framer-motion'
import { CheckCircle, Sparkles, MessageSquare, ImagePlus, Share2, Clock, Users, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { useAuth } from '@/context/useContext'

export default function GuestPage() {
    const router = useRouter()
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            router.push('/')
        }
    }, [user, router])

    const features = [
        {
            icon: CheckCircle,
            title: 'Smart Todo Management',
            description: 'Create, organize, and track your tasks with ease. Set due dates, mark complete, and stay productive.',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: Sparkles,
            title: 'AI-Powered Todos',
            description: 'Let AI generate intelligent todo lists and special tasks based on your goals. Save time and boost productivity.',
            color: 'from-green-500 to-emerald-600'
        },
        {
            icon: MessageSquare,
            title: 'Real-time Chat',
            description: 'Message other users instantly. Collaborate on tasks and stay connected with your team.',
            color: 'from-purple-500 to-purple-600'
        },
        {
            icon: ImagePlus,
            title: 'AI Image Generation',
            description: 'Create stunning images with AI. Generate up to 10 images per day for your projects.',
            color: 'from-pink-500 to-rose-600'
        },
        {
            icon: Share2,
            title: 'Share & Collaborate',
            description: 'Share todos with friends and colleagues. Work together on shared tasks in real-time.',
            color: 'from-orange-500 to-amber-600'
        },
        {
            icon: Clock,
            title: 'Due Date Reminders',
            description: 'Set countdown timers for your tasks. Never miss a deadline with live countdowns.',
            color: 'from-cyan-500 to-teal-600'
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-18">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
                        >
                            Smart Todo App
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
                        >
                            Boost your productivity with AI-powered task management, real-time collaboration, and intelligent features.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Smart Todo App?</h3>
                                <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">AI-Powered Intelligence</h4>
                                            <p className="text-sm">Generate smart todo lists and special tasks using advanced AI technology</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Team Collaboration</h4>
                                            <p className="text-sm">Share todos with teammates and work together in real-time</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Clock className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Smart Reminders</h4>
                                            <p className="text-sm">Set due dates with live countdown timers to never miss deadlines</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <ImagePlus className="w-5 h-5 text-pink-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">AI Image Generation</h4>
                                            <p className="text-sm">Create stunning images with AI for your projects and presentations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to manage your tasks efficiently and collaborate with your team.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                        >
                            <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* How It Works Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get started in minutes and transform your productivity.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Create Account', description: 'Sign up for free in seconds. No credit card required.' },
                            { step: '2', title: 'Add Your Tasks', description: 'Create todos manually or let AI generate them for you.' },
                            { step: '3', title: 'Collaborate', description: 'Share tasks with others and work together in real-time.' }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">Ready to Boost Your Productivity?</h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of users who are already managing their tasks smarter.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Start Free Today
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">© 2026 <span className="text-blue-400 italic">M</span><span className='text-xl font-bold'>Studio</span> Smart Todo App. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}
