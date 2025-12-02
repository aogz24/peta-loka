# 🚀 Command Reference

Quick reference untuk semua command yang tersedia.

## 📦 Installation

```bash
# Install dependencies
npm install

# Install specific package
npm install @supabase/supabase-js
```

## 🗄️ Database Migration

```bash
# Migrate semua data (pelatihan + umkm + wisata)
npm run migrate

# Migrate hanya pelatihan
node scripts/migrate-to-supabase.js --table=pelatihan

# Migrate hanya umkm
node scripts/migrate-to-supabase.js --table=umkm

# Migrate hanya wisata
node scripts/migrate-to-supabase.js --table=wisata

# Migrate dengan batch size custom
node scripts/migrate-to-supabase.js --batch-size=500

# Kombinasi
node scripts/migrate-to-supabase.js --table=umkm --batch-size=100
```

## 💻 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🧪 Testing API

### Using curl:

```bash
# Test pelatihan API
curl http://localhost:3000/api/pelatihan

# Test umkm API
curl http://localhost:3000/api/umkm

# Test wisata API
curl http://localhost:3000/api/wisata

# Test clustering API
curl http://localhost:3000/api/clustering?clusters=5

# Test with filters
curl "http://localhost:3000/api/umkm?category=convenience&limit=10"
```

### Using browser:

```
http://localhost:3000/api/pelatihan
http://localhost:3000/api/umkm
http://localhost:3000/api/wisata
http://localhost:3000/api/clustering?clusters=5
```

## 🗺️ Access Application

```bash
# After running npm run dev
http://localhost:3000
```

## 🔍 Supabase Dashboard

SQL queries yang berguna:

```sql
-- Count records per table
SELECT
  'pelatihan' as table_name,
  COUNT(*) as count
FROM pelatihan
UNION ALL
SELECT
  'umkm' as table_name,
  COUNT(*) as count
FROM umkm
UNION ALL
SELECT
  'wisata' as table_name,
  COUNT(*) as count
FROM wisata;

-- Get top 10 categories in UMKM
SELECT
  category,
  COUNT(*) as count
FROM umkm
GROUP BY category
ORDER BY count DESC
LIMIT 10;

-- Get locations near a point
SELECT
  name,
  category,
  lat,
  lon
FROM umkm
WHERE
  lat BETWEEN -6.92 AND -6.91
  AND lon BETWEEN 107.60 AND 107.62
LIMIT 20;

-- Delete all data (use with caution!)
DELETE FROM pelatihan;
DELETE FROM umkm;
DELETE FROM wisata;
```

## 🔐 Environment Variables

```bash
# Check if .env.local exists
ls -la .env.local

# View .env.local (without showing in terminal)
cat .env.local

# Copy from example
cp .env.example .env.local
```

## 📊 Data Statistics

```bash
# Count lines in JSON files (approximate record count)
# Linux/Mac:
wc -l lib/data/*.json

# Windows PowerShell:
Get-ChildItem lib/data/*.json | ForEach-Object {
  $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
  "$($_.Name): $lines lines"
}
```

## 🐛 Debugging

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
# Windows:
netstat -ano | findstr :3000

# Kill process on port 3000 (Windows)
# Get PID from netstat command above, then:
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

## 📝 Git Commands (for version control)

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit changes
git commit -m "Migrate to Supabase"

# Create .gitignore
echo "node_modules/
.next/
.env.local
*.log" > .gitignore

# Push to remote
git remote add origin <your-repo-url>
git push -u origin main
```

## 🔄 Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update @supabase/supabase-js

# Update to latest (including major versions)
npm install <package>@latest
```

## 🧹 Cleanup

```bash
# Remove node_modules
rm -rf node_modules

# Remove build output
rm -rf .next

# Remove log files
rm -rf *.log

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation Commands

```bash
# Generate API docs (if using tool like jsdoc)
npx jsdoc lib/services/*.js -d docs

# Serve docs locally
npx http-server docs
```

## 🚀 Deployment

### Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables for Production:

Remember to set in Vercel dashboard:

- `KOLOSAL_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAP_CENTER_LAT`
- `NEXT_PUBLIC_MAP_CENTER_LNG`
- `NEXT_PUBLIC_MAP_ZOOM`

---

**Pro Tip:** Bookmark this file untuk reference cepat! 🔖
