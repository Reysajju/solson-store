'use client'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const addToCartSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  quantity: z.number().int().positive().default(1)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = addToCartSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).errors[0].message },
        { status: 400 }
      )
    }

    const { bookId, quantity } = result.data

    // Find the book
    const book = await db.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await db.cartItem.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      }
    })

    let cartItem
    if (existingCartItem) {
      // Update quantity
      cartItem = await db.cartItem.update({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId
          }
        },
        data: {
          quantity: existingCartItem.quantity + quantity
        }
      })
    } else {
      // Create new cart item
      cartItem = await db.cartItem.create({
        data: {
          userId: user.id,
          bookId,
          quantity
        }
      })
    }

    // Return updated cart
    const updatedCartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        book: {
          select: {
            title: true,
            price: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    })

    const subtotal = updatedCartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0)
    const tax = subtotal * 0.08
    const total = subtotal + tax

    return NextResponse.json({
      message: 'Item added to cart successfully',
      cartItems: updatedCartItems.map(item => ({
        ...item,
        book: {
          ...item.book,
          averageRating: item.book.reviews.length > 0
            ? item.book.reviews.reduce((sum, review) => sum + review.rating, 0) / item.book.reviews.length
            : 0,
          reviewCount: item.book.reviews.length
        }
      })),
      summary: {
        itemCount: updatedCartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        tax,
        total
      }
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { summary: { itemCount: 0, subtotal: 0, tax: 0, total: 0 }, cartItems: [] }
      )
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        book: {
          select: {
            title: true,
            price: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    })

    const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0)
    const tax = subtotal * 0.08
    const total = subtotal + tax

    return NextResponse.json({
      cartItems: cartItems.map(item => ({
        ...item,
        book: {
          ...item.book,
          averageRating: item.book.reviews.length > 0
            ? item.book.reviews.reduce((sum, review) => sum + review.rating, 0) / item.book.reviews.length
            : 0,
          reviewCount: item.book.reviews.length
        }
      })),
      summary: {
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        tax,
        total
      }
    })

  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}