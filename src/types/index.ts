export interface Review {
  id: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  user: {
    name: string | null;
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string; // Added description
  price: number;
  coverImage?: string;
  format?: string; // Added format
  language?: string; // Added language for completeness based on schema
  featured: boolean; // Added featured
  createdAt: string; // Added createdAt
  category: {
    id: string; // Added category id for consistency
    name: string;
  };
  averageRating: number;
  reviewCount: number;
  reviews?: Review[];
}
