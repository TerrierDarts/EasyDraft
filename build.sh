#!/bin/bash
# Build script for EasyDraft

echo "🔨 Building EasyDraft..."
echo ""

# Build frontend (Vite)
echo "📦 Building frontend..."
npm run build

# Build Electron app
echo "⚡ Building Electron app..."
npm run dist

echo ""
echo "✅ Build complete! Installers are in the 'out/' directory"
echo ""
echo "To distribute, upload the .exe file to GitHub Releases or your distribution server."
