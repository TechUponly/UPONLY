#!/bin/bash
# Script to synchronize UPONLY repository with GitHub

set -e

PROJECT_DIR="/Users/shamrai/Desktop/UPONLY"
cd "$PROJECT_DIR"

echo "🐙 Pushing UPONLY repository to GitHub (https://github.com/TechUponly/UPONLY.git)..."

git config user.name "TechUponly"
git config user.email "uponly.in@gmail.com"

git add .
if git diff-index --quiet HEAD --; then
    echo "ℹ️ No uncommitted changes."
else
    git commit -m "feat: UPONLY AI Agent & Business Automation Platform setup"
fi

echo "🚀 Pushing to main branch..."
git push -u origin main || git push -u origin master || echo "⚠️ Push failed. Ensure remote repository exists on GitHub and permissions are granted."
