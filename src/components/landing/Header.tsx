'use client'

import { useState } from 'react'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  cartCount: number
  onSearch: (query: string) => void
}

export function Header({ cartCount, onSearch }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="bg-blue-900 text-white text-center py-1 text-sm">
        Free shipping on orders over $35 — 30-day returns.
      </div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <a href="/">
              <img src="/solson-logo.png" alt="Solson Publications" className="h-8 w-auto" />
            </a>
          </div>
          <div className="hidden md:flex flex-1 justify-center px-8">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search title, author, ISBN"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon"><User className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <a href="/cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <a href="#categories" className="block py-2 text-gray-700">Categories</a>
            <a href="#about" className="block py-2 text-gray-700">About</a>
            <a href="#contact" className="block py-2 text-gray-700">Contact</a>
          </nav>
        )}
      </div>
    </header>
  )
}
