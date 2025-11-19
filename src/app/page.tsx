'use client'

import { useState, useEffect } from 'react'
import { Book } from '@/types'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { FeaturedCategories } from '@/components/landing/FeaturedCategories'
import { TopSellers } from '@/components/landing/TopSellers'
import { AuthoritySection } from '@/components/landing/AuthoritySection'
import { EmailCapture } from '@/components/landing/EmailCapture'
import { Footer } from '@/components/landing/Footer'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBooks()
    fetchCartCount()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      setBooks(data.books)
    } catch (error) {
      console.error('Error fetching books:', error)
      toast({
        title: "Error",
        description: "Failed to load books. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.status === 401) {
        setCartCount(0)
        return
      }
      const data = await response.json()
      setCartCount(data.summary.itemCount)
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  const addToCart = async (bookId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity: 1 })
      })

      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add items to your cart.",
          variant: "destructive"
        })
        router.push('/api/auth/signin')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add to cart')
      }

      toast({
        title: "Success",
        description: "Item added to cart",
      })
      await fetchCartCount()
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive"
      })
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Redirect to catalog page with search query
      router.push(`/catalog?search=${encodeURIComponent(query)}`)
    } else {
      router.push('/catalog')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <Header cartCount={cartCount} onSearch={handleSearch} />
      <main>
        <Hero />
        <FeaturedCategories />
        <TopSellers books={books} loading={loading} onAddToCart={addToCart} />
        <AuthoritySection />
        <HowItWorks />
        <EmailCapture />
      </main>
      <Footer />
    </div>
  )
}
