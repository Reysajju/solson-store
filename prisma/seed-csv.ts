import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface CSVBook {
  title: string
  authors: string
  cover_url: string
  description: string
  tags: string
  source_url: string
}

async function fetchGoogleBooksCover(title: string, author: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} ${author}`)
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&key=AIzaSyB3B2p8c8Y8nK4d7s5t6r3v2w1x0y9z7`)
    
    if (!response.ok) {
      console.warn(`Google Books API error for ${title}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const book = data.items[0]
      const imageLinks = book.volumeInfo?.imageLinks
      if (imageLinks?.thumbnail) {
        // Get higher quality cover if available
        return imageLinks.extraLarge?.replace('http://', 'https://') || 
               imageLinks.large?.replace('http://', 'https://') || 
               imageLinks.medium?.replace('http://', 'https://') || 
               imageLinks.thumbnail?.replace('http://', 'https://')
      }
    }
  } catch (error) {
    console.warn(`Error fetching Google Books cover for ${title}:`, error)
  }
  
  return null
}

function parseCSV(csvContent: string): CSVBook[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split('|').map(h => h.trim())
  const books: CSVBook[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('|').map(v => v.trim())
    if (values.length >= headers.length) {
      const book: any = {}
      headers.forEach((header, index) => {
        book[header] = values[index] && values[index].trim() !== '' ? values[index].trim() : ''
      })
      
      // Only skip if both title and author are completely empty
      if (book.title && book.authors && book.title.trim() !== '' && book.authors.trim() !== '') {
        books.push(book as CSVBook)
      }
    }
  }
  
  return books
}

function parseCommaDelimitedCSV(csvContent: string): CSVBook[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const books: CSVBook[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const book: any = {};
    let currentField = '';
    let inQuotes = false;
    let fieldIndex = 0;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        book[headers[fieldIndex]] = currentField.trim();
        currentField = '';
        fieldIndex++;
      } else {
        currentField += char;
      }
    }
    book[headers[fieldIndex]] = currentField.trim();
    
    if (book.title && book.authors && book.title.trim() !== '' && book.authors.trim() !== '') {
      books.push(book as CSVBook);
    }
  }

  return books;
}

function mapCategoryToExisting(tag: string): string {
  const tagLower = tag.toLowerCase()
  
  if (tagLower.includes('mathematics') || tagLower.includes('math') || tagLower.includes('probability') || tagLower.includes('statistics')) {
    return 'Mathematics'
  }
  if (tagLower.includes('business') || tagLower.includes('economics') || tagLower.includes('marketing')) {
    return 'Business'
  }
  if (tagLower.includes('technology') || tagLower.includes('engineering') || tagLower.includes('computer')) {
    return 'Technology'
  }
  if (tagLower.includes('self-help') || tagLower.includes('psychology') || tagLower.includes('personal')) {
    return 'Self-Help'
  }
  if (tagLower.includes('music') || tagLower.includes('art') || tagLower.includes('literature')) {
    return 'Arts'
  }
  if (tagLower.includes('education') || tagLower.includes('teaching') || tagLower.includes('learning')) {
    return 'Education'
  }
  if (tagLower.includes('health') || tagLower.includes('medical') || tagLower.includes('biochemistry')) {
    return 'Health'
  }
  if (tagLower.includes('science') || tagLower.includes('chemistry') || tagLower.includes('physics') || tagLower.includes('biology') || tagLower.includes('botany') || tagLower.includes('nature')) {
    return 'Science'
  }
  if (tagLower.includes('history') || tagLower.includes('anthropology') || tagLower.includes('archaeology')) {
    return 'History'
  }
  
  return 'General'
}

async function main() {
  console.log('🌱 Seeding database with CSV books...')

  try {
    // Clear existing data to avoid duplicates (in correct order due to foreign keys)
    await prisma.review.deleteMany({})
    await prisma.book.deleteMany({})
    console.log('🗑️ Cleared existing books and reviews')

    // Create comprehensive categories
    const categories = [
      { name: 'Mathematics', description: 'Mathematics, statistics, probability, and mathematical theory' },
      { name: 'Business', description: 'Business, economics, marketing, and entrepreneurship' },
      { name: 'Technology', description: 'Technology, engineering, computer science, and programming' },
      { name: 'Self-Help', description: 'Personal development, psychology, and self-improvement' },
      { name: 'Arts', description: 'Arts, literature, music, and cultural studies' },
      { name: 'Education', description: 'Education, teaching, and learning methodologies' },
      { name: 'Health', description: 'Health, medicine, wellness, and life sciences' },
      { name: 'Science', description: 'Science, research, and natural phenomena' },
      { name: 'History', description: 'History, anthropology, and historical studies' },
      { name: 'General', description: 'General literature and miscellaneous topics' }
    ]

    const createdCategories = await Promise.all(
      categories.map(cat => 
        prisma.category.upsert({
          where: { name: cat.name },
          update: cat,
          create: cat
        })
      )
    )

    const categoryMap = new Map(createdCategories.map(cat => [cat.name, cat.id]))
    console.log(`✅ Created ${createdCategories.length} categories`)

    // Read and parse CSV files
    const csvFiles = ['books_us.csv', 'books_us (1).csv']
    let allBooks: CSVBook[] = []

    for (const file of csvFiles) {
      try {
        const csvPath = path.join(process.cwd(), file)
        if (fs.existsSync(csvPath)) {
          const csvContent = fs.readFileSync(csvPath, 'utf-8')
          let books: CSVBook[];
          if (file === 'books_us.csv') {
            books = parseCommaDelimitedCSV(csvContent);
          } else {
            books = parseCSV(csvContent)
          }
          allBooks = allBooks.concat(books)
          console.log(`📖 Loaded ${books.length} books from ${file}`)
        } else {
          console.warn(`⚠️ CSV file not found: ${file}`)
        }
      } catch (error) {
        console.error(`❌ Error reading ${file}:`, error)
      }
    }

    console.log(`📚 Total books to process: ${allBooks.length}`)

    // Process books in batches to avoid overwhelming Google Books API
    const batchSize = 10
    let processedCount = 0

    for (let i = 0; i < allBooks.length; i += batchSize) {
      const batch = allBooks.slice(i, i + batchSize)
      
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allBooks.length/batchSize)}`)
      
      for (const csvBook of batch) {
        try {
          if (!csvBook.title || !csvBook.authors) {
            console.warn(`⚠️ Skipping book with missing title or author: ${csvBook.title}`)
            continue
          }

          // Map category
          const categoryName = mapCategoryToExisting(csvBook.tags)
          const categoryId = categoryMap.get(categoryName)
          
          if (!categoryId) {
            console.warn(`⚠️ Category not found: ${categoryName}`)
            continue
          }

          // Use CSV cover URL directly (no API key needed)
          const coverImage = csvBook.cover_url || null

          // Generate a reasonable price based on category and content
          const basePrice = categoryName === 'Mathematics' ? 49.99 :
                         categoryName === 'Business' ? 39.99 :
                         categoryName === 'Technology' ? 44.99 :
                         categoryName === 'Health' ? 34.99 :
                         categoryName === 'Science' ? 42.99 :
                         29.99

          // Add some variation
          const price = basePrice + (Math.random() * 20 - 10)

          await prisma.book.create({
            data: {
              title: csvBook.title,
              author: csvBook.authors,
              description: csvBook.description || `A comprehensive book on ${csvBook.tags || categoryName.toLowerCase()}.`,
              isbn: `978-${Math.random().toString(36).substr(2, 9)}`,
              price: Math.max(9.99, Math.round(price * 100) / 100),
              coverImage,
              format: 'PDF',
              language: 'English',
              publisher: 'Solson Publications',
              publishDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              pageCount: Math.floor(Math.random() * 400) + 150,
              featured: Math.random() > 0.8, // 20% chance of being featured
              categoryId
            }
          })

          processedCount++
          
          if (processedCount % 10 === 0) {
            console.log(`✅ Processed ${processedCount} books`)
          }

          // Add delay to avoid rate limiting (not needed for CSV URLs but keeping for stability)
          await new Promise(resolve => setTimeout(resolve, 50))

        } catch (error) {
          console.error(`❌ Error processing book "${csvBook.title}":`, error)
        }
      }
    }

    console.log(`🎉 Successfully processed ${processedCount} books`)

    // Create some sample reviews
    const sampleUser = await prisma.user.upsert({
      where: { email: 'reader@example.com' },
      update: {},
      create: {
        email: 'reader@example.com',
        name: 'Sample Reader'
      }
    })

    const books = await prisma.book.findMany({ take: 20 })
    
    for (const book of books) {
      const rating = Math.floor(Math.random() * 2) + 4 // 4 or 5 stars
      await prisma.review.create({
        data: {
          userId: sampleUser.id,
          bookId: book.id,
          rating,
          comment: rating === 5 ? 'Excellent book! Very well written and informative.' : 'Good book with valuable insights.',
          verified: true
        }
      })
    }

    console.log('✅ Sample reviews created')
    console.log('🎉 Database seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })