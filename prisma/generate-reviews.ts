import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Realistic review templates for different rating levels
const reviewTemplates = {
    5: [
        "Absolutely brilliant! This book exceeded all my expectations. The author's writing style is engaging and the content is incredibly insightful. Highly recommend to anyone interested in this subject.",
        "One of the best books I've read this year. The depth of research and clarity of explanation make complex topics accessible. A must-read!",
        "Outstanding work! Every page offers valuable insights. The practical examples and clear explanations make this an essential resource.",
        "Exceptional quality throughout. The author demonstrates deep expertise while remaining accessible to readers. Cannot recommend this highly enough.",
        "This book is a masterpiece. Comprehensive coverage, excellent writing, and practical applications. Worth every penny.",
        "Phenomenal read! The content is well-organized, thoroughly researched, and presented in an engaging manner. Five stars without hesitation.",
        "Simply amazing. This book transformed my understanding of the subject. The author's expertise shines through on every page.",
        "A true gem! The insights provided are invaluable and the writing is crisp and clear. This belongs on every serious reader's shelf.",
    ],
    4: [
        "Really enjoyed this book. Well-written and informative, though some sections could have been more concise. Overall, highly recommended.",
        "Solid resource with good coverage of the topic. A few areas could be expanded, but generally an excellent read.",
        "Very good book that delivers on its promises. The examples are helpful and the content is relevant. Minor quibbles aside, well worth reading.",
        "Impressive work overall. Some chapters are stronger than others, but the quality is consistently good throughout.",
        "A strong addition to the literature. Clear writing and useful insights, with only minor room for improvement.",
        "Great book with plenty of valuable content. Occasionally dense but generally accessible and worthwhile.",
        "Well-researched and thoughtfully presented. A few sections felt repetitive, but overall an excellent resource.",
    ],
    3: [
        "Decent book with some good insights, although it covers familiar ground in places. Worth reading for specific sections.",
        "A mixed bag. Some parts are excellent, others feel rushed. Still valuable for those interested in the topic.",
        "Reasonable introduction to the subject. Not groundbreaking, but competent and accessible.",
        "Meets expectations. The content is solid if unremarkable. Good for beginners but experienced readers may want more depth.",
        "Fair coverage of the topic. Some sections shine while others could use more development. A respectable effort.",
        "Average quality overall. Has its moments but doesn't stand out from similar books in the field.",
    ],
    2: [
        "Disappointing. The book promised more than it delivered. Some useful information but too much filler content.",
        "Below expectations. The writing is uneven and the organization could be much better. Only recommended with reservations.",
        "Not particularly impressive. Repetitive in places and lacking depth in others. There are better alternatives available.",
        "Underwhelming read. While not without merit, the book fails to deliver on its ambitious scope.",
    ],
    1: [
        "Unfortunately not worth the time. The content is poorly organized and lacks depth. Would not recommend.",
        "Very disappointing. Expected much more based on the description. Save your money and look elsewhere.",
    ]
}

// Helper names for review authors
const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
]

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
]

function getRandomReviewText(rating: number): string {
    const templates = reviewTemplates[rating as keyof typeof reviewTemplates] || reviewTemplates[3]
    return templates[Math.floor(Math.random() * templates.length)]
}

function getRandomName(): string {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    return `${firstName} ${lastName}`
}

function getRandomRating(): number {
    // Weight towards higher ratings (more realistic distribution)
    const rand = Math.random()
    if (rand < 0.5) return 5      // 50% 5-star
    if (rand < 0.75) return 4     // 25% 4-star
    if (rand < 0.9) return 3      // 15% 3-star
    if (rand < 0.97) return 2     // 7% 2-star
    return 1                       // 3% 1-star
}

async function checkAndRemoveDuplicates() {
    console.log('🔍 Checking for duplicate books...')

    // Find duplicates by title and author
    const books = await prisma.book.findMany({
        select: {
            id: true,
            title: true,
            author: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    const seen = new Map<string, string>()
    const duplicates: string[] = []

    for (const book of books) {
        const key = `${book.title.toLowerCase().trim()}|${book.author.toLowerCase().trim()}`
        if (seen.has(key)) {
            duplicates.push(book.id)
        } else {
            seen.set(key, book.id)
        }
    }

    if (duplicates.length > 0) {
        console.log(`❌ Found ${duplicates.length} duplicate books`)

        // Delete reviews for duplicate books first
        await prisma.review.deleteMany({
            where: {
                bookId: {
                    in: duplicates
                }
            }
        })

        // Then delete the duplicate books
        const { count } = await prisma.book.deleteMany({
            where: {
                id: {
                    in: duplicates
                }
            }
        })
        console.log(`🗑️ Deleted ${count} duplicate books and their reviews.`)
    } else {
        console.log('✅ No duplicate books found.')
    }
}

async function generateReviews() {
    console.log('Generating reviews...')
    const books = await prisma.book.findMany()
    console.log(`Found ${books.length} books`)

    // Create users for reviews
    // Need enough users to support max reviews per book (1500)
    console.log('Creating users...')
    const users: any[] = []
    for (let i = 0; i < 2000; i++) {
        const name = getRandomName()
        const email = `${name.toLowerCase().replace(' ', '.')}.${i}@example.com`

        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name
            }
        })
        users.push(user)
    }

    console.log(`✅ Created/found ${users.length} review users`)

    let totalReviews = 0
    let processedBooks = 0

    for (const book of books) {
        // Random number of reviews between 200-1500 (capped by available users)
        const maxReviews = Math.min(1500, users.length)
        const reviewCount = Math.floor(Math.random() * (maxReviews - 200 + 1)) + 200

        // Shuffle users to get random unique reviewers
        const shuffledUsers = [...users].sort(() => 0.5 - Math.random())
        const selectedUsers = shuffledUsers.slice(0, reviewCount)

        const reviews = []
        for (const user of selectedUsers) {
            const rating = getRandomRating()
            const comment = getRandomReviewText(rating)

            reviews.push({
                userId: user.id,
                bookId: book.id,
                rating,
                comment,
                verified: Math.random() > 0.3, // 70% verified purchases
                createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
            })
        }

        // Batch insert reviews
        await prisma.review.createMany({
            data: reviews
        })

        totalReviews += reviewCount
        processedBooks++

        if (processedBooks % 50 === 0) {
            console.log(`✅ Processed ${processedBooks}/${books.length} books (${totalReviews} reviews so far)`)
        }
    }

    console.log(`🎉 Successfully generated ${totalReviews} reviews for ${books.length} books`)
    console.log(`📊 Average: ${Math.round(totalReviews / books.length)} reviews per book`)
}

async function main() {
    try {
        await checkAndRemoveDuplicates()
        await generateReviews()
    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('❌ Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
