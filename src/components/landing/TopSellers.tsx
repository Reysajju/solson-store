import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { Book } from '@/types'

interface TopSellersProps {
  books: Book[]
  loading: boolean
  onAddToCart: (bookId: string) => void
}

export function TopSellers({ books, loading, onAddToCart }: TopSellersProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Top Rated by Readers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading ? [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
              <div className="bg-gray-200 h-48 w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          )) :
            books.slice(0, 4).map(book => (
              <Card key={book.id} className="group overflow-hidden">
                <a href={`/book/${book.id}`} className="cursor-pointer">
                  <img src={book.coverImage || '/books/placeholder-cover.jpg'} alt={book.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                  <CardContent className="p-4">
                    <h3 className="font-bold text-md truncate">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <div className="flex items-center my-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(book.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                      </div>
                      <span className="ml-1 text-xs text-gray-500">({book.reviewCount})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-blue-900">${book.price.toFixed(2)}</span>
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={(e) => { e.preventDefault(); onAddToCart(book.id); }}>Add to Cart</Button>
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))
          }
        </div>
      </div>
    </section>
  )
}
