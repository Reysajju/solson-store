'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function EmailCapture() {
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      alert(`Thank you for subscribing with email: ${newsletterEmail}`)
      setNewsletterEmail('')
    }
  }

  return (
    <section className="py-16 px-4 bg-blue-50">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 text-blue-900">Get 10% Off Your First Order</h2>
        <p className="text-gray-600 mb-6">Join our newsletter to get a discount and receive updates on new releases and special offers.</p>
        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="flex-grow"
            required
          />
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Subscribe</Button>
        </form>
      </div>
    </section>
  )
}
