'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Minus, Plus, X, Trash2, Book, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface Book {
  id: string
  title: string
  author: string
  price: number
  coverImage?: string
  format?: string
  category: {
    id: string
    name: string
  }
  averageRating: number
  reviewCount: number
}

interface CartItem {
  id: string
  quantity: number
  book: Book
}

interface CartResponse {
  cartItems: CartItem[]
  summary: {
    itemCount: number
    subtotal: number
    tax: number
    total: number
  }
}

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState({
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart')
      const data: CartResponse = await response.json()
      setCartItems(data.cartItems)
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdating(bookId)
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          quantity: newQuantity
        })
      })

      if (response.ok) {
        await fetchCart() // Refresh cart data
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (bookId: string) => {
    setUpdating(bookId)
    try {
      const response = await fetch(`/api/cart?bookId=${bookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCart() // Refresh cart data
      }
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) return
    
    try {
      // Remove all items one by one
      await Promise.all(
        cartItems.map(item => 
          fetch(`/api/cart?bookId=${item.book.id}`, {
            method: 'DELETE'
          })
        )
      )
      await fetchCart() // Refresh cart data
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="w-24 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <p className="text-gray-600">
              {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">
                  Looks like you haven't added any books to your cart yet.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <a href="/catalog">Browse Books</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  {cartItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear Cart
                    </Button>
                  )}
                </div>

                {cartItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Book Cover */}
                        <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                          {item.book.coverImage ? (
                            <img 
                              src={item.book.coverImage} 
                              alt={item.book.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-2xl">📚</div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <Badge variant="secondary" className="text-xs mb-2">
                                {item.book.category.name}
                              </Badge>
                              <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                                {item.book.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">by {item.book.author}</p>
                              
                              {/* Rating */}
                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3 h-3 ${i < Math.floor(item.book.averageRating) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-1 text-xs text-gray-600">
                                  {item.book.averageRating.toFixed(1)} ({item.book.reviewCount})
                                </span>
                              </div>

                              <div className="flex items-center space-x-4">
                                <span className="text-lg font-bold text-blue-600">
                                  ${item.book.price}
                                </span>
                                {item.book.format && (
                                  <span className="text-xs text-gray-500">{item.book.format}</span>
                                )}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.book.id)}
                              disabled={updating === item.book.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 mt-4">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating === item.book.id}
                                className="h-8 w-8 p-0 rounded-r-none"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-12 text-center text-sm font-medium">
                                {updating === item.book.id ? '...' : item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                                disabled={updating === item.book.id}
                                className="h-8 w-8 p-0 rounded-l-none"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <span className="text-sm text-gray-600 ml-2">
                              = ${(item.book.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({summary.itemCount} items)</span>
                        <span className="font-medium">${summary.subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (8%)</span>
                        <span className="font-medium">${summary.tax.toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-blue-600">${summary.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                        asChild
                      >
                        <a href="/checkout">
                          Proceed to Checkout
                        </a>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                      >
                        <a href="/catalog">
                          Continue Shopping
                        </a>
                      </Button>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        Secure Checkout
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}