import BookCatalog from '@/components/BookCatalog'
import { Book } from '@/types' // Assuming Book type is globally available or defined in types/index.ts

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

export default async function CatalogPage() {
  // Fetch initial data on the server
  let initialBooks: Book[] = [];
  let initialCategories: Category[] = [];
  let initialPagination: BooksResponse['pagination'] | null = null;
  let errorFetchingData = false;

  try {
    // Only fetch categories, not books (books will be shown only after search/filter)
    const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/api/categories`, { cache: 'no-store' });

    if (!categoriesResponse.ok) {
      console.error('Failed to fetch initial data:', categoriesResponse.status);
      errorFetchingData = true;
    } else {
      const categoriesData = await categoriesResponse.json();
      initialCategories = categoriesData.categories;
    }
  } catch (error) {
    console.error('Error during server-side data fetch for CatalogPage:', error);
    errorFetchingData = true;
  }

  if (errorFetchingData) {
    // You might want to render an error state here or redirect
    return <div>Failed to load catalog. Please try again later.</div>;
  }

  return (
    <BookCatalog
      initialBooks={initialBooks}
      initialCategories={initialCategories}
      initialPagination={initialPagination}
    />
  );
}
