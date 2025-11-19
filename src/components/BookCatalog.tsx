'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link' // Import Link for clickable cards
import { Search, Filter, Grid, List, Star, ShoppingCart } from 'lucide-react' // Removed unused icons like ChevronDown, SlidersHorizontal
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast' // Import useToast
import { ToastAction } from '@/components/ui/toast' // Import ToastAction
import { Book } from '@/types' // Import Book type from central types file
import RandomBookRecommendation from '@/components/RandomBookRecommendation'

// Re-defining Category and BooksResponse interfaces here to ensure consistency and avoid direct dependency on `Book` from types/index.ts in page.tsx
// If Book is already in types/index.ts, ensure Category and BooksResponse definitions align.
interface Category {
  id: string
  name: string
  bookCount: number
}

interface BooksResponse {
  books: Book[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface BookCatalogProps {
  initialBooks: Book[]
  initialCategories: Category[]
  initialPagination: BooksResponse['pagination'] | null
}

export default function BookCatalog({ initialBooks, initialCategories, initialPagination }: BookCatalogProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false) // No longer loading initially
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(initialPagination?.page || 1)
  const [pagination, setPagination] = useState<any>(initialPagination)
  const [cartCount, setCartCount] = useState(0)

  const { toast } = useToast() // Initialize useToast

  const fetchBooks = async () => {
    // Don't fetch books if no search query or filter is active (show only recommendation)
    if (!searchQuery && selectedCategory === 'all') {
      setBooks([])
      setPagination(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const response = await fetch(`/api/books?${params}`)
      const data: BooksResponse = await response.json()

      setBooks(data.books)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching books:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch books. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch categories.',
        variant: 'destructive',
      })
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      setCartCount(data.summary.itemCount)
    } catch (error) {
      console.error('Error fetching cart count:', error)
      // No toast for cart count, as it's less critical for primary UX
    }
  }

