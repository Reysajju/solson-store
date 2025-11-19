import { PrismaClient, User, Review } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const REVIEW_TEMPLATES = {
  positive: [
    "Absolutely loved this book! Couldn't put it down.",
    "A masterpiece. The author really outdid themselves.",
    "Highly recommended for anyone interested in this topic.",
    "Changed my perspective completely. Five stars!",
    "One of the best books I've read this year.",
    "Incredible depth and insight. A must-read.",
    "Beautifully written and very engaging.",
    "I learned so much from this. Worth every penny.",
    "Fantastic read. Will definitely read more from this author.",
    "Simply brilliant. I'm buying copies for all my friends."
  ],
  neutral: [
    "It was okay, but I expected more.",
    "Good concepts, but the execution was a bit dry.",
    "Decent read, but not life-changing.",
    "Some parts were great, others were boring.",
    "Average book. Good for a quick read.",
    "It has some good points, but it's a bit repetitive.",
    "Not bad, but there are better books on this subject.",
    "A bit slow in the beginning, but it gets better.",
    "Solid 3 stars. Nothing special.",
    "It was fine. I might read it again someday."
  ],
  negative: [
    "Disappointed. The description was misleading.",
    "Hard to follow and poorly structured.",
    "I couldn't finish it. Very boring.",
    "Not what I expected at all. Waste of time.",
    "Poorly written and full of errors.",
    "I don't get the hype. It was terrible.",
    "Save your money. This is not worth it.",
    "Very superficial. Lacks depth.",
    "I regret buying this. One star.",
    "The author rambles too much. Needs editing."
  ]
}

function getRandomReview(rating: number) {
  let templates;
  if (rating >= 4) templates = REVIEW_TEMPLATES.positive;
  else if (rating === 3) templates = REVIEW_TEMPLATES.neutral;
  else templates = REVIEW_TEMPLATES.negative;

  return templates[Math.floor(Math.random() * templates.length)];
}

// Re-writing the main function with better logic
async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.review.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.book.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleared existing data')

  // Create categories
  const categories = ['Business', 'Technology', 'Self-Help', 'Finance', 'Health', 'Education', 'Fiction', 'Science', 'History', 'Biography', 'General']
  const categoryMap = new Map()

  for (const name of categories) {
    const category = await prisma.category.create({
      data: {
        name,
        description: `Books about ${name}`
      }
    })
    categoryMap.set(name, category.id)
  }

  console.log('✅ Categories created')

  // Create MANY users for reviews (need at least 1500 to support max reviews)
  console.log('Creating users (this may take a moment)...')

  // Batch create users
  const totalUsers = 2000;
  const usersData: { email: string; name: string }[] = [];
  for (let i = 0; i < totalUsers; i++) {
    usersData.push({
      email: `user${i}@example.com`,
      name: `Reviewer ${i + 1}`,
    })
  }

  const createdUsers: User[] = [];
  const userChunkSize = 100;
  for (let i = 0; i < usersData.length; i += userChunkSize) {
    const chunk = usersData.slice(i, i + userChunkSize);
    const promises = chunk.map(u => prisma.user.create({ data: u }));
    const results = await Promise.all(promises);
    createdUsers.push(...results);
    process.stdout.write('.');
  }
  console.log('\n✅ Users created')

  // Load cleaned books
  const booksDataPath = path.join(__dirname, '../books_cleaned.json')
  const booksData = JSON.parse(fs.readFileSync(booksDataPath, 'utf-8'))

  console.log(`📚 Seeding ${booksData.length} books...`)

  for (const bookData of booksData) {
    const categoryId = categoryMap.get(bookData.category) || categoryMap.get('General')

    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        isbn: bookData.isbn || undefined,
        price: bookData.price,
        coverImage: bookData.coverImage,
        categoryId: categoryId,
        featured: Math.random() > 0.8,
        publishDate: new Date(),
        language: 'English'
      }
    })

    // Generate random reviews (200-1500)
    const numReviews = Math.floor(Math.random() * (1500 - 200 + 1)) + 200

    // Shuffle users to get unique reviewers for this book
    const selectedUserIndices = new Set<number>();
    while (selectedUserIndices.size < numReviews) {
      selectedUserIndices.add(Math.floor(Math.random() * createdUsers.length));
    }

    const bookReviews: any[] = [];
    for (const index of selectedUserIndices) {
      const user = createdUsers[index];
      const rand = Math.random()
      let rating
      if (rand > 0.3) rating = Math.floor(Math.random() * 2) + 4
      else if (rand > 0.1) rating = 3
      else rating = Math.floor(Math.random() * 2) + 1

      bookReviews.push({
        userId: user.id,
        bookId: book.id,
        rating,
        comment: getRandomReview(rating),
        verified: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      })
    }

    // Insert reviews using createMany
    // SQLite supports createMany
    await prisma.review.createMany({
      data: bookReviews
    })
    process.stdout.write('*');
  }
  console.log('\n✅ Reviews created')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })