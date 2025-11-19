@echo off
echo Setting up environment and running commands...
set "PATH=C:\Users\sajjad.rasool\Downloads\node-v24.11.0-win-x64;%PATH%"
npm run db:push && npm run db:generate && npx tsx prisma/seed-csv.ts && rmdir /s /q src\app\login && npm run dev
