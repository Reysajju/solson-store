import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Fetch book with category and a subset of reviews
    // We'll fetch up to 50 reviews initially to show a good amount
    const book = await db.book.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Calculate actual aggregate stats
    const aggregations = await db.review.aggregate({
      where: { bookId: id },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    const averageRating = aggregations._avg.rating || 0
    const reviewCount = aggregations._count.rating || 0

    const bookWithRating = {
      ...book,
      averageRating,
      reviewCount,
      // Ensure cover image is HTTPS
      coverImage: book.coverImage?.replace('http:', 'https:') || null,
    }

    return NextResponse.json({ book: bookWithRating })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}
