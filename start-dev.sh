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
echo "📦 Syncing database schema..."
bun run db:sync || {
    echo "⚠️  Database sync had issues (this is expected if Turso is not available)"
    echo "   Continuing with dev server..."
}

echo ""
echo "🎯 Starting development server..."
echo "   Navigate to: http://localhost:3000"
echo ""
echo "📍 Available routes:"
echo "   - http://localhost:3000/admissions"
echo "   - http://localhost:3000/academic"
echo ""

# Start the dev server
bun run dev
