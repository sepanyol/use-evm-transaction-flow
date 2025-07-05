#!/bin/bash

set -e

echo "🔄 Cleaning old build..."
rm -rf dist

echo "📦 Building with Vite..."
npm run build-for-publish

echo "📦 Cleaning public dir & copy new..."
if [ -d "./.build/npm/dist/" ]; then rm -Rf ./.build/npm/dist/; fi
mkdir -p ./.build/npm/dist/
cp -R ./dist/ ./.build/npm/dist/
cp ./.build/npm/LICENSE ./.build/npm/dist/
cp ./.build/npm/README.md ./.build/npm/dist/

echo "📦 Create custom package.json..."
npx ts-node ./scripts/generate-package-json.ts

echo "📦 Publishing to npm..."
npm publish ./.build/npm/dist/ --tag beta

echo "✅ Published successfully!"