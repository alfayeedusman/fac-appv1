#!/bin/bash

# Optimized build script for large projects
# Handles memory management and progressive builds

echo "🔨 Starting optimized build..."

# Set memory limit based on available RAM
export NODE_OPTIONS="--max_old_space_size=8192 --max-http-header-size=16384"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Build client with incremental approach
echo "📦 Building client application..."
npm run build:client

if [ $? -ne 0 ]; then
  echo "❌ Client build failed"
  exit 1
fi

# Build server
echo "📦 Building server..."
npm run build:server

if [ $? -ne 0 ]; then
  echo "❌ Server build failed"
  exit 1
fi

echo "✅ Build completed successfully!"
