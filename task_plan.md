# Task Plan: Fix Book Catalog Database Integration

## Objective
- Fix catalog to fetch all books from database instead of showing 8 hardcoded books
- Remove admin logic and superadmin login functionality
- Use portable Node.js at C:\Users\sajjad.rasool\Downloads\node-v24.11.0-win-x64

## Steps
- [ ] Analyze current project structure and identify hardcoded books
- [ ] Examine database schema and API endpoints
- [ ] Check catalog component implementation
- [ ] Set up portable Node.js environment
- [ ] Fix API endpoint to fetch all books from database
- [ ] Update catalog component to use database data
- [ ] Remove admin/superadmin login logic
- [ ] Test the implementation
- [ ] Verify all books are displayed correctly

## Files to Examine
- src/app/catalog/page.tsx
- src/components/BookCatalog.tsx
- src/app/api/books/route.ts
- prisma/schema.prisma
- Database files in db/ and prisma/db/
