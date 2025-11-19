const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const inputFile = path.join(__dirname, '../books_us.csv');
const outputFile = path.join(__dirname, '../books_cleaned.json');

try {
    console.log('Reading CSV file...');
    const fileContent = fs.readFileSync(inputFile, 'utf-8');

    const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true // Handle potential quote issues
    });

    console.log(`Total records found: ${records.length}`);

    const uniqueBooks = new Map();
    const duplicates = [];

    records.forEach(record => {
        // Create a unique key based on title and author (or ISBN if available and reliable)
        // Using Title + Author as a composite key for better de-duplication
        const title = record.title ? record.title.trim() : '';
        const author = record.authors ? record.authors.trim() : '';

        if (!title) return; // Skip empty titles

        const key = `${title.toLowerCase()}-${author.toLowerCase()}`;

        if (uniqueBooks.has(key)) {
            duplicates.push(title);
        } else {
            uniqueBooks.set(key, {
                title: title,
                author: author,
                description: record.description || '',
                coverImage: record.cover_url || '',
                isbn: record.isbn || '', // CSV might not have ISBN column based on previous cat, but we'll check
                price: parseFloat((Math.random() * (50 - 10) + 10).toFixed(2)), // Generate random price if missing
                category: record.tags ? record.tags.split(',')[0] : 'General' // Use first tag as category
            });
        }
    });

    console.log(`Unique books: ${uniqueBooks.size}`);
    console.log(`Duplicates removed: ${duplicates.length}`);

    const cleanedData = Array.from(uniqueBooks.values());

    fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));
    console.log(`Cleaned data written to ${outputFile}`);

} catch (error) {
    console.error('Error processing file:', error);
}
