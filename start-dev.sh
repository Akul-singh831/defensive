#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting Ethical Hacking Project..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo "   Please copy .env.local.example to .env.local and fill in your credentials"
    exit 1
fi

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Error: bun is not installed"
    echo "   Install from https://bun.sh"
    exit 1
fi

echo "✅ Environment file found"
echo "✅ bun is available"
echo ""

# Run database sync
echo "📦 Syncing database schema with Turso..."
bun run db:sync || {
    echo "⚠️  Database sync had issues (using local fallback if configured)"
    echo "   Continuing with dev server..."
}

echo ""
echo "🎯 Starting development server..."
echo "   Navigate to: http://localhost:3000"
echo ""
echo "📍 Available routes:"
echo "   - Main Dashboard:       http://localhost:3000"
echo "   - Admissions Portal:    http://localhost:3000/admissions"
echo "   - Academic Portal:      http://localhost:3000/academic"
echo "   - Authentication Login: http://localhost:3000/auth/login"
echo ""
echo "🔑 Test Credentials:"
echo "   - Admin:   admin@university.edu    / AdminPass123!"
echo "   - Faculty: faculty1@university.edu / FacultyPass123!"
echo "   - Student: student1@university.edu / StudentPass123!"
echo ""

# Start the dev server
bun run dev
