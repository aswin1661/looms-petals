# Production Build Script (Windows)
# Run this before deploying to production

Write-Host "🚀 Starting Production Build Process..." -ForegroundColor Green
Write-Host ""

# Step 1: Clean previous builds
Write-Host "📦 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
if (Test-Path out) { Remove-Item out -Recurse -Force }
if (Test-Path node_modules/.cache) { Remove-Item node_modules/.cache -Recurse -Force }
Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Run linter (optional)
Write-Host "🔍 Running linter..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Linter found issues (non-blocking)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Build for production
Write-Host "🏗️  Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

Write-Host "✨ Production build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test locally: npm start"
Write-Host "2. Deploy to your hosting platform"
Write-Host "3. Verify environment variables are set"
Write-Host "4. Test all critical flows"
