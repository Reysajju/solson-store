import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    let page = parseInt(searchParams.get('page') || '1')
    if (isNaN(page) || page < 1) page = 1

    let limit = parseInt(searchParams.get('limit') || '12')
    if (isNaN(limit) || limit < 1) limit = 12
    if (limit > 100) limit = 100 // Cap limit to prevent abuse

    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    let skip = (page - 1) * limit

    // Random book query
    const random = searchParams.get('random')

    if (featured === 'true') {
      limit = 20; // Reasonable limit for featured books
      skip = 0;
    }

    if (random === 'true') {
      // For random selection, we'll get total count first, then pick random offset
      const totalCount = await db.book.count({
        where: { status: 'active', featured: true }
      })
      if (totalCount > 0) {
        skip = Math.floor(Math.random() * totalCount)
        limit = 1
      }
    }

    // Build where clause
    const where: any = {
      status: 'active'
    }

    if (category && category !== 'all') {
      where.category = {
        name: category
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Get books with pagination
    const [books, totalCount] = await Promise.all([
      db.book.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      db.book.count({ where })
    ])

    // Calculate average rating for each book
    const booksWithRating = books.map(book => {
      const reviewCount = book.reviews.length;
      const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviewCount > 0 ? parseFloat((totalRating / reviewCount).toFixed(1)) : 0;

      // Remove reviews from the response to reduce payload size
      const { reviews, ...bookWithoutReviews } = book;

      return {
        ...bookWithoutReviews,
        coverImage: book.coverImage || `https://picsum.photos/seed/${book.id}/400/600`, // Keep placeholder if no image
        averageRating,
        reviewCount,
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      books: booksWithRating,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}
