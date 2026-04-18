#!/usr/bin/env bash

# Finance Tracker Backend API - Quick Reference

echo "🚀 Finance Tracker Backend API System"
echo "======================================"
echo ""

echo "📊 Statistics:"
echo "  - TypeScript files: 34"
echo "  - Total LOC: ~2,877 lines"
echo "  - API endpoints: 30+"
echo "  - Helper modules: 4"
echo "  - Utility modules: 2"
echo ""

echo "📁 Main directories:"
echo "  - app/api/_helper/    (auth, errors, request, response)"
echo "  - app/api/_utils/     (dashboard, normalizers)"
echo "  - app/api/v1/         (versioned API routes)"
echo ""

echo "🏃 Quick commands:"
echo "  npm run dev                  Start development server"
echo "  npm run test:api:smoke       Run smoke tests"
echo "  npm run lint -- app/api      Lint API code"
echo "  npx tsc --noEmit             Type check"
echo ""

echo "🧪 Test API endpoints:"
echo "  curl http://localhost:3000/api/v1/health"
echo "  curl -X POST http://localhost:3000/api/v1/auth/signup \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@example.com\",\"password\":\"pass\",\"name\":\"Test\"}'"
echo ""

echo "📖 Documentation:"
echo "  - BACKEND_API_SUMMARY.md   (overview & guide)"
echo "  - API_IMPLEMENTATION.md    (detailed docs)"
echo "  - app/api/README.md        (quick reference)"
echo ""

echo "✅ All systems ready!"

