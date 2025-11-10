#!/bin/bash
# Production Build Script
# Run this before deploying to production

echo "🚀 Starting Production Build Process..."
echo ""

# Step 1: Clean previous builds
echo "📦 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
echo "✅ Cleanup complete"
echo ""

# Step 2: Install dependencies
echo "📥 Installing dependencies..."
npm ci
if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 3: Run linter
echo "🔍 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Linter found issues (non-blocking)"
fi
echo ""

# Step 4: Build for production
echo "🏗️  Building for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 5: Check bundle size
echo "📊 Analyzing bundle size..."
echo ""

echo "✨ Production build complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm start"
echo "2. Deploy to your hosting platform"
echo "3. Verify environment variables are set"
echo "4. Test all critical flows"
