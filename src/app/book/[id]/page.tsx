'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Book, Review } from '@/types'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export default function BookDetailPage() {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      fetchBook()
    }
  }, [id])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${id}`)
      const data = await response.json()
      setBook(data.book)
    } catch (error) {
      console.error('Error fetching book:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!book) {
    return <div>Book not found</div>
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <Header cartCount={0} onSearch={() => { }} />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <img src={book.coverImage || '/books/placeholder-cover.jpg'} alt={book.title} className="w-full h-auto rounded-lg shadow-md" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{book.author}</p>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(book.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
              </div>
              <span className="ml-2 text-gray-600">({book.reviewCount} reviews)</span>
            </div>
            <p className="text-3xl font-bold text-blue-900 mb-4">${book.price.toFixed(2)}</p>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">Add to Cart</Button>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {book.reviews && book.reviews.length > 0 ? (
            <div className="space-y-6">
              {book.reviews.map((review: Review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900 mr-2">{review.user?.name || 'Amazon Customer'}</span>
                    {review.verified && (
                      <span className="text-xs text-orange-600 font-medium">Verified Purchase</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet for this book.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
