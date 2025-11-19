'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Book } from '@/types'

const ENGAGING_PHRASES = [
    "Hey reader, I bet you'd like this!",
    "This one's calling your name...",
    "Trust us, you're going to love this",
    "Your next favorite book awaits",
    "We picked this just for you",
    "This book has your vibe written all over it",
    "Ready for something awesome?",
    "Can't go wrong with this gem",
    "This is THE book for you today",
    "You won't be able to put this down"
]

export default function RandomBookRecommendation() {
    const [book, setBook] = useState<Book | null>(null)
    const [phrase, setPhrase] = useState('')
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const fetchRandomBook = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/books?random=true&featured=true')
            if (!response.ok) throw new Error('Failed to fetch random book')

            const data = await response.json()
            setBook(data.books[0])

            // Select random phrase
            const randomPhrase = ENGAGING_PHRASES[Math.floor(Math.random() * ENGAGING_PHRASES.length)]
            setPhrase(randomPhrase)
        } catch (error) {
            console.error('Error fetching random book:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = async () => {
        if (!book) return

        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId: book.id, quantity: 1 })
            })

            if (response.ok) {
                toast({
                    title: 'Success!',
                    description: 'Book added to cart.',
                })
            } else {
                const errorData = await response.json()
                toast({
                    title: 'Error',
                    description: errorData.error || 'Failed to add book to cart.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add book to cart.',
                variant: 'destructive',
            })
        }
    }

    useEffect(() => {
        fetchRandomBook()
    }, [])

    if (loading || !book) {
        return (
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <CardContent className="p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                            {phrase}
                        </h2>
                        <p className="text-gray-600 text-sm">Our AI-powered recommendation just for you</p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchRandomBook}
                        className="hover:bg-white hover:rotate-180 transition-all duration-500"
                        title="Get another recommendation"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Book Cover */}
                    <Link href={`/book/${book.id}`} className="flex-shrink-0">
                        <div className="w-48 h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                            {book.coverImage ? (
                                <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/books/placeholder-cover.jpg'
                                    }}
                                />
                            ) : (
                                <img
                                    src="/books/placeholder-cover.jpg"
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </Link>

                    {/* Book Details */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {book.featured && (
                                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                        Featured
                                    </Badge>
                                )}
                                <Badge variant="secondary">{book.category.name}</Badge>
                            </div>

                            <Link href={`/book/${book.id}`}>
                                <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-1">
                                    {book.title}
                                </h3>
                            </Link>

                            <p className="text-gray-600 mb-3">by {book.author}</p>

                            <p className="text-gray-700 line-clamp-3">
                                {book.description}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(book.averageRating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                                {book.averageRating.toFixed(1)} ({book.reviewCount} reviews)
                            </span>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                    ${book.price}
                                </span>
                                {book.format && (
                                    <span className="text-sm text-gray-500 ml-2">{book.format}</span>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <Link href={`/book/${book.id}`}>
                                    <Button variant="outline" className="hover:bg-blue-50">
                                        View Details
                                    </Button>
                                </Link>
                                <Button
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    onClick={addToCart}
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
