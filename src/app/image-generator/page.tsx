"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/useContext'
import { motion } from 'framer-motion'
import { ImagePlus, Download, Sparkles, Loader2, Eye, X, History, Trash2, CheckSquare, Square } from 'lucide-react'

export default function ImageGeneratorPage() {
    const [prompt, setPrompt] = useState('')
    const [generatedImages, setGeneratedImages] = useState<string[]>([])
    const [imageCount, setImageCount] = useState(1)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [showHistory, setShowHistory] = useState(false)
    const [historyImages, setHistoryImages] = useState<Array<{ url: string; timestamp: number; prompt: string }>>([])
    const [selectedHistoryItems, setSelectedHistoryItems] = useState<Set<number>>(new Set())
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [remainingImages, setRemainingImages] = useState<number>(10)
    const { user } = useAuth()

    // LocalStorage functions
    const compressImage = (base64: string, maxWidth: number = 400, quality: number = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = base64
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                
                const scale = Math.min(maxWidth / img.width, maxWidth / img.height)
                const width = img.width * scale
                const height = img.height * scale
                
                canvas.width = width
                canvas.height = height
                
                ctx?.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL('image/jpeg', quality))
            }
            img.onerror = () => resolve(base64)
        })
    }

    const saveToHistory = async (images: string[], promptText: string) => {
        const history = JSON.parse(localStorage.getItem('aiImageHistory') || '[]')
        
        // Compress images before storing
        const compressedImages = await Promise.all(
            images.map(img => compressImage(img, 400, 0.7))
        )
        
        const newEntries = compressedImages.map(url => ({
            url,
            timestamp: Date.now(),
            prompt: promptText
        }))
        const updatedHistory = [...newEntries, ...history]
        // Limit to last 30 images as additional safeguard
        const limitedHistory = updatedHistory.slice(0, 30)
        localStorage.setItem('aiImageHistory', JSON.stringify(limitedHistory))
    }

    const loadHistory = () => {
        const history = JSON.parse(localStorage.getItem('aiImageHistory') || '[]')
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
        const filteredHistory = history.filter((item: any) => item.timestamp > oneDayAgo)
        
        // Update localStorage with filtered data
        if (filteredHistory.length !== history.length) {
            localStorage.setItem('aiImageHistory', JSON.stringify(filteredHistory))
        }
        
        setHistoryImages(filteredHistory)
    }

    const clearHistory = () => {
        localStorage.removeItem('aiImageHistory')
        setHistoryImages([])
    }

    const toggleSelection = (index: number) => {
        const newSelection = new Set(selectedHistoryItems)
        if (newSelection.has(index)) {
            newSelection.delete(index)
        } else {
            newSelection.add(index)
        }
        setSelectedHistoryItems(newSelection)
    }

    const deleteSelected = () => {
        const filteredHistory = historyImages.filter((_, index) => !selectedHistoryItems.has(index))
        localStorage.setItem('aiImageHistory', JSON.stringify(filteredHistory))
        setHistoryImages(filteredHistory)
        setSelectedHistoryItems(new Set())
        setIsSelectionMode(false)
    }

    const toggleSelectAll = () => {
        if (selectedHistoryItems.size === historyImages.length) {
            setSelectedHistoryItems(new Set())
        } else {
            setSelectedHistoryItems(new Set(historyImages.map((_, index) => index)))
        }
    }

    // Load history on mount and when history modal opens
    useEffect(() => {
        if (showHistory) {
            loadHistory()
        }
    }, [showHistory])

    const generateImage = async () => {
        if (!prompt.trim() || !user?.id) return

        setIsGenerating(true)
        setError(null)
        setGeneratedImages([])

        try {
            const response = await fetch('http://localhost:5000/api/ai/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ prompt: prompt.trim(), count: imageCount })
            })

            const data = await response.json()

            if (response.ok && data.images) {
                setGeneratedImages(data.images)
                setRemainingImages(data.remaining || 10)
                // Save to localStorage without blocking rendering
                saveToHistory(data.images, prompt.trim())
            } else if (response.status === 429) {
                throw new Error(data.msg || 'Daily image limit exceeded')
            } else {
                throw new Error(data.msg || 'Failed to generate image')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating the image')
        } finally {
            setIsGenerating(false)
        }
    }

    const downloadImage = (imageUrl: string, index: number) => {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `ai-generated-${index + 1}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            generateImage()
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Please login to use AI Image Generator</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-20 pb-24 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8 relative"
                >
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setShowHistory(true)
                            loadHistory()
                        }}
                        className="absolute right-0 top-0 cursor-pointer bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors shadow-md"
                        title="View History"
                    >
                        <History className="w-5 h-5" />
                    </motion.button>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-8 h-8 text-purple-500" />
                        <h1 className="text-3xl font-bold text-gray-800">AI Image Generator</h1>
                    </div>
                    <p className="text-gray-600">Create stunning images with AI</p>
                    <div className="mt-2 text-sm">
                        <span className={`font-medium ${remainingImages <= 3 ? 'text-red-500' : 'text-green-600'}`}>
                            {remainingImages} images remaining today
                        </span>
                    </div>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe the image you want to create
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="A serene sunset over mountains with a lake in the foreground..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    
                    {/* Image Count Selection */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of images
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {[1, 2, 4, 6].map((count) => (
                                <motion.button
                                    key={count}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setImageCount(count)}
                                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all ${
                                        imageCount === count
                                            ? 'bg-purple-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {count}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateImage}
                        disabled={!prompt.trim() || isGenerating}
                        className="cursor-pointer mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating {imageCount} image{imageCount > 1 ? 's' : ''}...
                            </>
                        ) : (
                            <>
                                <ImagePlus className="w-5 h-5" />
                                Generate {imageCount} Image{imageCount > 1 ? 's' : ''}
                            </>
                        )}
                    </motion.button>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Generated Images */}
                {generatedImages.length > 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Generated Images ({generatedImages.length})
                        </h2>
                        <div className={`grid gap-4 ${
                            generatedImages.length === 1 ? 'grid-cols-1' :
                            generatedImages.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                            generatedImages.length === 4 ? 'grid-cols-2 sm:grid-cols-2' :
                            'grid-cols-2 sm:grid-cols-3'
                        }`}>
                            {generatedImages.map((imageUrl, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`AI generated image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setSelectedImage(imageUrl)}
                                            className="cursor-pointer flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => downloadImage(imageUrl, index)}
                                            className="cursor-pointer flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Tips */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 bg-blue-50 rounded-xl p-4"
                >
                    <h3 className="font-medium text-blue-800 mb-2">Tips for better results:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Be specific and detailed in your description</li>
                        <li>• Include style, mood, and artistic preferences</li>
                        <li>• Mention colors, lighting, and composition</li>
                        <li>• Use examples like "in the style of Van Gogh"</li>
                    </ul>
                </motion.div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-2xl max-h-[18vh] w-full bottom-55"
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedImage(null)}
                            className="cursor-pointer absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </motion.button>
                        <img
                            src={selectedImage}
                            alt="Full size AI generated image"
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </motion.div>
                </motion.div>
            )}

            {/* History Modal */}
            {showHistory && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowHistory(false)}
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Image History</h2>
                            <div className="flex gap-2 h-8">
                                {historyImages.length > 0 && !isSelectionMode && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsSelectionMode(true)}
                                        className="cursor-pointer flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                                    >
                                        <Square className="w-4 h-4" />
                                        Select
                                    </motion.button>
                                )}
                                {isSelectionMode && (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={toggleSelectAll}
                                            className="cursor-pointer flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            {selectedHistoryItems.size === historyImages.length ? (
                                                <>
                                                    <CheckSquare className="w-4 h-4" />
                                                    Deselect All
                                                </>
                                            ) : (
                                                <>
                                                    <Square className="w-4 h-4" />
                                                    All
                                                </>
                                            )}
                                        </motion.button>
                                        {selectedHistoryItems.size > 0 && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={deleteSelected}
                                                className="cursor-pointer flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete ({selectedHistoryItems.size})
                                            </motion.button>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setIsSelectionMode(false)
                                                setSelectedHistoryItems(new Set())
                                            }}
                                            className="cursor-pointer flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                                        >
                                            Cancel
                                        </motion.button>
                                    </>
                                )}
                                {!isSelectionMode && historyImages.length > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={clearHistory}
                                        className="cursor-pointer flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowHistory(false)}
                                    className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            {historyImages.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>No image history yet</p>
                                    <p className="text-sm mt-2">Generated images will appear here</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                    {historyImages.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer ${
                                                selectedHistoryItems.has(index) ? 'ring-4 ring-purple-500' : ''
                                            }`}
                                            onClick={() => isSelectionMode && toggleSelection(index)}
                                        >
                                            <img
                                                src={item.url}
                                                alt={`History image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {isSelectionMode && (
                                                <div className="absolute top-2 left-2">
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                                        selectedHistoryItems.has(index) ? 'bg-purple-500' : 'bg-white/80'
                                                    }`}>
                                                        {selectedHistoryItems.has(index) ? (
                                                            <CheckSquare className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {!isSelectionMode && (
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedImage(item.url)
                                                            setShowHistory(false)
                                                        }}
                                                        title='View'
                                                        className="cursor-pointer flex items-center gap-1 bg-blue-300 text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                                                    >
                                                        <Eye className="w-3 h-3 text-blue-600 font-semibold" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            downloadImage(item.url, index)
                                                        }}
                                                        title='Download'
                                                        className="cursor-pointer flex items-center gap-1 bg-green-300 text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                                                    >
                                                        <Download className="w-3 h-3 font-semibold text-green-700" />
                                                    </motion.button>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <p className="text-xs text-white truncate" title={item.prompt}>
                                                    {item.prompt}
                                                </p>
                                                <p className="text-xs text-gray-300">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}
