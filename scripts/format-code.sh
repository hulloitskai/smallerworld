#!/usr/bin/env bash

# Format code after making changes
# Usage: ./scripts/format-code.sh

set -e

echo "🔧 Setting up environment..."

# Setup Node.js
export PATH="$HOME/.nodenv/bin:$PATH"
if command -v nodenv >/dev/null 2>&1; then
  eval "$(nodenv init -)"
fi

# Setup Ruby gems path
export PATH="$HOME/.local/share/gem/ruby/3.3.0/bin:$PATH"

echo "✨ Formatting frontend files (JS/TS/CSS/Markdown)..."
npx prettier --write '**/*.{js,jsx,ts,tsx,css,md,html,json,yaml,yml}' || {
  echo "⚠️ Prettier formatting failed, but continuing..."
}

echo "🧹 Running ESLint auto-fix..."
npx eslint --fix '**/*.{js,jsx,ts,tsx}' || {
  echo "⚠️ ESLint auto-fix failed, but continuing..."
}

echo "🚀 Trying full lefthook formatting..."
if command -v lefthook >/dev/null 2>&1; then
  lefthook run fix || {
    echo "⚠️ Lefthook failed (likely Ruby version mismatch), but frontend formatting completed"
  }
else
  echo "⚠️ Lefthook not available, using npm version..."
  npx lefthook run fix || {
    echo "⚠️ Lefthook failed, but frontend formatting completed"  
  }
fi

echo "✅ Formatting complete!"