  const addToCart = async (bookId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          quantity: 1
        })
      })

      if (response.ok) {
        await fetchCartCount() // Refresh cart count
        toast({
          title: 'Success!',
          description: 'Book added to cart.',
        })
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to add book to cart.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to add book to cart. Please try again.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    // Read search query from URL on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const searchParam = params.get('search')
      if (searchParam) {
        setSearchQuery(searchParam)
      }
    }

    // Only fetch if initial data was not provided (e.g., if page navigated to directly)
    if (!initialBooks.length && !initialCategories.length) {
      fetchCategories()
      fetchBooks() // This will also be triggered by the dependency array
    }
    fetchCartCount() // Always fetch cart count on mount
  }, [])

  useEffect(() => {
    // Update URL when search query changes
    if (typeof window !== 'undefined' && searchQuery) {
      const params = new URLSearchParams(window.location.search)
      if (searchQuery) {
        params.set('search', searchQuery)
      } else {
        params.delete('search')
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchQuery])

  useEffect(() => {
    // Prevent double fetching if initial data was provided
    if (currentPage !== (initialPagination?.page || 1) || sortBy !== 'createdAt' || sortOrder !== 'desc' || searchQuery || selectedCategory !== 'all') {
      fetchBooks()
    }
  }, [currentPage, sortBy, sortOrder, searchQuery, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchBooks()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-')
    setSortBy(sort)
    setSortOrder(order)
    setCurrentPage(1)
  }

  const renderBookCard = (book: Book) => (
    <Link key={book.id} href={`/book/${book.id}`}> {/* Make entire card clickable */}
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          {/* Book Cover */}
          <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            {book.coverImage ? (
              <img
                src={book.coverImage.replace('http:', 'https:')}
                alt={book.title}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                style={{ imageRendering: 'crisp-edges' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/books/placeholder-cover.jpg'
                }}
              />
            ) : (
              <img
                src="/books/placeholder-cover.jpg"
                alt={book.title}
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* Book Info */}
          <div className="space-y-2">
            {book.featured && (
              <Badge className="bg-blue-600 text-white text-xs">Featured</Badge>
            )}

            <Badge variant="secondary" className="text-xs">
              {book.category.name}
            </Badge>

            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {book.title}
            </h3>

            <p className="text-gray-600 text-sm">by {book.author}</p>

            <p className="text-gray-600 text-sm line-clamp-2">
              {book.description}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(book.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {book.averageRating.toFixed(1)} ({book.reviewCount})
              </span>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-2xl font-bold text-blue-600">${book.price}</span>
                {book.format && (
                  <span className="text-xs text-gray-500 ml-2">{book.format}</span>
                )}
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="hover:bg-blue-50" onClick={(e) => e.preventDefault()}> {/* Prevent navigation on preview click */}
                  Preview
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={(e) => { e.preventDefault(); addToCart(book.id); }}> {/* Prevent navigation on add to cart click */}
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  const renderBookListItem = (book: Book) => (
    <Link key={book.id} href={`/book/${book.id}`}> {/* Make entire card clickable */}
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            {/* Book Cover */}
            <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
              {book.coverImage ? (
                <img
                  src={book.coverImage.replace('http:', 'https:')}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                  style={{ imageRendering: 'crisp-edges' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/books/placeholder-cover.jpg'
                  }}
                />
              ) : (
                <img
                  src="/books/placeholder-cover.jpg"
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {book.featured && (
                      <Badge className="bg-blue-600 text-white text-xs">Featured</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {book.category.name}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                    {book.title}
                  </h3>

                  <p className="text-gray-600">by {book.author}</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">${book.price}</span>
                  {book.format && (
                    <span className="text-xs text-gray-500 block">{book.format}</span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2">
                {book.description}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(book.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {book.averageRating.toFixed(1)} ({book.reviewCount} reviews)
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="hover:bg-blue-50" onClick={(e) => e.preventDefault()}> {/* Prevent navigation on preview click */}
                  Preview
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={(e) => { e.preventDefault(); addToCart(book.id); }}> {/* Prevent navigation on add to cart click */}
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search books, authors, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                />
                <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-4">
                  Search
                </Button>
              </div>
            </form>

            {/* Filters and View Mode */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <Select onValueChange={handleSortChange} defaultValue="createdAt-desc">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="price-asc">Price Low to High</SelectItem>
                  <SelectItem value="price-desc">Price High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <a href="/cart">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                </a>
              </Button>

              {/* View Mode */}
              <div className="flex items-center border border-gray-200 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Category:</span>
            <div className="flex space-x-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange('all')}
                className="whitespace-nowrap"
              >
                All Books
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.name)}
                  className="whitespace-nowrap"
                >
                  {category.name} ({category.bookCount})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Results Header */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'Search Results' : selectedCategory}
              </h1>
              {pagination && (
                <p className="text-gray-600">
                  Showing {books.length} of {pagination.totalCount} books
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Show recommendation when no search or filter is active */}
            {!searchQuery && selectedCategory === 'all' ? (
              <div className="max-w-5xl mx-auto">
                <RandomBookRecommendation />
              </div>
            ) : (
              <>
                {/* Books Grid/List */}
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }>
                  {books.map(viewMode === 'grid' ? renderBookCard : renderBookListItem)}
                </div>

                {/* No Results */}
                {books.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No books found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                        setCurrentPage(1)
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      disabled={!pagination.hasPrev}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>

                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1
                      const isCurrentPage = page === currentPage
                      const isNearCurrent = Math.abs(page - currentPage) <= 2 ||
                        page === 1 ||
                        page === pagination.totalPages

                      if (!isNearCurrent && i > 0 && i < pagination.totalPages - 1) {
                        if (Math.abs(page - currentPage) === 3) {
                          return <span key={i} className="px-2">...</span>
                        }
                        return null
                      }

                      return (
                        <Button
                          key={i}
                          variant={isCurrentPage ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                          disabled={!isNearCurrent && !isCurrentPage}
                        >
                          {page}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      disabled={!pagination.hasNext}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
