'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link' // Import Link
import { Card, CardContent } from '@/components/ui/card'
import { Book } from '@/types'

interface CategoryData {
  name: string;
  books: Book[];
}

export function FeaturedCategories() {
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesWithBooks();
  }, []);

  const fetchCategoriesWithBooks = async () => {
    try {
      setLoading(true);
      // Fetch categories first
      const categoriesResponse = await fetch('/api/categories');
      const categories = await categoriesResponse.json();

      const categoriesWithBooks: CategoryData[] = [];

      for (const category of categories.categories) {
        // For each category, fetch a few books
        const booksResponse = await fetch(`/api/books?category=${category.name}&limit=3`);
        const booksData = await booksResponse.json();
        categoriesWithBooks.push({
          name: category.name,
          books: booksData.books,
        });
      }
      setCategoriesData(categoriesWithBooks);
    } catch (error) {
      console.error('Error fetching featured categories with books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="categories" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden group animate-pulse">
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="w-1/3 h-24 bg-gray-200 rounded-sm shadow-md"></div>
                    <div className="w-1/3 h-24 bg-gray-200 rounded-sm shadow-md"></div>
                    <div className="w-1/3 h-24 bg-gray-200 rounded-sm shadow-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoriesData.map((category, index) => (
            <Card key={index} className="overflow-hidden group">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                <div className="flex space-x-2">
                  {category.books.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} className="w-1/3">
                      <img src={book.coverImage || '/books/placeholder-cover.jpg'} alt={`${book.title}`} className="w-full h-auto rounded-sm shadow-md" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
