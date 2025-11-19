import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const checkoutSchema = z.object({
  shippingInfo: z.record(z.any()).refine((val) => Object.keys(val).length > 0, "Shipping info is required"),
  paymentMethod: z.string().min(1, "Payment method is required")
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
    const result = checkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).errors[0].message },
        { status: 400 }
      )
    }

    const { shippingInfo, paymentMethod } = result.data

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = user.id

    // Get cart items
    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: {
        book: true
      }
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0)
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + tax

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Use transaction to ensure order creation and cart clearing happen atomically
    const order = await db.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          tax,
          total,
          status: 'pending',
          paymentMethod,
          shippingInfo: shippingInfo as any,
          orderItems: {
            create: cartItems.map(item => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: item.book.price
            }))
          }
        }
      })

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId }
      })

      // In a real app, you would process payment here
      // For demo purposes, we'll simulate successful payment
      await tx.order.update({
        where: { id: newOrder.id },
        data: {
          status: 'completed',
          paymentId: `PAY-${Date.now()}`
        }
      })

      return newOrder
    })

    return NextResponse.json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'completed',
        total: order.total,
        items: cartItems.map(item => ({
          title: item.book.title,
          author: item.book.author,
          quantity: item.quantity,
          price: item.book.price
        }))
      }
    })
  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}