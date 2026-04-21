#!/bin/bash

# Finance Tracker - Quick Reference Commands

echo "🚀 Finance Tracker - Development Environment"
echo "=============================================="
echo ""

# Backend Development
echo "📌 Backend Development:"
echo "  cd server && npm run dev              # Start backend on :4000"
echo "  cd server && npm test                 # Run backend tests"
echo "  cd server && npm run build            # Build for production"
echo ""

# Frontend Development
echo "📌 Frontend Development:"
echo "  npm run dev                           # Start frontend on :3000"
echo "  npm run build                         # Build for production"
echo "  npm start                             # Start production build"
echo ""

# Testing
echo "📌 Testing:"
echo "  cd server && npm test                 # Run all tests (10 tests)"
echo "  cd server && npm run test:watch       # Watch mode"
echo ""

# Documentation
echo "📌 Documentation:"
echo "  cat IMPLEMENTATION_SUMMARY.md         # Full implementation overview"
echo "  cat CHECKLIST.md                      # Deployment checklist"
echo "  cat ENV_SETUP.md                      # Environment configuration"
echo "  cat server/ENTERPRISE.md              # Enterprise patterns guide"
echo "  cat server/README.md                  # Backend API overview"
echo ""

# API Testing
echo "📌 API Testing (with backend running):"
echo "  curl http://localhost:4000/api/v1/health"
echo "  curl http://localhost:4000/api/v1/ready"
echo "  curl http://localhost:4000/api-docs"
echo ""

# Environment Verification
echo "📌 Environment Check:"
echo "  echo \$NEXT_PUBLIC_API_URL             # Should be http://localhost:4000/api/v1"
echo ""

# Build Verification
echo "📌 Build Verification:"
echo "  cd server && npm run build             # TypeScript compilation"
echo "  ls -la server/dist/                    # Check output"
echo ""

# Clean Commands
echo "📌 Cleanup:"
echo "  cd server && rm -rf dist node_modules && npm install"
echo "  rm -rf node_modules && npm install"
echo ""

echo "=============================================="
echo "✅ Quick start: npm run dev && cd server && npm run dev"
echo ""

